from pydantic import BaseModel, Field, computed_field, field_validator
from typing import Annotated, Literal, Optional
from app.utils.id_generator import IDGenerator
from app.utils.data_handler import load_data, save_data

class Patient(BaseModel):
    """
    Patient model representing all the patient information required
    
    Attributes:
        name: Name of the patient
        age: Age of the patient (between 0 and 120)
        height: Height of the patient in cm
        weight: Weight of the patient in kg
        city: City of the patient
        gender: Gender of the patient (Male, Female, Other)
    """    
    name: Annotated[str, Field(..., description="Name of the patient", examples=["John Doe"], max_length=30)]
    age: Annotated[int, Field(..., description="Age of the patient", ge=0, le=120, examples=[25, 30])]
    height: Annotated[float, Field(..., description="Height of the patient in cm", gt=0, examples=[170.5, 180.0])]
    weight: Annotated[float, Field(..., description="Weight of the patient in kg", gt=0, examples=[70.0, 80.5])]
    city: Annotated[str, Field(..., description="City of the patient", examples=["New York", "Los Angeles"], max_length=50)]
    gender: Annotated[Literal["Male", "Female", "Other"], Field(..., description="Gender of the patient", examples=["Male", "Female", "Other"], max_length=8)]
    
    # Private attribute to store the ID
    _id: Optional[str] = None
    
    @computed_field
    @property
    def patient_id(self) -> str:
        """
        Generate a unique patient ID using the IDGenerator.
        Uses a cached value if already generated.
        
        Returns:
            str: A unique patient ID with the format P{random_digits}
        """
        if self._id is None:
            id_generator = IDGenerator()
            id_generator.load_used_ids()
            self._id = id_generator.generate_id()
        return self._id
    
    @field_validator("patient_id")
    @classmethod
    def validate_patient_id(cls, v: str) -> str:
        """
        Ensure patient_id starts with 'P' followed by digits.
        
        Args:
            v (str): The patient ID to validate
            
        Returns:
            str: Validated patient ID
        """
        if not v.startswith("P"):
            raise ValueError("Patient ID must start with 'P'.")
        return v
    

    @computed_field
    @property
    def bmi(self) -> float:
        """Calculate BMI based on height and weight."""
        return round(self.weight / ((self.height / 100) ** 2), 2)
    
    @computed_field
    @property
    def verdict(self) -> str:
        """Determine the verdict based on BMI."""
        if self.bmi < 18.5:
            return "Underweight"
        elif 18.5 <= self.bmi < 24.9:
            return "Healthy"
        elif 25 <= self.bmi < 29.9:
            return "Overweight"
        else:
            return "Obese"

class PatientUpdate(BaseModel):
    """
    Model for updating patient information
    
    All fields are optional since only fields that need updating will be provided
    """
    name: Annotated[Optional[str], Field(None, max_length=30, description="Name of the patient", examples=["John Doe"])]
    age: Annotated[Optional[int], Field(None, ge=0, le=120, description="Age of the patient", examples=[25, 30])]
    height: Annotated[Optional[float], Field(None, gt=0, description="Height of the patient in cm", examples=[170.5, 180.0])]
    weight: Annotated[Optional[float], Field(None, gt=0, description="Weight of the patient in kg", examples=[70.0, 80.5])]
    city: Annotated[Optional[str], Field(None, max_length=50, description="City of the patient", examples=["New York", "Los Angeles"])]
    gender: Annotated[Optional[Literal["Male", "Female", "Other"]], Field(None, max_length=8, description="Gender of the patient", examples=["Male", "Female", "Other"])]
