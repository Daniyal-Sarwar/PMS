from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import logging
import uvicorn
import os
from pathlib import Path

from app.routers import general, patients

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Create the FastAPI app
app = FastAPI(
    title="Patient Management System API",
    description="Backend microservice API for managing patient data",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(general.router)
app.include_router(patients.router)

# Mount static files directory
static_dir = Path("static")
if not static_dir.exists():
    os.makedirs("static", exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

if __name__ == "__main__":
    logger.info("Starting Patient Management System API")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
