import os
import sys
from google import genai

# --- Gemini API Setup ---
api_key = os.getenv("GEMINI_API_KEY")
if api_key is None:
    print("⚠️  GEMINI_API_KEY not set. Using hardcoded key (testing only).")
    api_key = "AIzaSyD6E5mgcn4tXCyPM7OCIYEFwnDJC2W-rEs"

client = genai.Client(api_key=api_key)
GEMINI_MODEL = "gemini-1.5-flash"

# --- Remediation Generator ---
def generate_remediation(finding):
    prompt = f"""
You are a senior cloud security engineer.

Given the AWS Inspector finding below, your task is to:

1. Explain the issue in plain language (1-2 lines).
2. Provide remediation steps with infrastructure-level commands and configurations:
   - AWS CLI commands (no console screenshots)
   - Linux config file edits (e.g. sshd_config, ufw)
   - IAM policy snippets or SG rules (JSON or commands)
   - CloudTrail / CloudWatch setups
3. Provide a workflow checklist a DevOps engineer can follow.
4. Focus ONLY on practical, technical output. NO general theory, policies, or training advice.

Output format:
---
Problem:
<short explanation>

Remediation:
1. <Command or config + explanation>
2. ...
(include code blocks with commands where needed)

Workflow:
- [ ] Step 1
- [ ] Step 2
- [ ] Step 3
...

Only output infrastructure-level, actionable content. Do not include commentary or intros.

Finding:
{finding}
"""
    try:
        response = client.models.generate_content(
            model=GEMINI_MODEL,
            contents=prompt
        )
        return response.text.strip()
    except Exception as e:
        return f"❌ Error generating response: {e}"

# --- CLI Entry Point ---
if __name__ == "__main__":
    print("🔐 AWS Inspector Infra-Level Remediation (via Gemini)")
    print("Paste your AWS Inspector finding and press Ctrl+D (Linux/macOS) or Ctrl+Z then Enter (Windows):\n")

    try:
        finding_input = sys.stdin.read().strip()
        if not finding_input:
            print("❌ No input provided.")
            sys.exit(1)

        print("\n🛠️ Generating Infrastructure Remediation...\n")
        result = generate_remediation(finding_input)
        print(result)

    except KeyboardInterrupt:
        print("\n❌ Cancelled by user.")
