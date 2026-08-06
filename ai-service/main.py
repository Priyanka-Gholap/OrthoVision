from fastapi import FastAPI, Header, HTTPException, Security, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.config.settings import settings
from app.api import health

app = FastAPI(
    title="Flexion AI Service",
    description="Stateless Pose Analysis and Kinematics Range of Motion Calculation Engine",
    version="1.0.0",
    docs_url="/ai/docs",
    openapi_url="/ai/openapi.json"
)

# CORS configurations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Header security dependency for internal services communication
async def verify_service_key(x_ai_service_key: str = Header(None, alias="X-AI-SERVICE-KEY")):
    if not x_ai_service_key or x_ai_service_key != settings.AI_SERVICE_KEY:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized internal service access. Invalid or missing X-AI-SERVICE-KEY header."
        )
    return x_ai_service_key

# Attach routes
app.include_router(health.router, prefix="/ai", tags=["Infrastructure"])

@app.get("/")
async def root():
    return {
        "message": "Flexion AI API Service running.",
        "docs": "/ai/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=True)
