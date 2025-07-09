from flask import Flask, request, jsonify
from flask_cors import CORS
from gemeni import generate_remediation

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

@app.route("/api/remediate", methods=["POST"])
def remediate():
    data = request.get_json()
    finding = data.get("finding", "")
    result = generate_remediation(finding)
    return jsonify({"remediation": result})

if __name__ == "__main__":
    app.run(debug=True)
