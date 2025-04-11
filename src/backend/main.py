from flask import Flask, request, render_template, jsonify, send_file
from lyrics_processor import process_lyrics
from translator import translate_text
import io
from docx import Document
from translator import AdvancedTranslator
app = Flask(__name__, 
            template_folder="../frontend/templates",  # Corrected template folder
            static_folder="../frontend/static")  # Corrected static folder

@app.route("/")
def index():
    return render_template("index.html")  # Ensure index.html is inside 'templates/'

@app.route("/main")
def main_page():
    return render_template("main.html")  # Ensure main.html is inside 'templates/'

@app.route("/preview")
def preview():
    return render_template("/preview")  # Ensure the file exists in 'templates/'

# ========================================================
# ENDPOINT: Process Lyrics (OFFLINE FUNCTIONALITY)
# Cleans, normalizes, and merges lyrics from two language inputs.
# Returns merged lyrics in JSON format.
# ========================================================
@app.route("/process_lyrics", methods=["POST"])
def process_lyrics_route():
    data = request.json
    first_language = data.get("firstLanguage", "").strip()
    second_language = data.get("secondLanguage", "").strip()

    if not first_language or not second_language:
        return jsonify({"error": "Both lyrics fields must contain text."}), 400

    try:
        merged = process_lyrics(first_language, second_language)
        return jsonify({"mergedLyrics": merged})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ========================================================
# ENDPOINT: Export Merged Lyrics (OFFLINE FUNCTIONALITY)
# Exports the merged lyrics as a DOCX file.
# ========================================================
@app.route("/export", methods=["POST"])
def export_lyrics():
    merged_lyrics = request.json.get("mergeLyrics", "")
    
    if not merged_lyrics:
        return jsonify({"error": "No lyrics to export."}), 400

    document = Document()
    for line in merged_lyrics.splitlines():
        document.add_paragraph(line)

    f = io.BytesIO()
    document.save(f)
    f.seek(0)
    return send_file(
        f,
        as_attachment=True,
        download_name="merged_lyrics.docx",
        mimetype="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )

# ========================================================
# ENDPOINT: Translation (Only Works Online)
# If online, calls Gemini API; otherwise, returns an error.
# ========================================================
@app.route("/translate", methods=["POST"])
def translate_route():
    data = request.json
    source_text = data.get("text", "").strip()
    target_lang = data.get("targetLang", "en")

    if not source_text:
        return jsonify({"error": "Text is required for translation."}), 400

    translation = translate_text(source_text, target_lang)
    return jsonify({"translation": translation})

# ========================================================
# RUN FLASK SERVER
# Debug mode enabled for development purposes.
# ========================================================
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
