import os
import json

base_dir = "scraped_comar"
output_by_section = {}

# Step 1: Walk through all text files
for root, dirs, files in os.walk(base_dir):
    for fname in files:
        if fname.endswith(".txt") and not fname.startswith("."):
            section = os.path.relpath(root, base_dir).split(os.sep)[0]  # section name from path
            path = os.path.join(root, fname)
            with open(path, encoding="utf-8", errors="replace") as f:
                content = f.read()
                entry = {
                    "title": os.path.relpath(path, base_dir).replace(".txt", ""),
                    "content": content
                }
                output_by_section.setdefault(section, []).append(entry)

# Step 2: Save one JSON file per section
output_folder = "split_knowledge_base"
os.makedirs(output_folder, exist_ok=True)

for section, entries in output_by_section.items():
    out_path = os.path.join(output_folder, f"{section}.json")
    with open(out_path, "w", encoding="utf-8") as out_file:
        json.dump(entries, out_file, ensure_ascii=False, indent=2)
    print(f"✅ Saved {len(entries)} entries to {out_path}")

print(f"\n📚 Split knowledge base saved to '{output_folder}'")
