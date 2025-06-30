#!/usr/bin/env python3
import os, json
import pandas as pd

SCRIPT_DIR   = os.path.dirname(__file__)
PROJECT_ROOT = os.path.abspath(os.path.join(SCRIPT_DIR, '..'))

LOG_CSV  = os.path.join(PROJECT_ROOT, 'logs',   'model_calls.csv')
THR_PATH = os.path.join(PROJECT_ROOT, 'config', 'thresholds.json')

df = pd.read_csv(LOG_CSV)
with open(THR_PATH) as f:
    thresholds = json.load(f)

# 1) Extract classify rows and rename the 'predicted' column → 'canonical'
df_classify = (
    df[df['route'] == '/classify']
    .rename(columns={'predicted': 'canonical'})
    # we only need these columns for tuning
    [['selector','canonical','field_type','score','threshold_used']]
)

# 2) Extract feedback rows and rename 'predicted' → 'canonical', 'decision' → 'user_feedback'
df_feedback = (
    df[df['route'] == '/feedback']
    .rename(columns={'predicted': 'canonical', 'decision': 'user_feedback'})
    [['selector','canonical','user_feedback']]
)

if df_feedback.empty:
    print("No /feedback rows found; nothing to tune.")
    exit(0)

# 3) Merge on selector+canonical
df_merged = pd.merge(
    df_classify,
    df_feedback,
    on=['selector','canonical'],
    how='inner'
)

if df_merged.empty:
    print("No matching classify↔feedback pairs; nothing to tune.")
    exit(0)

# 4) Now group by field_type and compute error rates exactly as before
results = {}
for field_type, group in df_merged.groupby('field_type'):
    accepted = group['score'] >= group['threshold_used']
    correct  = group['user_feedback'] == 'correct'

    fp = ((accepted) & (~correct)).sum()
    fn = ((~accepted) & (correct)).sum()
    total = len(group)
    err_rate = (fp + fn) / total if total else 0.0

    cur = thresholds.get(field_type, 0.6)
    if err_rate > 0.05:
        delta = 0.02
    elif err_rate < 0.02:
        delta = -0.01
    else:
        delta = 0.0

    new_thr = max(0.3, min(0.95, cur + delta))
    results[field_type] = round(new_thr, 4)
    print(f"{field_type:10s} err={err_rate:5.1%} {cur:.3f} → {new_thr:.3f}")

# 5) Write back
with open(THR_PATH, 'w') as f:
    json.dump(results, f, indent=2)
print("✓ Updated thresholds written to", THR_PATH)
