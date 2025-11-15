# ai/utils/summarizer.py
import re
from nltk.tokenize import sent_tokenize

# Simple extractive summarizer: picks sentences containing keywords
KEYWORDS = [
    "allergy", "allergies", "allergic", "medication", "medications",
    "diabetes", "hypertension", "pain", "unconscious", "asthma",
    "heart", "stroke", "allergic reaction", "seizure"
]

def simple_emergency_summary(text, max_sentences=3):
    """
    Very small heuristic summarizer:
     - tokenizes into sentences
     - ranks sentences by number of keyword hits
     - returns top sentences joined
    """
    if not text or not isinstance(text, str):
        return "No text provided."

    sents = sent_tokenize(text)
    if len(sents) <= max_sentences:
        return " ".join(sents)

    def score_sentence(s):
        s_lower = s.lower()
        score = 0
        for kw in KEYWORDS:
            if kw in s_lower:
                score += 1
        # small boost for short sentences with many keywords
        return score

    ranked = sorted(sents, key=lambda s: (score_sentence(s), len(s)), reverse=True)
    top = ranked[:max_sentences]
    return " ".join(top)
