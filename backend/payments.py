"""Razorpay payment integration — order creation, verification, webhook handling."""

import hashlib
import hmac
import os
import uuid
from datetime import datetime, timezone
from typing import Optional


def _now() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)

import razorpay
from fastapi import APIRouter, Header, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy import Column, DateTime, Integer, String, create_engine
from sqlalchemy.orm import DeclarativeBase, Session

# ---------------------------------------------------------------------------
# Database setup
# ---------------------------------------------------------------------------

_DB_PATH = os.environ.get(
    "PAYMENTS_DB_PATH",
    os.path.join(os.path.dirname(__file__), "payments.db"),
)
_engine = create_engine(f"sqlite:///{_DB_PATH}", connect_args={"check_same_thread": False})


class _Base(DeclarativeBase):
    pass


class PaymentRecord(_Base):
    __tablename__ = "payments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, nullable=False, index=True)
    razorpay_order_id = Column(String, nullable=False, unique=True, index=True)
    razorpay_payment_id = Column(String, nullable=True)
    razorpay_signature = Column(String, nullable=True)
    amount_paise = Column(Integer, nullable=False)
    currency = Column(String, nullable=False, default="INR")
    # status: created | paid | failed
    status = Column(String, nullable=False, default="created")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


def init_db():
    _Base.metadata.create_all(_engine)


def _get_db() -> Session:
    return Session(_engine)


# ---------------------------------------------------------------------------
# Razorpay client
# ---------------------------------------------------------------------------

def _razorpay_client() -> razorpay.Client:
    key_id = os.environ.get("RAZORPAY_KEY_ID")
    key_secret = os.environ.get("RAZORPAY_KEY_SECRET")
    if not key_id or not key_secret:
        raise HTTPException(
            status_code=503,
            detail="Razorpay credentials not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
        )
    return razorpay.Client(auth=(key_id, key_secret))


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------

DRAFT_PRICE_PAISE = 199900  # ₹1,999 in paise


class CreateOrderRequest(BaseModel):
    session_id: str


class CreateOrderResponse(BaseModel):
    order_id: str
    amount: int
    currency: str
    key_id: str


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class VerifyPaymentResponse(BaseModel):
    paid: bool
    session_id: str


class PaymentStatusResponse(BaseModel):
    session_id: str
    status: str
    paid: bool


# ---------------------------------------------------------------------------
# Router
# ---------------------------------------------------------------------------

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post(
    "/create-order",
    response_model=CreateOrderResponse,
    summary="Create a Razorpay order for the application draft (₹1,999)",
)
def create_order(req: CreateOrderRequest) -> CreateOrderResponse:
    client = _razorpay_client()
    order_data = {
        "amount": DRAFT_PRICE_PAISE,
        "currency": "INR",
        "receipt": f"tanaai_{req.session_id[:16]}",
        "payment_capture": 1,
    }
    try:
        order = client.order.create(order_data)
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"Razorpay order creation failed: {exc}")

    with _get_db() as db:
        record = PaymentRecord(
            id=str(uuid.uuid4()),
            session_id=req.session_id,
            razorpay_order_id=order["id"],
            amount_paise=DRAFT_PRICE_PAISE,
            currency="INR",
            status="created",
            created_at=_now(),
            updated_at=_now(),
        )
        db.add(record)
        db.commit()

    key_id = os.environ.get("RAZORPAY_KEY_ID", "")
    return CreateOrderResponse(
        order_id=order["id"],
        amount=DRAFT_PRICE_PAISE,
        currency="INR",
        key_id=key_id,
    )


@router.post(
    "/verify",
    response_model=VerifyPaymentResponse,
    summary="Verify Razorpay payment signature after client-side checkout",
)
def verify_payment(req: VerifyPaymentRequest) -> VerifyPaymentResponse:
    key_secret = os.environ.get("RAZORPAY_KEY_SECRET")
    if not key_secret:
        raise HTTPException(status_code=503, detail="Razorpay credentials not configured.")

    expected_signature = hmac.new(
        key_secret.encode("utf-8"),
        f"{req.razorpay_order_id}|{req.razorpay_payment_id}".encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()

    if not hmac.compare_digest(expected_signature, req.razorpay_signature):
        raise HTTPException(status_code=400, detail="Payment signature verification failed.")

    with _get_db() as db:
        record = db.query(PaymentRecord).filter_by(
            razorpay_order_id=req.razorpay_order_id
        ).first()
        if record is None:
            raise HTTPException(status_code=404, detail="Order not found.")

        record.razorpay_payment_id = req.razorpay_payment_id
        record.razorpay_signature = req.razorpay_signature
        record.status = "paid"
        record.updated_at = _now()
        db.commit()
        session_id = record.session_id

    return VerifyPaymentResponse(paid=True, session_id=session_id)


@router.post(
    "/webhook",
    summary="Razorpay webhook receiver for payment.captured events",
    status_code=200,
)
async def webhook(request: Request, x_razorpay_signature: Optional[str] = Header(None)):
    webhook_secret = os.environ.get("RAZORPAY_WEBHOOK_SECRET")
    body = await request.body()

    if webhook_secret and x_razorpay_signature:
        expected = hmac.new(
            webhook_secret.encode("utf-8"),
            body,
            hashlib.sha256,
        ).hexdigest()
        if not hmac.compare_digest(expected, x_razorpay_signature):
            raise HTTPException(status_code=400, detail="Webhook signature invalid.")
    elif webhook_secret and not x_razorpay_signature:
        raise HTTPException(status_code=400, detail="Missing Razorpay signature header.")

    import json
    try:
        payload = json.loads(body)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload.")

    event = payload.get("event")
    if event != "payment.captured":
        return {"received": True}

    payment_entity = payload.get("payload", {}).get("payment", {}).get("entity", {})
    order_id = payment_entity.get("order_id")
    payment_id = payment_entity.get("id")

    if not order_id:
        return {"received": True}

    with _get_db() as db:
        record = db.query(PaymentRecord).filter_by(
            razorpay_order_id=order_id
        ).first()
        if record and record.status != "paid":
            record.razorpay_payment_id = payment_id
            record.status = "paid"
            record.updated_at = _now()
            db.commit()

    return {"received": True}


@router.get(
    "/status/{session_id}",
    response_model=PaymentStatusResponse,
    summary="Check payment status for a user session",
)
def payment_status(session_id: str) -> PaymentStatusResponse:
    with _get_db() as db:
        record = (
            db.query(PaymentRecord)
            .filter_by(session_id=session_id)
            .order_by(PaymentRecord.created_at.desc())
            .first()
        )

    if record is None:
        return PaymentStatusResponse(session_id=session_id, status="not_found", paid=False)

    return PaymentStatusResponse(
        session_id=session_id,
        status=record.status,
        paid=record.status == "paid",
    )
