#!/usr/bin/env python3
import os, sys, json
import numpy as np

# 1) project-root on PYTHONPATH
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, project_root)

# 2) spin up app context
from app import create_app
app = create_app()
app.app_context().push()

# 3) get your embed model
from app.routes.embed_routes import get_embed_model
model = get_embed_model()

# 4) load your raw synonyms
data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
raw_path = os.path.join(data_dir, 'canonical.json')
with open(raw_path) as f:
    RAW = json.load(f)

# 5) for each canonical key, embed *all* its synonyms
embeddings = {}
for key, synonyms in RAW.items():
    # embed returns a tensor of shape (len(synonyms), dim)
    vecs = model(synonyms).numpy()      # e.g. shape (5, 768)
    avg = vecs.mean(axis=0).tolist()    # average across synonyms
    embeddings[key] = avg

# 6) write out the averaged embeddings
out_path = os.path.join(data_dir, 'canonical_embeddings.json')
with open(out_path, 'w') as f:
    json.dump(embeddings, f, indent=2)

print("✓ regenerated", out_path)
