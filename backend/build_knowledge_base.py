import os
import json

base_dir = "scraped_comar"
output = []

for root, dirs, files in os.walk(base_dir):
    for fname in files:
        if fname.endswith(".txt"):
            path = os.path.join(root, fname)
            with open(path, encoding="utf-8", errors="replace") as f:
                content = f.read()
                output.append({
                    "title": os.path.relpath(path, base_dir).replace(".txt", ""),
                    "content": content
                })

with open("comar_knowledge_base.json", "w", encoding="utf-8") as out:
    json.dump(output, out, ensure_ascii=False, indent=2)

print(f"JSON knowledge base ready with {len(output)} entries")
