"""Main pipeline orchestrator for TANSEED RAG."""

import os
from typing import List, Dict, Any, Optional

from tanseed_rag.ingest import ingest
from tanseed_rag.embed import Embedder
from tanseed_rag.vector_store import VectorStore
from tanseed_rag.config import GUIDELINES_PATH


class TanseedPipeline:
    """Orchestrates ingestion, embedding, and retrieval for TANSEED RAG."""

    def __init__(self, vector_store_dir: Optional[str] = None):
        self.embedder = Embedder()
        self.vector_store = VectorStore(persist_dir=vector_store_dir) if vector_store_dir else VectorStore()

    def build_index(self, file_path: str = GUIDELINES_PATH) -> int:
        """Load, chunk, embed, and store document."""
        print(f"[PIPELINE] Building index from {file_path}...")
        chunks = ingest(file_path)
        embedded_chunks = self.embedder.encode_chunks(chunks)
        self.vector_store.add_chunks(embedded_chunks)
        print(f"[PIPELINE] Index built with {self.vector_store.count()} chunks.")
        return self.vector_store.count()

    def query(self, query_text: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Query the vector store for relevant chunks."""
        query_embedding = self.embedder.encode([query_text])[0].tolist()
        hits = self.vector_store.query(query_embedding, top_k=top_k)
        return hits

    def get_context(self, query_text: str, top_k: int = 5) -> str:
        """Get relevant context as a single string."""
        hits = self.query(query_text, top_k=top_k)
        context = "\n\n".join([h["text"] for h in hits])
        return context
