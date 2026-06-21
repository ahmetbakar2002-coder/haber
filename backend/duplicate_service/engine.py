import torch
from sentence_transformers import SentenceTransformer, util
from core.logger import logger

class DuplicateEngine:
    def __init__(self, model_name: str = "sentence-transformers/all-MiniLM-L6-v2"):
        logger.info(f"Loading embedding model: {model_name}")
        self.model = SentenceTransformer(model_name)
        # Assuming we keep recent articles in memory or load them from DB/Redis
        # For production with millions of articles, use a Vector DB (pgvector, Milvus, Redis)
        self.recent_embeddings = {} 

    def encode(self, text: str) -> torch.Tensor:
        return self.model.encode(text, convert_to_tensor=True)

    def check_duplicate(self, article_id: str, title: str, summary: str, threshold: float = 0.85) -> bool:
        text_to_encode = f"{title} {summary}"
        new_embedding = self.encode(text_to_encode)
        
        is_duplicate = False
        
        # Simple brute-force comparison for the mock.
        for existing_id, existing_emb in self.recent_embeddings.items():
            cosine_scores = util.cos_sim(new_embedding, existing_emb)
            if cosine_scores.item() >= threshold:
                logger.info(f"Duplicate found! {article_id} is similar to {existing_id} (Score: {cosine_scores.item():.2f})")
                is_duplicate = True
                break
                
        if not is_duplicate:
            self.recent_embeddings[article_id] = new_embedding
            
        return is_duplicate
