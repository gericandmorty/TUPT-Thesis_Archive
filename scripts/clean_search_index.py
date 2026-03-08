import json
import os

# Define relative path from the script's intended execution context (project root)
file_path = os.path.join('data', 'search_index.json')

try:
    if not os.path.exists(file_path):
        print(f"Error: {file_path} not found.")
        exit(1)

    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    print(f"Loaded {len(data)} items. Removing 'folder' keys...")

    # Remove 'folder' field from each dictionary
    for item in data:
        if 'folder' in item:
            del item['folder']

    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

    print("Successfully cleaned search_index.json.")
except Exception as e:
    print(f"Error: {str(e)}")
    exit(1)
