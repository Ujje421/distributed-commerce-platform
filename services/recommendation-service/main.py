from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
from prometheus_client import make_asgi_app
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
import uvicorn
import json
from kafka_consumer import start_kafka_consumer

app = FastAPI(title="Recommendation Service", description="AI/ML Recommendation Engine")

@app.on_event("startup")
def startup_event():
    start_kafka_consumer()

metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

# In-memory mock product catalog for TF-IDF
mock_products = [
    {"id": "prod-1", "name": "Wireless Noise Cancelling Headphones", "category": "Electronics", "description": "High quality over-ear headphones"},
    {"id": "prod-2", "name": "Bluetooth Earbuds", "category": "Electronics", "description": "Compact wireless earbuds"},
    {"id": "prod-3", "name": "Running Shoes", "category": "Footwear", "description": "Lightweight breathable sneakers"},
    {"id": "prod-4", "name": "Yoga Mat", "category": "Fitness", "description": "Non-slip eco-friendly yoga mat"},
]

df = pd.DataFrame(mock_products)
df['content'] = df['name'] + " " + df['category'] + " " + df['description']

vectorizer = TfidfVectorizer(stop_words='english')
tfidf_matrix = vectorizer.fit_transform(df['content'])
cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)

class ProductEvent(BaseModel):
    id: str
    name: str
    category: str
    description: str

@app.post("/api/v1/recommendations/products")
def add_product(event: ProductEvent):
    """Webhook/Internal endpoint to add a new product to the AI model"""
    global df, tfidf_matrix, cosine_sim
    
    new_data = pd.DataFrame([event.dict()])
    new_data['content'] = new_data['name'] + " " + new_data['category'] + " " + new_data['description']
    
    df = pd.concat([df, new_data], ignore_index=True)
    
    # Retrain
    tfidf_matrix = vectorizer.fit_transform(df['content'])
    cosine_sim = cosine_similarity(tfidf_matrix, tfidf_matrix)
    
    return {"status": "success", "message": f"Product {event.id} added to model"}

@app.get("/api/v1/recommendations/{product_id}")
def get_similar_products(product_id: str, limit: int = 5):
    """Get content-based recommendations given a product ID"""
    if product_id not in df['id'].values:
        return {"productId": product_id, "recommendations": []}

    idx = df.index[df['id'] == product_id].tolist()[0]
    sim_scores = list(enumerate(cosine_sim[idx]))
    sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
    
    # Get top N similar (excluding itself)
    sim_scores = sim_scores[1:limit+1]
    
    recommendations = []
    for i, score in sim_scores:
        product_rec = df.iloc[i]
        recommendations.append({
            "productId": product_rec['id'],
            "name": product_rec['name'],
            "score": round(float(score), 4),
            "reason": "content_similarity"
        })

    return {
        "targetProductId": product_id,
        "recommendations": recommendations
    }

@app.get("/health/liveness")
def liveness():
    return {"status": "UP"}

@app.get("/health/readiness")
def readiness():
    return {"status": "UP"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=3011, reload=True)

