#!/usr/bin/env python3
import os
import sys
import json

# 1) Make sure we can import from the project root
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, project_root)

# 2) Import your Flask app factory (adjust if your factory has a different name/location)
from app import create_app

# 3) Create the app and push a context
app = create_app()
ctx = app.app_context()
ctx.push()

# 4) Now imports that rely on `current_app` will work
from app.routes.embed_routes import get_embed_model

# 5) Locate your data files relative to this script
script_dir = os.path.dirname(__file__)           # /app/app/scripts
app_dir    = os.path.join(script_dir, '..')      # /app/app
data_dir   = os.path.join(app_dir, 'data')       # /app/app/data
raw_path   = os.path.join(data_dir, 'canonical.json')
out_path   = os.path.join(data_dir, 'canonical_embeddings.json')

# 6) Load raw canonical field names
with open(raw_path, 'r') as f:
    RAW = json.load(f)

# 7) Embed them in one batch
model   = get_embed_model()
keys    = list(RAW.keys())
vectors = model(keys).numpy().tolist()

# 8) Write out the numeric embeddings
out = dict(zip(keys, vectors))
with open(out_path, 'w') as f:
    json.dump(out, f, indent=2)

print("✓ canonical_embeddings.json regenerated at", out_path)

# 9) Pop the context when you’re done
ctx.pop()
