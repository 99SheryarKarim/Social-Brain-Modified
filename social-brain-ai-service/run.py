"""
Run script for Social Brain AI Service
Usage: python run.py
"""
import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "SocialBrain.api:app",
        host="localhost",
        port=8000,
        reload=True  # Auto-reload on code changes
    )
