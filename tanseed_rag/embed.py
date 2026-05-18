"""Embedding generation for TANSEED RAG Pipeline using sentence-transformers."""

from typing import List, Dict, Any
import numpy as np

from tanseed_rag.config import EMBEDDING_MODEL


class Embedder:
    """Generates embeddings using a local sentence-transformers model."""

    def __init__(self, model_name: str = EMBEDDING_MODEL):
        from sentence_transformers import SentenceTransformer
        self.model = SentenceTransformer(model_name)
        self.dim = self.model.get_sentence_embedding_dimension()
        print(f"[EMBED] Loaded model: {model_name} (dim={self.dim})")

    def encode(self, texts: List[str]) -> np.ndarray:
        """Encode a list of texts into embedding vectors."""
        return self.model.encode(texts, show_progress_bar=False)

    def encode_chunks(self, chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Encode chunks and add embeddings to each chunk dict."""
        texts = [c["text"] for c in chunks]
        embeddings = self.encode(texts)
        for chunk, emb in zip(chunks, embeddings):
            chunk["embedding"] = emb.tolist()
        print(f"[EMBED] Encoded {len(chunks)} chunks")
        return chunks
