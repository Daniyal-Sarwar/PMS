import os
import sys
from pathlib import Path

# Get the absolute path to the backend directory
backend_dir = Path(__file__).parent.parent.absolute()

# Add the backend directory to the Python path
sys.path.insert(0, str(backend_dir))

from app.models.patient import Patient


def test_patient_model():
    """Test the Patient model"""
    # Create a patient
    patient = Patient(
        name="John Doe",
        age=30,
        height=180.0,
        weight=80.0,
        city="New York",
        gender="Male"
    )
    
    # Test BMI calculation
    assert patient.bmi == 24.69, f"Expected BMI of 24.69, got {patient.bmi}"
    
    # Test verdict calculation
    assert patient.verdict == "Healthy", f"Expected verdict of Healthy, got {patient.verdict}"
    
    print("All tests passed!")
