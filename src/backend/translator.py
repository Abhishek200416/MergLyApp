import time
import os
import re
import logging
import requests
from dotenv import load_dotenv
load_dotenv()

__all__ = ['translate_text', 'AdvancedTranslator']

# Configure logging.
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()]
)

# Global settings.
MAX_RETRIES = 3
INITIAL_BACKOFF = 1.0  # seconds

def exponential_backoff_retry(func):
    """Decorator to retry a function call with exponential backoff."""
    def wrapper(*args, **kwargs):
        retries = 0
        backoff = INITIAL_BACKOFF
        while retries < MAX_RETRIES:
            try:
                return func(*args, **kwargs)
            except requests.HTTPError as e:
                retries += 1
                logging.warning("Retry %d/%d: %s", retries, MAX_RETRIES, e)
                if retries >= MAX_RETRIES:
                    logging.error("Max retries reached. Aborting.")
                    raise
                time.sleep(backoff)
                backoff *= 2
    return wrapper

class AdvancedTranslator:
    def __init__(self):
        # Retrieve the API key from the environment variable.
        self.api_key = os.environ.get("GENERATIVE_LANGUAGE_API_KEY")
        if not self.api_key:
            raise ValueError("API key not found. Set the GENERATIVE_LANGUAGE_API_KEY environment variable.")
        self.api_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
        self.session = requests.Session()
        self.headers = {"Content-Type": "application/json"}
        self.params = {"key": self.api_key}

    def _build_prompt(self, text, target_lang):
        """
        Constructs a minimal prompt that instructs the API to translate 
        exactly one output line per input line with no extra words.
        """
        if target_lang.lower() in ["en", "eng", "english"]:
            prompt = (
                "Transliterate the following text into Latin script (romanized) exactly, "
                "one output line per input line with no extra words:\n\n" + text
            )
        elif target_lang.lower() in ["hi", "hindi"]:
            prompt = (
                "Translate the following Telugu text into Hindi exactly, "
                "one output line per input line with no extra words. Preserve proper names:\n\n" + text
            )
        else:
            prompt = (
                f"Translate the following Telugu text into {target_lang} exactly, "
                "one output line per input line with no extra words:\n\n" + text
            )
        return prompt

    def _clean_output(self, output):
        return output.strip()

    @exponential_backoff_retry
    def _send_request(self, payload):
        logging.debug("Sending API payload: %s", payload)
        response = self.session.post(
            self.api_url, params=self.params, json=payload, headers=self.headers, timeout=10
        )
        if response.status_code != 200:
            # Raise an HTTPError for a failed request.
            raise requests.HTTPError(f"HTTP {response.status_code} - {response.text}")
        return response.json()

    def translate_text(self, text, target_lang):
        """
        Sends the translation or transliteration request and returns the cleaned output.
        Expects input text with one line per lyric; output maintains the same line separation.
        """
        if not text.strip():
            return "Error: Input text is empty."
        prompt_text = self._build_prompt(text, target_lang)
        payload = {"contents": [{"parts": [{"text": prompt_text}]}]}
        data = self._send_request(payload)
        if "candidates" in data and data["candidates"]:
            candidate = data["candidates"][0]
            content = candidate.get("content", {})
            parts = content.get("parts", [])
            if parts and parts[0].get("text"):
                return self._clean_output(parts[0]["text"])
            else:
                return "Error: No text found in the response."
        return "Error: No valid translation candidate."

def translate_text(text, target_lang):
    """
    Module-level helper function to translate lyrics.
    """
    translator = AdvancedTranslator()
    return translator.translate_text(text, target_lang)

if __name__ == "__main__":
    sample = (
        "Nenu Naa Illu Naa Inti Vaarandaru\n"
        "Maanaka Sthuthinchedamu (2)\n"
        "Nee Kanupaapa Vale Nannu Kaachi"
    )
    print("Translated Output:")
    print(translate_text(sample, "hi"))
