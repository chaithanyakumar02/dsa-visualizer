from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from gemini.parser import get_trace
import os

load_dotenv()

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")
@app.route("/tree")
def tree():
    return render_template("tree.html")
@app.route("/api/trace", methods=["POST"])
def trace():
    data = request.get_json()
    code       = data.get("code", "").strip()
    test_input = data.get("input", "").strip()

    if not code or not test_input:
        return jsonify({"error": "Both code and input are required"}), 400

    try:
        result = get_trace(code, test_input)
        if isinstance(result, dict) and "error" in result:
            return jsonify(result), 500
        return jsonify({"steps": result})
    except Exception as e:
        print("ERROR:", str(e))
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
