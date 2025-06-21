import json
import os
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

# Define the path to the patients.json file in the data directory
PATIENTS_FILE = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "patients.json")

def load_data() -> Dict[str, Any]:
    """
    Load patient data from the JSON file
    
    Returns:
        Dict[str, Any]: Dictionary containing patient data
    """
    try:
        # Ensure the data directory exists
        data_dir = os.path.dirname(PATIENTS_FILE)
        if not os.path.exists(data_dir):
            os.makedirs(data_dir)
            logger.info(f"Created data directory: {data_dir}")
        
        # Check if the file exists, if not create an empty one
        if not os.path.exists(PATIENTS_FILE):
            logger.warning(f"Patients file not found at {PATIENTS_FILE}, creating empty file")
            with open(PATIENTS_FILE, "w") as f:
                f.write("{}")
            return {}
            
        # Read the existing file
        with open(PATIENTS_FILE, "r") as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading data: {str(e)}")
        return {}

def save_data(data: Dict[str, Any]) -> bool:
    """
    Save patient data to the JSON file
    
    Args:
        data (Dict[str, Any]): Dictionary containing patient data
    
    Returns:
        bool: True if saved successfully, False otherwise
    """
    try:
        # Ensure the data directory exists
        data_dir = os.path.dirname(PATIENTS_FILE)
        if not os.path.exists(data_dir):
            os.makedirs(data_dir)
            logger.info(f"Created data directory: {data_dir}")
            
        with open(PATIENTS_FILE, "w") as f:
            json.dump(data, f, indent=4)
        return True
    except Exception as e:
        logger.error(f"Error saving data: {str(e)}")
        return False

def get_patient(patient_id: str) -> Optional[Dict[str, Any]]:
    """
    Get a patient by ID
    
    Args:
        patient_id (str): Patient ID
        
    Returns:
        Optional[Dict[str, Any]]: Patient data or None if not found
    """
    data = load_data()
    return data.get(patient_id)
