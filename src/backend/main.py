import os
from flask import Flask, request, render_template, jsonify, send_file
from translator import translate_text
import io
from docx import Document

# Set up directories for templates and static files
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_DIR = os.path.join(BASE_DIR, "../frontend/templates")
STATIC_DIR = os.path.join(BASE_DIR, "../frontend/static")

app = Flask(__name__, template_folder=TEMPLATE_DIR, static_folder=STATIC_DIR)

@app.route("/")
def index():
    return render_template("index.html")  # Ensure index.html is in the templates directory

@app.route("/main")
def main_page():
    return render_template("main.html")  # Ensure main.html is in the templates directory

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

@app.route("/translate", methods=["POST"])
def translate_route():
    data = request.json
    source_text = data.get("text", "").strip()
    target_lang = data.get("targetLang", "en")  # Default target language is English

    if not source_text:
        return jsonify({"error": "Text is required for translation."}), 400

    translation = translate_text(source_text, target_lang)
    return jsonify({"translation": translation})

if __name__ == "__main__":
    print("Starting Flask server on 0.0.0.0:5000")
    app.run(debug=True, host="0.0.0.0", port=5000)
