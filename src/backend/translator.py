import time
import requests

def translate_text(text, target_lang, preserve_names=False):
    if not text.strip():
        return "Error: Input text is empty."

    # Replace this with secure API key management (e.g., loading from an environment variable)
    api_key = "AIzaSyBCaB5edK3u7vKzsGC6owljSEosKXXnY4I"
    api_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
    params = {"key": api_key}

    # When target language is English, we want romanization (i.e. transliteration) of Telugu text.
    if target_lang.lower() in ["en", "eng", "english"]:
        prompt_text = (
            "Transliterate the following Telugu text into a Latin (romanized) form. "
            "Ensure that the original phonetics are preserved and output only the romanized text, line-by-line exactly as is.\n\n"
            + text
        )
    elif target_lang.lower() in ["hi", "hindi"]:
        prompt_text = (
            "Translate the following Telugu text into Hindi without any explanation. "
            "Output only the translated text. If there are proper names like 'Nenu', leave them unchanged.\n\n"
            + text
        )
    else:
        # For any other target language, perform a full translation from Telugu.
        prompt_text = (
            f"Translate the following Telugu text into {target_lang} without any explanation. "
            "Output only the translated text exactly line-by-line.\n\n" + text
        )

    if preserve_names:
        prompt_text += "\n\nDo not translate proper names; preserve them exactly as they appear."

    # Append a unique token based on the current time to force a fresh translation on every request.
    prompt_text += f"\n\nUniqueRef: {time.time()}"

    payload = {
        "contents": [{
            "parts": [{"text": prompt_text}]
        }]
    }
    headers = {"Content-Type": "application/json"}

    def send_request():
        return requests.post(api_url, params=params, json=payload, headers=headers)

    try:
        response = send_request()
        if response.status_code != 200:
            # Retry once after a short pause
            time.sleep(1)
            response = send_request()

        if response.status_code == 200:
            data = response.json()
            candidates = data.get("candidates")
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                if parts and parts[0].get("text"):
                    return parts[0]["text"].strip()
                return "Error: Unexpected response structure—no text found."
            return "Error: Translation candidate not found in response."
        else:
            return f"Translation API error: {response.status_code} - {response.text}"
    except Exception as e:
        return f"Error during translation: {str(e)}"

if __name__ == "__main__":
    regional_text = (
        "ఆరాధన స్తుతి ఆరాధన (3)\n"
        "నీవంటి వారు ఒక్కరును లేరు\n"
        "నీవే అతి శ్రేష్టుడా\n"
        "దూత గణములు నిత్యము కొలిచే\n"
        "నీవే పరిశుద్దుడా\n"
        "నిన్నా నేడు మారని         ||ఆరాధన||\n\n"
        "అబ్రహాము ఇస్సాకును\n"
        "బలి ఇచ్చినారాధన\n"
        "రాళ్ళతో చంపబడిన\n"
        "స్తెఫను వలె ఆరాధన (2)\n\n"
        "ఆరాధన స్తుతి ఆరాధన (2)\n"
        "పదివేలలోన అతి సుందరుడా\n"
        "నీకే ఆరాధన\n"
        "ఇహ పరములోన ఆకాంక్షనీయుడా\n"
        "నీకు సాటెవ్వరు\n"
        "నిన్నా నేడు మారని        ||ఆరాధన||\n\n"
        "దానియేలు సింహపు బోనులో\n"
        "చేసిన ఆరాధన\n"
        "వీధులలో నాట్యమాడిన\n"
        "దావీదు ఆరాధన (2)\n\n"
        "ఆరాధన స్తుతి ఆరాధన (2)\n"
        "నీవంటి వారు ఒక్కరును లేరు\n"
        "నీవే అతి శ్రేష్టుడా\n"
        "దూత గణములు నిత్యము కొలిచే\n"
        "నీవే పరిశుద్దుడా\n"
        "నిన్నా నేడు మారని        ||ఆరాధన||"
    )
    target_language = "en"   # Use "en" for romanized transliteration
    translation = translate_text(regional_text, target_language, preserve_names=True)
    print("Translated Output:")
    print(translation)
