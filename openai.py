import os
import sys
import openai

# --- Setup OpenRouter ---
openai.api_key = os.getenv("OPENROUTER_API_KEY") or "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"
openai.base_url = "https://openrouter.ai/api/v1"

MODEL = "openai/gpt-3.5-turbo"  # You can change to any OpenRouter-supported model

def generate_remediation(finding):
    prompt = f"""
You are a senior cloud security engineer.

Given the AWS Inspector finding below, do the following:

1. Explain the issue (1–2 lines)
2. Provide detailed infrastructure-level remediation (commands, configs)
3. Output a DevOps-friendly checklist using markdown checkboxes

Use only practical, technical steps.

Finding:
{finding}
"""
    try:
        response = openai.chat.completions.create(
            model=MODEL,
            messages=[
                {"role": "system", "content": "You are a cloud security expert."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.4,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"❌ Error: {e}"

if __name__ == "__main__":
    print("🔐 AWS Infra Remediation Generator (OpenRouter)")
    print("Paste your AWS Inspector finding. Press Ctrl+D (Linux/macOS) or Ctrl+Z then Enter (Windows):\n")

    try:
        finding = sys.stdin.read().strip()
        if not finding:
            print("❌ No input provided.")
            sys.exit(1)

        print("\n🛠️ Generating Infra-Level Remediation...\n")
        result = generate_remediation(finding)
        print(result)

    except KeyboardInterrupt:
        print("\n❌ Cancelled by user.")
