import re

def clean_line(line):
    """
    Cleans a single line of lyrics by removing unwanted patterns,
    punctuation, numbers, and extra whitespace.
    """
    line = re.sub(r'\[.*?\]', '', line)
    line = re.sub(r'["\'“”‘’]+', '', line)
    line = re.sub(r'\d+', '', line)
    line = re.sub(r'[\\/]', '', line)
    line = re.sub(r'–|—|-', '', line)
    line = re.sub(r',', '', line)
    line = re.sub(r'\.+', '', line)
    line = re.sub(r'- .*', '', line)
    line = re.sub(r'\|\|.*?\|\|', '', line)
    line = re.sub(r'\(.*?\)', '', line)
    line = re.sub(r'\s{2,}', ' ', line)
    return line.strip()

def normalize_lines(text):
    """
    Splits the text into lines, cleans each line, and removes empties.
    Also collapses multiple newlines into one for a consistent output.
    """
    lines = text.splitlines()
    cleaned = [clean_line(line) for line in lines if clean_line(line)]
    normalized_text = "\n".join(cleaned)
    return re.sub(r'\n{3,}', '\n\n', normalized_text).splitlines()

def process_lyrics(first_language, second_language):
    """
    Processes two sets of lyrics and merges them line-by-line.
    The merging logic accounts for different lengths and ensures that
    only non-empty lines are combined.
    """
    first_lines = normalize_lines(first_language)
    second_lines = normalize_lines(second_language)

    if not first_lines or not second_lines:
        raise ValueError("Both lyrics fields must contain text.")

    merged_lines = []
    max_lines = max(len(first_lines), len(second_lines))
    for i in range(max_lines):
        line1 = first_lines[i] if i < len(first_lines) else ""
        line2 = second_lines[i] if i < len(second_lines) else ""
        if line1 or line2:
            merged_lines.append(f"{line1}\n{line2}")
    return "\n".join(merged_lines)
