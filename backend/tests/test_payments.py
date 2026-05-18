"""Tests for the /payments/* endpoints."""

import hashlib
import hmac
import os
import uuid
import json
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(autouse=True)
def _env(tmp_path, monkeypatch):
    monkeypatch.setenv("RAZORPAY_KEY_ID", "rzp_test_key")
    monkeypatch.setenv("RAZORPAY_KEY_SECRET", "test_secret")
    monkeypatch.setenv("RAZORPAY_WEBHOOK_SECRET", "webhook_secret")
    db_path = str(tmp_path / "test_payments.db")
    monkeypatch.setenv("PAYMENTS_DB_PATH", db_path)


@pytest.fixture()
def client(_env):
    # Re-import with fresh DB path
    import importlib
    import backend.payments as pm
    importlib.reload(pm)

    import backend.main as main_module
    importlib.reload(main_module)

    pm.init_db()
    return TestClient(main_module.app)


# ---------------------------------------------------------------------------
# create-order
# ---------------------------------------------------------------------------

def test_create_order_success(client):
    fake_order = {"id": "order_testABC", "amount": 199900, "currency": "INR"}
    with patch("razorpay.Client") as mock_cls:
        mock_instance = MagicMock()
        mock_instance.order.create.return_value = fake_order
        mock_cls.return_value = mock_instance

        r = client.post("/payments/create-order", json={"session_id": "sess_001"})

    assert r.status_code == 200
    body = r.json()
    assert body["order_id"] == "order_testABC"
    assert body["amount"] == 199900
    assert body["currency"] == "INR"
    assert body["key_id"] == "rzp_test_key"


def test_create_order_missing_session_id(client):
    r = client.post("/payments/create-order", json={})
    assert r.status_code == 422


# ---------------------------------------------------------------------------
# verify
# ---------------------------------------------------------------------------

def _make_signature(order_id: str, payment_id: str, secret: str = "test_secret") -> str:
    msg = f"{order_id}|{payment_id}".encode()
    return hmac.new(secret.encode(), msg, hashlib.sha256).hexdigest()


def _seed_order(client, session_id: str = "sess_001", order_id: str = "order_testABC"):
    fake_order = {"id": order_id, "amount": 199900, "currency": "INR"}
    with patch("razorpay.Client") as mock_cls:
        mock_instance = MagicMock()
        mock_instance.order.create.return_value = fake_order
        mock_cls.return_value = mock_instance
        client.post("/payments/create-order", json={"session_id": session_id})


def test_verify_valid_signature(client):
    order_id = "order_testABC"
    payment_id = "pay_123"
    _seed_order(client, order_id=order_id)
    sig = _make_signature(order_id, payment_id)

    r = client.post("/payments/verify", json={
        "razorpay_order_id": order_id,
        "razorpay_payment_id": payment_id,
        "razorpay_signature": sig,
    })

    assert r.status_code == 200
    body = r.json()
    assert body["paid"] is True
    assert body["session_id"] == "sess_001"


def test_verify_bad_signature(client):
    order_id = "order_testABC"
    _seed_order(client, order_id=order_id)

    r = client.post("/payments/verify", json={
        "razorpay_order_id": order_id,
        "razorpay_payment_id": "pay_123",
        "razorpay_signature": "bad_sig",
    })

    assert r.status_code == 400


def test_verify_unknown_order(client):
    sig = _make_signature("order_unknown", "pay_123")
    r = client.post("/payments/verify", json={
        "razorpay_order_id": "order_unknown",
        "razorpay_payment_id": "pay_123",
        "razorpay_signature": sig,
    })
    assert r.status_code == 404


# ---------------------------------------------------------------------------
# webhook
# ---------------------------------------------------------------------------

def _webhook_body(order_id: str, payment_id: str) -> bytes:
    payload = {
        "event": "payment.captured",
        "payload": {
            "payment": {
                "entity": {
                    "id": payment_id,
                    "order_id": order_id,
                }
            }
        }
    }
    return json.dumps(payload).encode()


def _webhook_sig(body: bytes, secret: str = "webhook_secret") -> str:
    return hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()


def test_webhook_payment_captured(client):
    order_id = "order_webhook1"
    payment_id = "pay_webhook1"
    _seed_order(client, session_id="sess_wh", order_id=order_id)

    body = _webhook_body(order_id, payment_id)
    sig = _webhook_sig(body)

    r = client.post(
        "/payments/webhook",
        content=body,
        headers={"Content-Type": "application/json", "x-razorpay-signature": sig},
    )
    assert r.status_code == 200
    assert r.json() == {"received": True}


def test_webhook_bad_signature(client):
    body = _webhook_body("order_x", "pay_x")
    r = client.post(
        "/payments/webhook",
        content=body,
        headers={"Content-Type": "application/json", "x-razorpay-signature": "bad"},
    )
    assert r.status_code == 400


def test_webhook_ignores_other_events(client):
    payload = json.dumps({"event": "order.paid"}).encode()
    sig = _webhook_sig(payload)
    r = client.post(
        "/payments/webhook",
        content=payload,
        headers={"Content-Type": "application/json", "x-razorpay-signature": sig},
    )
    assert r.status_code == 200
    assert r.json() == {"received": True}


# ---------------------------------------------------------------------------
# status
# ---------------------------------------------------------------------------

def test_status_not_found(client):
    r = client.get("/payments/status/nonexistent_session")
    assert r.status_code == 200
    body = r.json()
    assert body["paid"] is False
    assert body["status"] == "not_found"


def test_status_after_verification(client):
    order_id = "order_status1"
    payment_id = "pay_status1"
    _seed_order(client, session_id="sess_stat", order_id=order_id)
    sig = _make_signature(order_id, payment_id)
    client.post("/payments/verify", json={
        "razorpay_order_id": order_id,
        "razorpay_payment_id": payment_id,
        "razorpay_signature": sig,
    })

    r = client.get("/payments/status/sess_stat")
    assert r.status_code == 200
    body = r.json()
    assert body["paid"] is True
    assert body["status"] == "paid"
