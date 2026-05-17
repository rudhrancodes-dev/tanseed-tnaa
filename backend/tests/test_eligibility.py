"""Tests for the /eligibility, /health, and /ingest endpoints."""

import pytest
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient


def _make_client():
    import backend.main as main_module
    # Patch pipeline/checker so tests don't need sentence-transformers loaded
    mock_checker = MagicMock()
    mock_checker.check_eligibility.return_value = {
        "overall_status": "PASS",
        "recommendation": "The startup appears to be eligible for the TANSEED grant. Proceed to application.",
        "checks": {
            "registration_type": {"status": "PASS", "value": "private limited", "justification": "Must be Private Limited, LLP, or Partnership Firm."},
            "location": {"status": "PASS", "value": "chennai, tamil nadu", "justification": "Must be registered in Tamil Nadu."},
            "indian_ownership_pct": {"status": "PASS", "value": 75.0, "justification": "Must be ≥ 51%."},
            "avg_profit_3yr_lakhs": {"status": "PASS", "value": 1.5, "justification": "Must be < ₹5L."},
            "recognition": {"status": "PASS", "value": "TANSIM=True, DPIIT=True", "justification": "Both required."},
        },
    }
    main_module._checker = mock_checker
    mock_pipeline = MagicMock()
    mock_pipeline.vector_store.count.return_value = 10
    main_module._pipeline = mock_pipeline
    from fastapi.testclient import TestClient
    return TestClient(main_module.app)


client = _make_client()


def base_payload(**overrides):
    data = {
        "company_name": "TechStartup Pvt Ltd",
        "registration_type": "Private Limited",
        "sector": "Agritech",
        "location": "Chennai, Tamil Nadu",
        "indian_ownership_pct": 75.0,
        "avg_profit_3yr_lakhs": 1.5,
        "tansim_registration": True,
        "dpiit_recognition": True,
        "description": "An AI-driven platform for crop disease detection using satellite imagery.",
    }
    data.update(overrides)
    return data


def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert "rag_ready" in body
    assert "vector_store_chunks" in body


def test_eligible_startup():
    r = client.post("/eligibility", json=base_payload())
    assert r.status_code == 200
    body = r.json()
    assert body["eligible"] is True
    assert body["overall_status"] == "PASS"
    assert body["rag_grounded"] is True
    assert "checks" in body
    assert "recommendation" in body


def test_response_schema_fields():
    r = client.post("/eligibility", json=base_payload())
    body = r.json()
    for field in ("eligible", "overall_status", "checks", "recommendation", "rag_grounded"):
        assert field in body


def test_missing_field_returns_422():
    r = client.post("/eligibility", json={"company_name": "Test"})
    assert r.status_code == 422


def test_short_description_returns_422():
    r = client.post("/eligibility", json=base_payload(description="Short"))
    assert r.status_code == 422


def test_fallback_rule_based_when_no_rag(monkeypatch):
    """When _checker is None, rule-based fallback is used."""
    import backend.main as main_module
    monkeypatch.setattr(main_module, "_checker", None)
    r = client.post("/eligibility", json=base_payload())
    assert r.status_code == 200
    body = r.json()
    assert body["rag_grounded"] is False
    assert "checks" in body


def test_ingest_returns_500_without_pipeline(monkeypatch):
    import backend.main as main_module
    monkeypatch.setattr(main_module, "_pipeline", None)
    r = client.post("/ingest", json={})
    assert r.status_code == 500


def test_ingest_with_pipeline():
    import backend.main as main_module
    main_module._pipeline.build_index.return_value = 37
    r = client.post("/ingest", json={})
    assert r.status_code == 200
    body = r.json()
    assert body["chunks_indexed"] == 37
    assert "37 chunks" in body["message"]
