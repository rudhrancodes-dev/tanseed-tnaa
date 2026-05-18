"""Configuration for TANSEED RAG Pipeline."""

import os

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
GUIDELINES_PATH = os.path.join(DATA_DIR, "guidelines.md")
VECTOR_STORE_DIR = os.path.join(BASE_DIR, "vector_db")

# Embedding model — lightweight, runs locally
EMBEDDING_MODEL = "all-MiniLM-L6-v2"

# Chunking
CHUNK_SIZE = 512
CHUNK_OVERLAP = 64

# Vector store
COLLECTION_NAME = "tanseed_guidelines"

# Retrieval
TOP_K = 5

# Eligibility criteria keys
ELIGIBILITY_FIELDS = [
    "registration_type",
    "location",
    "tansim_registration",
    "dpiit_recognition",
    "indian_ownership_pct",
    "business_formation",
    "avg_profit_3yr_lakhs",
    "no_govt_dues",
    "not_blacklisted",
    "innovation_stage",
    "incubation_months",
    "sector",
    "patents_or_trl",
]
