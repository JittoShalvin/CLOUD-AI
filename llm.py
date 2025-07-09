from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
import os

# ✅ Step 1: Define a clean local path to store/load the model
model_id = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
local_dir = r"D:\\clousec\\llm\\local_tinyllama"

# ✅ Step 2: If not already downloaded, do it now (only needs internet once)
if not os.path.exists(os.path.join(local_dir, "config.json")):
    print("🔽 Downloading model and tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(model_id, cache_dir=local_dir)
    model = AutoModelForCausalLM.from_pretrained(model_id, cache_dir=local_dir)
    print("✅ Download complete.")
else:
    print("✅ Model already downloaded. Loading locally...")
    tokenizer = AutoTokenizer.from_pretrained(local_dir, local_files_only=True)
    model = AutoModelForCausalLM.from_pretrained(local_dir, local_files_only=True)

# ✅ Step 3: Create the generation pipeline
generator = pipeline("text-generation", model=model, tokenizer=tokenizer)

# ✅ Step 4: Give a CVE ID and generate a remediation response
prompt = "CVE-2021-44228 remediation steps:"
print(f"\n🧠 Prompt: {prompt}")
response = generator(prompt, max_new_tokens=100, do_sample=True, temperature=0.7)
print("\n💬 Response:\n", response[0]["generated_text"])
