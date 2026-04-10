import os
import re
import csv

print("Citim submisiile Codeforces...")

records = []
MAX_SAMPLES = 25000
data_dir = "kaggle.data"

# Extensii suportate
LANG_MAP = {
    '.py':   'Python',
    '.cpp':  'C++',
    '.java': 'Java',
}

def score_logic(code):
    logic_kw = ['if', 'else', 'for', 'while', 'switch', 'try', 'catch', 'elif']
    kw_count = sum(code.count(k) for k in logic_kw)
    if kw_count == 0:    return 3.0
    elif kw_count <= 2:  return 5.5
    elif kw_count <= 5:  return 7.5
    elif kw_count <= 10: return 9.0
    else:                return 7.0

def score_clean(code):
    lines = [l for l in code.split('\n') if l.strip()]
    if not lines:
        return 1.0
    comments = [l for l in lines
                if l.strip().startswith('//')
                or l.strip().startswith('#')
                or '/*' in l]
    comment_ratio = len(comments) / len(lines)
    avg_len = sum(len(l) for l in lines) / len(lines)
    single_vars = len(re.findall(r'\b[a-zA-Z]\b', code))

    score = 5.0
    score += min(comment_ratio * 15, 3.0)
    score -= min(avg_len / 40, 2.0)
    score -= min(single_vars * 0.15, 2.0)
    return score

def score_efficiency(code, lang):
    efficiency = 8.0
    # Nested loops — costisitoare indiferent de limbaj
    nested_cpp    = len(re.findall(r'for\s*\(.*\)\s*\{[^}]*for\s*\(', code, re.DOTALL))
    nested_py     = len(re.findall(r'for .+ in .+:\n\s+for .+ in', code))
    nested_java   = nested_cpp
    efficiency   -= (nested_cpp + nested_py + nested_java) * 1.5

    # Bonusuri per limbaj
    if lang == 'Python':
        if re.search(r'\[.+for.+in.+\]', code):
            efficiency += 1.5   # list comprehension
        if 'map(' in code or 'filter(' in code:
            efficiency += 1.0
    if lang == 'C++':
        if 'vector' in code and 'push_back' in code:
            efficiency += 0.5
        if 'sort(' in code:
            efficiency += 0.5
    if lang == 'Java':
        if 'ArrayList' in code or 'HashMap' in code:
            efficiency += 0.5
        if 'stream()' in code:
            efficiency += 1.0

    if code.count('for') > 5:
        efficiency -= 1.0

    return efficiency

def score_versatility(code, lang):
    versatility = 4.0
    if lang == 'Python':
        if 'def ' in code:      versatility += 2.0
        if 'class ' in code:    versatility += 2.0
        if 'return ' in code:   versatility += 1.5
    if lang == 'C++':
        if 'class ' in code:    versatility += 2.5
        if 'template' in code:  versatility += 2.0
        if 'return ' in code:   versatility += 1.5
        if 'void ' in code:     versatility += 1.0
    if lang == 'Java':
        if 'class ' in code:    versatility += 2.0
        if 'interface' in code: versatility += 1.5
        if 'return ' in code:   versatility += 1.5
        if 'ArrayList' in code: versatility += 1.0

    hardcoded = len(re.findall(r'\b\d{3,}\b', code))
    versatility -= min(hardcoded * 0.3, 2.0)
    return versatility

# Parcurgem toate fișierele
for root, dirs, files in os.walk(data_dir):
    for file in files:
        ext = os.path.splitext(file)[1].lower()
        if ext not in LANG_MAP:
            continue

        lang = LANG_MAP[ext]
        filepath = os.path.join(root, file)

        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                code = f.read()
        except:
            continue

        if not (50 < len(code) < 3000):
            continue

        logic      = score_logic(code)
        clean      = score_clean(code)
        efficiency = score_efficiency(code, lang)
        versatility= score_versatility(code, lang)

        records.append({
            'code':            code,
            'language':        lang,
            'logicScore':      round(min(max(logic,       1), 10), 1),
            'cleanCodeScore':  round(min(max(clean,       1), 10), 1),
            'efficiencyScore': round(min(max(efficiency,  1), 10), 1),
            'versatilityScore':round(min(max(versatility, 1), 10), 1),
        })

        if len(records) % 1000 == 0:
            print(f"   Procesate: {len(records)} fisiere...")

        if len(records) >= MAX_SAMPLES:
            break

    if len(records) >= MAX_SAMPLES:
        break

# Salvam fara pandas
print(f"\nSalvam {len(records)} exemple...")
with open('training_data.csv', 'w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=[
        'code', 'language', 'logicScore',
        'cleanCodeScore', 'efficiencyScore', 'versatilityScore'
    ])
    writer.writeheader()
    writer.writerows(records)

print(f"GATA! training_data.csv cu {len(records)} exemple.")

# Statistici simple
langs = {}
for r in records:
    langs[r['language']] = langs.get(r['language'], 0) + 1
print("\nDistributie limbaje:")
for lang, count in langs.items():
    print(f"  {lang}: {count} exemple")

for field in ['logicScore', 'cleanCodeScore', 'efficiencyScore', 'versatilityScore']:
    values = [r[field] for r in records]
    avg = sum(values) / len(values)
    print(f"{field}: medie={avg:.1f}, min={min(values)}, max={max(values)}")