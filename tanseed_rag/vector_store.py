"""ChromaDB vector storage and retrieval for TANSEED RAG Pipeline."""

import os
from typing import List, Dict, Any, Optional

import chromadb
from chromadb.config import Settings

from tanseed_rag.config import VECTOR_STORE_DIR, COLLECTION_NAME, TOP_K


class VectorStore:
    """Manages ChromaDB vector storage and similarity search."""

    def __init__(
        self,
        persist_dir: str = VECTOR_STORE_DIR,
        collection_name: str = COLLECTION_NAME,
    ):
        self.persist_dir = persist_dir
        self.collection_name = collection_name

        os.makedirs(persist_dir, exist_ok=True)

        self.client = chromadb.PersistentClient(
            path=persist_dir,
            settings=Settings(anonymized_telemetry=False),
        )

        self.collection = self.client.get_or_create_collection(
            name=collection_name,
            metadata={"hnsw:space": "cosine"},
        )
        print(f"[STORE] Using collection '{collection_name}' at {persist_dir}")

    def add_chunks(self, chunks: List[Dict[str, Any]]) -> None:
        """Add embedded chunks to the vector store."""
        ids = [c["id"] for c in chunks]
        documents = [c["text"] for c in chunks]
        embeddings = [c["embedding"] for c in chunks]
        metadatas = [c.get("metadata", {}) for c in chunks]

        # Delete existing if re-ingesting
        try:
            self.collection.delete(ids=ids)
        except Exception:
            pass

        self.collection.add(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas,
        )
        print(f"[STORE] Added {len(chunks)} chunks to '{self.collection_name}'")

    def query(
        self,
        query_embedding: List[float],
        top_k: int = TOP_K,
        where: Optional[Dict] = None,
    ) -> List[Dict[str, Any]]:
        """Search for similar chunks by embedding vector."""
        kwargs: Dict[str, Any] = {
            "query_embeddings": [query_embedding],
            "n_results": top_k,
            "include": ["documents", "metadatas", "distances"],
        }
        if where:
            kwargs["where"] = where

        results = self.collection.query(**kwargs)

        hits = []
        for i in range(len(results["ids"][0])):
            hits.append({
                "id": results["ids"][0][i],
                "text": results["documents"][0][i],
                "metadata": results["metadatas"][0][i],
                "distance": results["distances"][0][i],
                "score": 1.0 - results["distances"][0][i],  # cosine similarity
            })
        return hits

    def count(self) -> int:
        """Return number of chunks in the store."""
        return self.collection.count()

    def reset(self) -> None:
        """Delete and recreate the collection."""
        try:
            self.client.delete_collection(self.collection_name)
        except Exception:
            pass
        self.collection = self.client.get_or_create_collection(
            name=self.collection_name,
            metadata={"hnsw:space": "cosine"},
        )
        print(f"[STORE] Reset collection '{self.collection_name}'")
