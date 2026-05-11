from flask import Flask, render_template, request, jsonify, redirect, url_for, session
from dotenv import load_dotenv
from gemini.parser import get_trace
from auth.supabase_client import supabase
import os

load_dotenv()

app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "dev-secret-key")

# ── Auth helpers ──────────────────────────────────────────────────
def get_current_user():
    return session.get("user")

def login_required(f):
    from functools import wraps
    @wraps(f)
    def decorated(*args, **kwargs):
        if not get_current_user():
            return redirect(url_for("login"))
        return f(*args, **kwargs)
    return decorated

# ── Auth routes ───────────────────────────────────────────────────
@app.route("/login", methods=["GET", "POST"])
def login():
    if get_current_user():
        return redirect(url_for("index"))
    if request.method == "POST":
        email    = request.form.get("email")
        password = request.form.get("password")
        try:
            res = supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            session["user"] = {
                "id":    res.user.id,
                "email": res.user.email,
                "token": res.session.access_token
            }
            return redirect(url_for("index"))
        except Exception as e:
            return render_template("login.html", error="Invalid email or password.")
    return render_template("login.html")

@app.route("/register", methods=["GET", "POST"])
def register():
    if get_current_user():
        return redirect(url_for("index"))
    if request.method == "POST":
        email    = request.form.get("email")
        password = request.form.get("password")
        try:
            res = supabase.auth.sign_up({
                "email": email,
                "password": password
            })
            session["user"] = {
                "id":    res.user.id,
                "email": res.user.email,
                "token": res.session.access_token
            }
            return redirect(url_for("index"))
        except Exception as e:
            print("REGISTER ERROR:", str(e))
            return render_template("register.html", error=str(e))
    return render_template("register.html")

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))

# ── Main pages ────────────────────────────────────────────────────
@app.route("/")
@login_required
def index():
    return render_template("index.html", user=get_current_user())

@app.route("/tree")
@login_required
def tree():
    return render_template("tree.html", user=get_current_user())

@app.route("/linkedlist")
@login_required
def linkedlist():
    return render_template("linkedlist.html", user=get_current_user())

@app.route("/dashboard")
@login_required
def dashboard():
    user = get_current_user()
    try:
        res = supabase.table("practice_sessions") \
            .select("*") \
            .eq("user_id", user["id"]) \
            .order("created_at", desc=True) \
            .limit(50) \
            .execute()
        sessions = res.data
    except Exception:
        sessions = []
    return render_template("dashboard.html", user=user, sessions=sessions)

# ── API routes ────────────────────────────────────────────────────
@app.route("/api/trace", methods=["POST"])
@login_required
def trace():
    data       = request.get_json()
    code       = data.get("code",  "").strip()
    test_input = data.get("input", "").strip()

    if not code or not test_input:
        return jsonify({"error": "Both code and input are required"}), 400

    try:
        result = get_trace(code, test_input)
        if isinstance(result, dict) and "error" in result:
            return jsonify(result), 500
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/save-session", methods=["POST"])
@login_required
def save_session():
    user = get_current_user()
    data = request.get_json()
    try:
        supabase.table("practice_sessions").insert({
            "user_id":     user["id"],
            "type":        data.get("type", "array"),
            "algorithm":   data.get("algorithm", "unknown"),
            "input_data":  data.get("input_data", ""),
            "steps_count": data.get("steps_count", 0),
            "completed":   data.get("completed", False)
        }).execute()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)