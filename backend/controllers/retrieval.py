from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
import os
import json
import unicodedata
import re

def normalize_text(text):
    text = text.lower()
    text = ''.join(
        c for c in unicodedata.normalize('NFD', text)
        if unicodedata.category(c) != 'Mn'
    )
    text = re.sub(r'[^\w\s]', '', text)
    return text

def get_text_for_embedding(chunk):
    # Use content field if exists and not empty
    if "content" in chunk and chunk["content"].strip() != "":
        return chunk["content"]
    else:
        # Compose meaningful text from known fields
        parts = []
        if "nom" in chunk:
            parts.append(f"Nom: {chunk['nom']}")
        if "type" in chunk:
            parts.append(f"Type: {chunk['type']}")
        if "adresse" in chunk:
            parts.append(f"Adresse: {chunk['adresse']}")
        if "telephone" in chunk:
            parts.append(f"Téléphone: {chunk['telephone']}")
        if "fax" in chunk:
            parts.append(f"Fax: {chunk['fax']}")
        if "email" in chunk:
            parts.append(f"Email: {chunk['email']}")
        if "code_agence" in chunk:
            parts.append(f"Code Agence: {chunk['code_agence']}")
        if "latitude" in chunk and "longitude" in chunk:
            parts.append(f"Coordinates: {chunk['latitude']}, {chunk['longitude']}")
        return ", ".join(parts)

# Load your knowledge base JSON chunks
def load_knowledge_base(path="data/split_knowledge_base"):
    all_chunks = []
    for filename in os.listdir(path):
        if filename.endswith(".json"):
            full_path = os.path.join(path, filename)
            with open(full_path, encoding="utf-8") as f:
                chunks = json.load(f)
                if isinstance(chunks, list):
                    all_chunks.extend(chunks)
                    print(f"Loaded {len(chunks)} chunks from {filename}")
    print(f"Total chunks loaded: {len(all_chunks)}")
    return all_chunks


KNOWLEDGE_BASE = load_knowledge_base()

class Retriever:
    def __init__(self, kb=KNOWLEDGE_BASE, embed_model_name="all-MiniLM-L6-v2",
                 index_file="faiss.index", emb_file="embeddings.npy"):
        self.kb = kb
        self.embed_model = SentenceTransformer(embed_model_name)
        self.index_file = index_file
        self.emb_file = emb_file

        if os.path.exists(index_file) and os.path.exists(emb_file):
            print("[INFO] Loading existing FAISS index and embeddings...")
            self.index = faiss.read_index(index_file)
            self.embeddings = np.load(emb_file)
        else:
            print("[INFO] Creating embeddings and FAISS index from knowledge base...")
            texts = [normalize_text(get_text_for_embedding(chunk)) for chunk in kb]
            self.embeddings = self.embed_model.encode(texts, convert_to_numpy=True)
            self.index = faiss.IndexFlatL2(self.embeddings.shape[1])
            self.index.add(self.embeddings)
            faiss.write_index(self.index, index_file)
            np.save(emb_file, self.embeddings)
            print("[INFO] FAISS index and embeddings saved.")

    def retrieve(self, query, top_k=5):
        query_emb = self.embed_model.encode([normalize_text(query)], convert_to_numpy=True)
        distances, indices = self.index.search(query_emb, top_k)
        results = [self.kb[i] for i in indices[0]]
        return results

# Create a global retriever instance (load or build index on startup)
retriever = Retriever()
