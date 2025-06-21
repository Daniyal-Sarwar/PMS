import uuid
import logging
from typing import Set
from app.utils.data_handler import load_data

logger = logging.getLogger(__name__)

class IDGenerator:
    def __init__(self, prefix: str = "P", use_short: bool = True):
        """
        Initialize the ID generator
        
        Args:
            prefix: String prefix for the ID (default: "P")
            use_short: Whether to use short UUID format (default: True)
        """
        self.prefix = prefix
        self.use_short = use_short
        self.used_ids: Set[str] = set()
        
    def load_used_ids(self) -> None:
        data = load_data()
        self.used_ids = {key for key in data.keys() if key.startswith(self.prefix)}
        logger.info(f"Loaded {len(self.used_ids)} used IDs from data file")
        
    def generate_id(self) -> str:
        """
        Generate a unique patient ID using UUID.
        
        Returns:
            str: A unique ID with the format {prefix}{uuid}
        """
        self.load_used_ids()
        
        while True:
            if self.use_short:
                # Generate a shorter ID (first 8 chars of UUID)
                id_part = str(uuid.uuid4())[:8]
            else:
                # Use full UUID
                id_part = str(uuid.uuid4())
                
            patient_id = f"{self.prefix}{id_part}"
            
            if patient_id not in self.used_ids:
                self.used_ids.add(patient_id)
                logger.info(f"Generated new patient ID: {patient_id}")
                return patient_id