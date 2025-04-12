import time
import requests

def translate_text(text, target_lang, preserve_names=False):
    if not text.strip():
        return "Error: Input text is empty."

    api_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
    # Replace with your actual API key securely loaded (e.g., from an environment variable)
    api_key = "AIzaSyDm6Sea886eqCLV5tVhXFryuHNDrEczeJI"
    params = {"key": api_key}

    # Build prompt instructions with very strict formatting requirements:
    # 1. Exactly preserve newline structure and formatting.
    # 2. Ensure that the output contains one translated line per input line.
    # 3. Do not add any extra explanation or commentary.
    # 4. Preserve proper names if requested.
    if target_lang.lower() in ["en", "eng", "english"]:
        prompt_text = (
            "Transliterate the following Telugu text into Latin script (romanized) "
            "ensuring you preserve the exact line breaks and formatting. Each output "
            "line must directly correspond to each input line without mixing lines. "
            "Do not provide any extra explanation or commentary.\n\n" 
            + text
        )
    elif target_lang.lower() in ["hi", "hindi"]:
        prompt_text = (
            "Translate the following Telugu text into Hindi while strictly preserving "
            "the original newline breaks and formatting. Each output line must be a direct "
            "translation of the corresponding input line. Do not mix or combine lines, "
            "and provide no additional commentary. If there are proper names (for example, "
            "'Nenu'), leave them unchanged.\n\n" 
            + text
        )
    else:
        prompt_text = (
            f"Translate the following Telugu text into {target_lang} while strictly preserving "
            "the original newline breaks and formatting. Each output line must be a direct "
            "translation of the corresponding input line without mixing or combining lines. "
            "Do not add any extra commentary or explanation.\n\n" 
            + text
        )

    # Append instruction to preserve proper names if the flag is set.
    if preserve_names:
        prompt_text += "\n\nDo not translate proper names; preserve them exactly as they appear."

    # Append a unique token to the prompt to ensure a fresh request each time.
    prompt_text += f"\n\nUniqueRef: {time.time()}"

    payload = {
        "contents": [{
            "parts": [{"text": prompt_text}]
        }]
    }
    headers = {"Content-Type": "application/json"}

    # Function to send the API request.
    def send_request():
        return requests.post(api_url, params=params, json=payload, headers=headers)

    try:
        response = send_request()
        # If not 200, wait a moment and try one more time in case of a transient error.
        if response.status_code != 200:
            time.sleep(1)
            response = send_request()

        # Debug logging: print the full API response (remove or secure in production)
        print("Full API response:", response.json())

        if response.status_code == 200:
            data = response.json()
            if "candidates" in data and data["candidates"]:
                candidate = data["candidates"][0]
                content = candidate.get("content", {})
                parts = content.get("parts", [])
                if parts and parts[0].get("text"):
                    translated = parts[0]["text"].strip()
                    return translated if translated else "Error: Translation output field is empty."
                else:
                    return "Error: Unexpected response structure—no text found."
            else:
                return "Error: Translation candidate not found in response."
        else:
            return f"Translation API error: {response.status_code} - {response.text}"
    except Exception as e:
        return f"Error during translation: {str(e)}"


if __name__ == "__main__":
    regional_text = (
        "Nenu Naa Illu Naa Inti Vaarandaru\n"
        "Maanaka Sthuthinchedamu (2)\n"
        "Nee Kanupaapa Vale Nannu Kaachi\n"
        "Nenu Chedaraka Mosaavu Sthothram (2)\n"
        "Ebinejare Ebinejare – Intha Kaalam Kaachithive\n"
        "Ebinejare Ebinejare – Naa Thoduvai Nadachithive (2)\n"
        "Sthothram Sthothram Sthothram – Kanupaapaga Kaachithivi Sthothram\n"
        "Sthothram Sthothram Sthothram – Kougililo Daachithivi Sthothram         ||Nenu||\n\n"
        "Edaarilo Unna Naa Jeevithamunu\n"
        "Melutho Nimpithive (2)\n"
        "Oka Keedaina Dari Cheraka Nannu\n"
        "Thandrigaa Kaachaavu Sthothram (2)          ||Ebinejare||\n\n"
        "Niraashatho Unna Naa Heena Brathukunu\n"
        "Nee Krupatho Nimpithive (2)\n"
        "Neevu Choopina Premanu Paadagaa\n"
        "Padamulu Saripovu Thandri (2)          ||Ebinejare||\n\n"
        "Gnaanula Madhyalo Nanu Pilachina Nee Pilupe\n"
        "Aascharyamaascharyame (2)\n"
        "Nee Paathranu Kaane Kaanu\n"
        "Kevalamu Nee Krupaye Sthothram (2)          ||Ebinejare||"
    )
    target_language = "hi"
    translation = translate_text(regional_text, target_language, preserve_names=True)
    print("Translated Output:")
    print(translation)
