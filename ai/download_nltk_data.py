#!/usr/bin/env python3
"""
Script to download required NLTK data for CareVault AI service
"""

import ssl
import nltk
import sys

def download_nltk_data():
    """Download required NLTK corpora and models"""
    
    print("📥 Downloading NLTK data...")
    
    # Handle SSL certificate issues on macOS
    try:
        _create_unverified_https_context = ssl._create_unverified_context
    except AttributeError:
        pass
    else:
        ssl._create_default_https_context = _create_unverified_https_context
    
    # List of required NLTK data
    required_data = [
        'wordnet',
        'punkt', 
        'stopwords',
        'averaged_perceptron_tagger',
        'vader_lexicon'
    ]
    
    for data in required_data:
        try:
            print(f"  📦 Downloading {data}...")
            nltk.download(data, quiet=True)
            print(f"  ✅ {data} downloaded successfully")
        except Exception as e:
            print(f"  ❌ Failed to download {data}: {e}")
            return False
    
    print("🎉 All NLTK data downloaded successfully!")
    return True

if __name__ == "__main__":
    success = download_nltk_data()
    sys.exit(0 if success else 1)
