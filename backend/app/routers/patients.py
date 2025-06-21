from fastapi import APIRouter, HTTPException, Path, Query
from fastapi.responses import JSONResponse
import logging
from typing import Dict, List, Any

from app.models.patient import Patient, PatientUpdate
from app.utils.data_handler import load_data, save_data
from app.utils.id_generator import IDGenerator

# Configure logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(
    prefix="/patients",
    tags=["patients"],
    responses={404: {"description": "Not found"}},
)

@router.get("/", response_model=Dict[str, Dict[str, Any]], summary="Get all patients")
async def get_all_patients():
    """
    Get all patients from the database.
    
    Returns:
        Dict[str, Dict[str, Any]]: Dictionary containing all patients
    """
    logger.info("Request to get all patients")
    data = load_data()
    return data

@router.get("/{patient_id}", summary="Get a specific patient by ID")
async def get_patient(
    patient_id: str = Path(..., description="The ID of the patient to get", example="P001")
):
    """
    Get a specific patient by ID.
    
    Args:
        patient_id (str): The ID of the patient to get
        
    Returns:
        Dict[str, Any]: Patient data
    
    Raises:
        HTTPException: If patient not found
    """
    logger.info(f"Request to get patient with ID: {patient_id}")
    data = load_data()
    
    if patient_id not in data:
        logger.warning(f"Patient with ID {patient_id} not found")
        raise HTTPException(status_code=404, detail="Patient not found")
    
    return data[patient_id]

@router.post("/", status_code=201, summary="Create a new patient")
async def create_patient(patient: Patient):
    """
    Create a new patient.
    
    Args:
        patient (Patient): Patient data
        
    Returns:
        JSONResponse: Response with message and patient ID
    
    Raises:
        HTTPException: If patient ID already exists
    """
    logger.info(f"Request to create new patient: {patient.name}")
    
    
    # Load existing data
    data = load_data()
    
    # Check if patient ID already exists
    if patient.patient_id in data:
        logger.warning(f"Patient ID {patient.patient_id} already exists")
        raise HTTPException(status_code=400, detail="Patient ID already exists")
    
    # Add the patient to the data
    data[patient.patient_id] = patient.model_dump(exclude={"id"})

    # Save the updated data
    save_data(data)

    logger.info(f"Patient created successfully with ID: {patient.patient_id}")
    return JSONResponse(
        status_code=201, 
        content={
            "message": "Patient created successfully",
            "patient_id": patient.patient_id
        }
    )

@router.put("/{patient_id}", summary="Update a patient")
async def update_patient(
    patient_id: str = Path(..., description="The ID of the patient to update", example="P001"),
    patient_update: PatientUpdate = None
):
    """
    Update a patient.
    
    Args:
        patient_id (str): The ID of the patient to update
        patient_update (PatientUpdate): Patient data to update
        
    Returns:
        JSONResponse: Response with message and patient ID
    
    Raises:
        HTTPException: If patient not found
    """
    logger.info(f"Request to update patient with ID: {patient_id}")
    
    # Load existing data
    data = load_data()
    
    # Check if patient exists
    if patient_id not in data:
        logger.warning(f"Patient with ID {patient_id} not found")
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Update the patient data
    existing_patient = data[patient_id]
    updated_patient = patient_update.model_dump(exclude_unset=True)
    
    for key, value in updated_patient.items():
        if value is not None:
            existing_patient[key] = value
    
    # Ensure the patient_id is preserved
    existing_patient["patient_id"] = patient_id
    
    # Recalculate BMI and verdict
    patient_obj = Patient(**existing_patient)
    existing_patient["bmi"] = patient_obj.bmi
    existing_patient["verdict"] = patient_obj.verdict
    
    # Save the updated data
    data[patient_id] = existing_patient
    save_data(data)
    
    logger.info(f"Patient with ID {patient_id} updated successfully")
    return JSONResponse(
        status_code=200, 
        content={
            "message": "Patient updated successfully", 
            "patient_id": patient_id
        }
    )

@router.delete("/{patient_id}", summary="Delete a patient")
async def delete_patient(
    patient_id: str = Path(..., description="The ID of the patient to delete", example="P001")
):
    """
    Delete a patient.
    
    Args:
        patient_id (str): The ID of the patient to delete
        
    Returns:
        JSONResponse: Response with message and patient ID
    
    Raises:
        HTTPException: If patient not found
    """
    logger.info(f"Request to delete patient with ID: {patient_id}")
    
    # Load existing data
    data = load_data()
    
    # Check if patient exists
    if patient_id not in data:
        logger.warning(f"Patient with ID {patient_id} not found")
        raise HTTPException(status_code=404, detail="Patient not found")
    
    # Delete the patient
    del data[patient_id]
    
    # Save the updated data
    save_data(data)
    
    logger.info(f"Patient with ID {patient_id} deleted successfully")
    return JSONResponse(
        status_code=200, 
        content={
            "message": "Patient deleted successfully", 
            "patient_id": patient_id
        }
    )

@router.get("/search/", summary="Search patients by name")
async def search_patients(name: str = Query(..., description="Name to search for", example="John Doe")):
    """
    Search patients by name.
    
    Args:
        name (str): Name to search for
        
    Returns:
        List[Dict[str, Any]]: List of matching patients
    
    Raises:
        HTTPException: If no patients found
    """
    logger.info(f"Request to search patients with name: {name}")
    
    # Load existing data
    data = load_data()
    
    # Find patients matching the name
    matching_patients = [patient for patient in data.values() if name.lower() in patient.get("name", "").lower()]
    if not matching_patients:
        logger.warning(f"No patients found with name: {name}")
        raise HTTPException(status_code=404, detail="No patients found")
    logger.info(f"Found {len(matching_patients)} patients with name: {name}")
    return matching_patients

@router.get("/sort/", summary="Sort patients by a field")
async def sort_patients(
    sort: str = Query(..., description="Field to sort by (bmi, height, weight)", example="bmi"),
    order: str = Query("asc", description="Sort order (asc, desc)", example="asc")
):
    """
    Sort patients by a field.
    
    Args:
        sort (str): Field to sort by
        order (str): Sort order (asc, desc)
        
    Returns:
        List[Dict[str, Any]]: Sorted list of patients
    
    Raises:
        HTTPException: If invalid sort field or order
    """
    logger.info(f"Request to sort patients by {sort} in {order} order")
    
    # Define valid fields
    valid_fields = ["height", "weight", "bmi"]
    
    # Check if sort field is valid
    if sort not in valid_fields:
        logger.warning(f"Invalid sort field: {sort}")
        raise HTTPException(status_code=400, detail="Invalid sort field")
    
    # Check if order is valid
    if order not in ["asc", "desc"]:
        logger.warning(f"Invalid sort order: {order}")
        raise HTTPException(status_code=400, detail="Invalid sort order")
    
    # Load existing data
    data = load_data()
    
    # Sort the data
    sort_order = True if order == "desc" else False
    sorted_data = sorted(data.values(), key=lambda x: x.get(sort, 0), reverse=sort_order)
    
    logger.info(f"Sorted patients by {sort} in {order} order")
    return sorted_data
