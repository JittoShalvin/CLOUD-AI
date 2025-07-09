from transformers import pipeline, AutoModelForCausalLM, AutoTokenizer

# Path to the locally saved model and tokenizer
model_path = "local_tinyllama/models--TinyLlama--TinyLlama-1.1B-Chat-v1.0/snapshots/fe8a4ea1ffedaf415f4da2f062534de366a451e6"

# Load tokenizer and model
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForCausalLM.from_pretrained(model_path)

# Load text generation pipeline
generator = pipeline("text-generation", model=model, tokenizer=tokenizer)

# Define function to generate structured remediation
def generate_remediation(finding, max_tokens=500, temperature=0.7):
    prompt = f"""
You are a cloud security expert. Analyze the following AWS Inspector finding and provide detailed, infrastructure-level remediation steps.

Finding: {finding}

Remediation:
1."""
    
    response = generator(
        prompt,
        max_new_tokens=max_tokens,
        do_sample=True,
        temperature=temperature,
        pad_token_id=tokenizer.eos_token_id
    )

    # Extract only the newly generated part
    generated = response[0]["generated_text"]
    remediation = generated[len(prompt):].strip()

    return remediation
