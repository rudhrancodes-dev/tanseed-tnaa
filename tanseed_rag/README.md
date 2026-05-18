# TANSEED RAG Pipeline

A RAG (Retrieval-Augmented Generation) pipeline for parsing TANSEED grant guidelines and performing eligibility checks.

## Structure

```
tanseed_rag/
├── __init__.py
├── config.py              # Configuration constants
├── ingest.py              # Document ingestion & chunking
├── embed.py               # Embedding generation
├── vector_store.py        # ChromaDB vector storage & retrieval
├── eligibility.py         # Eligibility checking engine
├── pipeline.py            # Main pipeline orchestrator
├── cli.py                 # CLI entry point
├── requirements.txt       # Dependencies
└── data/
    └── guidelines.md      # TANSEED guidelines (knowledge base)
```

## Usage

```bash
# Ingest documents and build vector store
python -m tanseed_rag.cli ingest --file ../TANSEED_CRITERIA.md

# Check eligibility
python -m tanseed_rag.cli check --input user_data.json

# Query guidelines
python -m tanseed_rag.cli query "What are the eligibility criteria?"
```
