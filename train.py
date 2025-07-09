from datasets import load_dataset
from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments, Trainer
import torch

# Load model and tokenizer
model_id = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
tokenizer = AutoTokenizer.from_pretrained(model_id)
model = AutoModelForCausalLM.from_pretrained(model_id)

# Load dataset
dataset_path = r"C:\Users\jitto\Downloads\tinyllama_finetune_ready.json"
dataset = load_dataset("json", data_files=dataset_path)["train"]

# Tokenize properly for decoder-only model
def tokenize(example):
    full_text = example["prompt"] + "\n" + example["completion"]
    tokenized = tokenizer(full_text, truncation=True, padding="max_length", max_length=512)
    tokenized["labels"] = tokenized["input_ids"].copy()
    return tokenized

tokenized_dataset = dataset.map(tokenize)

# Set training arguments
training_args = TrainingArguments(
    output_dir="./tinyllama_finetuned_cpu",
    per_device_train_batch_size=1,
    num_train_epochs=3,
    logging_steps=5,
    save_strategy="epoch",
    report_to="none"
)

# Trainer setup
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_dataset
)

# Train
trainer.train()

# Save model
model.save_pretrained("tinyllama_remediation_finetuned")
tokenizer.save_pretrained("tinyllama_remediation_finetuned")
