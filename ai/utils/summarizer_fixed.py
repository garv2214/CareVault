"""
Simple emergency summary generator without NLTK dependencies
"""

import re
import json
from datetime import datetime

def simple_emergency_summary(health_data):
    """
    Generate a simple emergency summary from health data
    without requiring NLTK dependencies
    """
    
    if not health_data:
        return "No health data available for emergency summary."
    
    summary_parts = []
    
    # Extract key information
    if isinstance(health_data, dict):
        patient_id = health_data.get('patientId', 'Unknown')
        timestamp = health_data.get('timestamp', datetime.now().isoformat())
        
        summary_parts.append(f"EMERGENCY SUMMARY - Patient ID: {patient_id}")
        summary_parts.append(f"Generated: {timestamp}")
        summary_parts.append("")
        
        # Extract symptoms
        symptoms = health_data.get('symptoms', [])
        if symptoms:
            summary_parts.append(f"SYMPTOMS: {', '.join(symptoms)}")
        
        # Extract diagnosis
        diagnosis = health_data.get('diagnosis', 'Not specified')
        if diagnosis != 'Not specified':
            summary_parts.append(f"DIAGNOSIS: {diagnosis}")
        
        # Extract medications
        medications = health_data.get('medications', [])
        if medications:
            summary_parts.append(f"MEDICATIONS: {', '.join(medications)}")
        
        # Extract allergies
        allergies = health_data.get('allergies', [])
        if allergies:
            summary_parts.append(f"ALLERGIES: {', '.join(allergies)}")
        
        # Extract vital signs
        vital_signs = health_data.get('vitalSigns', {})
        if vital_signs:
            summary_parts.append("VITAL SIGNS:")
            for key, value in vital_signs.items():
                summary_parts.append(f"  {key}: {value}")
        
        # Extract emergency contacts
        emergency_contacts = health_data.get('emergencyContacts', [])
        if emergency_contacts:
            summary_parts.append("EMERGENCY CONTACTS:")
            for contact in emergency_contacts:
                name = contact.get('name', 'Unknown')
                phone = contact.get('phone', 'Unknown')
                summary_parts.append(f"  {name}: {phone}")
    
    elif isinstance(health_data, str):
        # If it's a string, treat as free text
        summary_parts.append("EMERGENCY SUMMARY")
        summary_parts.append(f"Generated: {datetime.now().isoformat()}")
        summary_parts.append("")
        summary_parts.append(f"HEALTH NOTES: {health_data}")
    
    else:
        summary_parts.append("EMERGENCY SUMMARY")
        summary_parts.append(f"Generated: {datetime.now().isoformat()}")
        summary_parts.append("")
        summary_parts.append("Data format not recognized.")
    
    return "\n".join(summary_parts)

def generate_health_risk_summary(patient_data):
    """
    Generate a simple health risk summary
    """
    if not patient_data:
        return "No patient data available for risk assessment."
    
    summary = []
    summary.append("HEALTH RISK ASSESSMENT")
    summary.append("=" * 30)
    summary.append("")
    
    if isinstance(patient_data, dict):
        # Age-based risk
        age = patient_data.get('age', 0)
        if age > 65:
            summary.append("⚠️  HIGH RISK: Senior patient (65+)")
        elif age > 45:
            summary.append("⚠️  MODERATE RISK: Middle-aged patient (45-65)")
        else:
            summary.append("✅ LOWER RISK: Younger patient (<45)")
        
        # Medical conditions
        conditions = patient_data.get('medicalConditions', [])
        if conditions:
            summary.append(f"📋 CONDITIONS: {', '.join(conditions)}")
        
        # Recent symptoms
        symptoms = patient_data.get('recentSymptoms', [])
        if symptoms:
            summary.append(f"🤒 SYMPTOMS: {', '.join(symptoms)}")
    
    return "\n".join(summary)

def format_for_emergency_access(health_data):
    """
    Format health data for emergency access display
    """
    formatted = simple_emergency_summary(health_data)
    formatted += "\n\n" + "=" * 50
    formatted += "\n⚠️  EMERGENCY ACCESS GRANTED"
    formatted += "\n⚠️  This information is accessed during emergency situations"
    formatted += "\n⚠️  Regular access controls are bypassed for life-saving purposes"
    
    return formatted

# Test function
if __name__ == "__main__":
    test_data = {
        "patientId": "P12345",
        "symptoms": ["chest pain", "shortness of breath"],
        "diagnosis": "Possible cardiac event",
        "medications": ["aspirin", "metoprolol"],
        "allergies": ["penicillin"],
        "age": 55,
        "timestamp": datetime.now().isoformat()
    }
    
    print("Testing emergency summary:")
    print(simple_emergency_summary(test_data))
    print("\nTesting risk assessment:")
    print(generate_health_risk_summary(test_data))
