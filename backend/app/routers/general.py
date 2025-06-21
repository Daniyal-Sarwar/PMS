from fastapi import APIRouter, HTTPException
import logging
from fastapi.responses import RedirectResponse
from fastapi.responses import FileResponse
import os
from pathlib import Path


# Configure logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(
    tags=["general"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", summary="Root endpoint")
async def read_root():
    """
    Root endpoint for the API.
    
    Returns:
        Dict[str, str]: Welcome message
    """
    logger.info("Request to root endpoint")
    return {"message": "Welcome to the Patient Management System API"}

@router.get("/api-docs")
async def get_docs():
    return RedirectResponse(url="/docs")

@router.get("/about", summary="About endpoint")
async def about():
    """
    About endpoint for the API.
    
    Returns:
        Dict[str, str]: Information about the API
    """
    logger.info("Request to about endpoint")
    return {
        "message": "Patient Management System API",
        "version": "1.0.0",
        "description": "API for managing patient data"
    }

@router.get("/health", summary="Health check endpoint")
async def health_check():
    """
    Health check endpoint for the API.
    
    Returns:
        Dict[str, str]: Health status
    """
    try:
        # Check if data directory is accessible
        from app.utils.data_handler import load_data
        data = load_data()
        
        # System status checks
        import os
        data_dir_accessible = os.access('data', os.R_OK | os.W_OK)
        
        if not data_dir_accessible:
            logger.error("Data directory is not accessible")
            return {"status": "unhealthy", "reason": "Data directory not accessible"}
        
        return {"status": "healthy", "code" : 200, "message": "API is healthy"}
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return {"status": "unhealthy", "reason": str(e)}

@router.get("/favicon.ico", include_in_schema=False)
async def favicon():
    """
    Serve the favicon.ico file.
    
    Returns:
        FileResponse: The favicon.ico file
    """
    logger.info("Request for favicon.ico")
    # Check for favicon in frontend directory first
    frontend_path = Path("../frontend/favicon.ico")
    static_path = Path("static/favicon.ico")
    
    if frontend_path.exists():
        return FileResponse(frontend_path)
    elif static_path.exists():
        return FileResponse(static_path)
    else:
        # Create a static directory if it doesn't exist
        os.makedirs("static", exist_ok=True)
        # Return a default empty favicon to prevent 404 errors
        return FileResponse(Path(__file__).parent.parent.parent / "static" / "favicon.ico")
