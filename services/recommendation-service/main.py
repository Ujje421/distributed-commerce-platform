from fastapi import FastAPI
from prometheus_client import make_asgi_app
import uvicorn

app = FastAPI(title="Recommendation Service")

# Add prometheus asgi middleware to route /metrics requests
metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

@app.get("/health/liveness")
def liveness():
    return {"status": "UP"}

@app.get("/health/readiness")
def readiness():
    return {"status": "UP"}

@app.get("/api/v1/recommendations/{user_id}")
def get_recommendations(user_id: str, limit: int = 10):
    # Mock AI/ML response
    return {
        "userId": user_id,
        "recommendations": [
            {"productId": "prod-1", "score": 0.95, "reason": "collaborative_filtering"},
            {"productId": "prod-2", "score": 0.88, "reason": "trending"}
        ]
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=3011, reload=True)
