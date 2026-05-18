"""Document ingestion and chunking for TANSEED guidelines."""

import os
import re
from typing import List, Dict, Any

from tanseed_rag.config import CHUNK_SIZE, CHUNK_OVERLAP


def load_document(file_path: str) -> str:
    """Load a text/markdown document from disk."""
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> List[Dict[str, Any]]:
    """
    Split text into overlapping chunks with metadata.
    Tries to split on section boundaries (## headers) first,
    then falls back to paragraph/sentence splitting.
    """
    chunks = []

    # Split on markdown headers (## or ###)
    sections = re.split(r'\n(?=#{1,3} )', text)

    chunk_id = 0
    for section in sections:
        section = section.strip()
        if not section:
            continue

        # Extract section title
        title_match = re.match(r'^#{1,3} (.+)', section)
        section_title = title_match.group(1).strip() if title_match else "General"

        # If section fits in one chunk, add it
        if len(section) <= chunk_size:
            chunks.append({
                "id": f"chunk_{chunk_id}",
                "text": section,
                "metadata": {
                    "section": section_title,
                    "start_char": 0,
                    "end_char": len(section),
                }
            })
            chunk_id += 1
        else:
            # Split large sections into overlapping chunks
            start = 0
            while start < len(section):
                end = start + chunk_size
                chunk_text_val = section[start:end]

                # Try to break at sentence boundary
                if end < len(section):
                    last_period = chunk_text_val.rfind('. ')
                    if last_period > chunk_size // 2:
                        end = start + last_period + 1
                        chunk_text_val = section[start:end]

                chunks.append({
                    "id": f"chunk_{chunk_id}",
                    "text": chunk_text_val.strip(),
                    "metadata": {
                        "section": section_title,
                        "start_char": start,
                        "end_char": end,
                    }
                })
                chunk_id += 1
                start = end - overlap

    return chunks


def ingest(file_path: str) -> List[Dict[str, Any]]:
    """
    Full ingestion pipeline: load document -> chunk -> return chunks with metadata.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Document not found: {file_path}")

    text = load_document(file_path)
    chunks = chunk_text(text)

    print(f"[INGEST] Loaded {file_path}")
    print(f"[INGEST] Generated {len(chunks)} chunks")

    return chunks
