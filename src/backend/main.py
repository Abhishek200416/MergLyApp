from flask import Flask, request, render_template, jsonify, send_file
from flask_cors import CORS
from translator import translate_preserving_structure
import io
from docx import Document
import logging

app = Flask(__name__,
            template_folder="../frontend/templates",
            static_folder="../frontend/static")
CORS(app)

logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s [%(levelname)s] %(message)s")

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/main")
def main_page():
    return render_template("main.html")

@app.route("/export", methods=["POST"])
def export_lyrics():
    merged_lyrics = request.json.get("mergedLyrics", "")
    if not merged_lyrics:
        return jsonify({"error": "No lyrics to export."}), 400

    document = Document()
    for line in merged_lyrics.splitlines():
        document.add_paragraph(line)

    file_stream = io.BytesIO()
    document.save(file_stream)
    file_stream.seek(0)
    return send_file(
        file_stream,
        as_attachment=True,
        download_name="merged_lyrics.docx",
        mimetype="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    )

@app.route("/translate", methods=["POST"])
def translate_route():
    data = request.get_json()
    source_text = data.get("text", "")
    target_lang = data.get("targetLang", "te")  # Default to Telugu if none provided

    if not source_text.strip():
        return jsonify({"error": "Text is required for translation."}), 400

    try:
        translation = translate_preserving_structure(source_text, target_lang)
        return jsonify({"translation": translation})
    except Exception as e:
        logging.exception("Translation error")
        return jsonify({"error": "Translation failed.", "details": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
