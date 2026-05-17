# TANAAI Backend

FastAPI backend for the TANAAI eligibility API.

## Run locally

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

Server starts at `http://localhost:8000`.

## Endpoints

### GET /health
```bash
curl http://localhost:8000/health
# {"status":"ok"}
```

### POST /eligibility
```bash
curl -X POST http://localhost:8000/eligibility \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "FarmAI",
    "sector": "Agritech",
    "revenue": 80,
    "employees": 6,
    "description": "An AI platform for crop disease detection."
  }'
```

Response:
```json
{
  "eligible": true,
  "reasons": ["Startup meets basic TANSEED eligibility criteria."],
  "matching_schemes": ["TANSEED 3.0", "TANSEED Agri", "TANSEED Special"]
}
```

### Request schema

| Field          | Type   | Description                          |
| -------------- | ------ | ------------------------------------ |
| company_name   | string | Name of the startup                  |
| sector         | string | Industry sector (Agritech, etc.)     |
| revenue        | float  | Annual revenue in INR lakhs          |
| employees      | int    | Number of employees                  |
| description    | string | Brief description of the innovation  |

### Response schema

| Field            | Type        | Description                        |
| ---------------- | ----------- | ---------------------------------- |
| eligible         | bool        | Whether the startup is eligible    |
| reasons          | list[str]   | Reasons for pass/fail              |
| matching_schemes | list[str]   | TANSEED schemes the startup fits   |

## Tests

```bash
# from the project root (_default/)
python3 -m pytest backend/tests/ -v
```
