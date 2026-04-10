import torch
import numpy as np
import re
from transformers import AutoTokenizer, AutoModel

# Folosește GPU dacă există, altfel CPU
torch_device = "cuda" if torch.cuda.is_available() else "cpu"


class CodeAnalyzer:
    def __init__(self):
        print(f"Se încarcă CodeBERT pe {torch_device}...")
        print("Prima pornire durează ~2 minute (descarcă ~500MB).")
        self.tokenizer = AutoTokenizer.from_pretrained("microsoft/codebert-base")
        self.model = AutoModel.from_pretrained("microsoft/codebert-base").to(torch_device)
        self.model.eval()
        print("CodeBERT încărcat cu succes!")

    # ------------------------------------------------------------------ #
    #  PASUL 1 — CodeBERT transformă codul într-un vector de 768 numere  #
    # ------------------------------------------------------------------ #
    def get_embedding(self, code: str) -> np.ndarray:
        inputs = self.tokenizer(
            code,
            return_tensors="pt",
            truncation=True,
            max_length=512,
            padding=True,
        ).to(torch_device)

        with torch.no_grad():
            outputs = self.model(**inputs)

        # Media peste toți tokenii = reprezentarea globală a codului
        embedding = outputs.last_hidden_state.mean(dim=1).squeeze().cpu().numpy()
        return embedding  # shape: (768,)

    # ------------------------------------------------------------------ #
    #  PASUL 2 — Extragem 3 semnale din embedding                        #
    # ------------------------------------------------------------------ #
    def extract_signals(self, embedding: np.ndarray):
        """
        Împărțim cei 768 neuroni în 3 zone.
        CodeBERT nu garantează că fiecare zonă captează exact un concept,
        dar variația statistică (mean, std) a zonelor diferite reflectă
        trăsături diferite ale codului.
        """
        complexity_signal = float(np.mean(np.abs(embedding[:150])))   # complexitate generală
        structure_signal  = float(np.std(embedding[150:500]))          # structura internă
        pattern_signal    = float(np.mean(embedding[500:]))            # pattern-uri de cod

        # Normalizăm semnalele la intervalul [-1, +1] aproximativ
        # (valorile tipice pentru CodeBERT sunt în jur de 0.1–0.5)
        complexity_norm = np.clip((complexity_signal - 0.2) * 5, -2, 2)
        structure_norm  = np.clip((structure_signal  - 0.3) * 4, -2, 2)
        pattern_norm    = np.clip(pattern_signal * 3,            -2, 2)

        return complexity_norm, structure_norm, pattern_norm

    # ------------------------------------------------------------------ #
    #  PASUL 3 — Scoruri individuale (euristici + ajustare din AI)       #
    # ------------------------------------------------------------------ #
    def score_logic(self, code: str, complexity: float) -> int:
        """
        Logică = structuri de control + complexitate detectată de CodeBERT.
        """
        keywords = ['if', 'else', 'elif', 'for', 'while', 'switch',
                    'case', 'try', 'catch', 'except', 'finally']
        kw_count = sum(code.count(k) for k in keywords)

        if kw_count == 0:
            base = 2.0
        elif kw_count <= 2:
            base = 5.0
        elif kw_count <= 5:
            base = 7.0
        elif kw_count <= 10:
            base = 8.5
        else:
            base = 7.0  # prea multă complexitate = mai greu de urmărit

        # CodeBERT ajustează ±2 puncte
        final = base + complexity * 1.5
        return int(np.clip(final, 1, 10))

    def score_clean_code(self, code: str, structure: float) -> int:
        """
        Cod curat = comentarii + lungimea liniilor + nume variabile descriptive.
        """
        lines = [l for l in code.split('\n') if l.strip()]
        if not lines:
            return 1

        # Comentarii
        comments = [l for l in lines if
                    l.strip().startswith('#') or
                    l.strip().startswith('//') or
                    l.strip().startswith('*') or
                    '/*' in l]
        comment_ratio = len(comments) / len(lines)

        # Lungimea medie a liniilor
        avg_len = np.mean([len(l) for l in lines])

        # Variabile cu nume de 1 literă (semn rău)
        single_chars = len(re.findall(r'\b[a-zA-Z]\b', code))

        base = 5.0
        base += min(comment_ratio * 15, 3.0)   # max +3 din comentarii
        base -= min(avg_len / 40, 2.0)          # penalizare linii lungi
        base -= min(single_chars * 0.2, 2.0)    # penalizare nume scurte

        # CodeBERT ajustează ±1.5
        final = base + structure * 1.0
        return int(np.clip(final, 1, 10))

    def score_efficiency(self, code: str, pattern: float) -> int:
        """
        Eficiență = absența pattern-urilor ineficiente + semnal AI.
        """
        base = 8.0

        # Penalizări
        nested_loops = len(re.findall(r'for.+\n.+for', code, re.DOTALL))
        base -= nested_loops * 1.5

        string_concat_in_loop = '+=' in code and 'for' in code
        if string_concat_in_loop:
            base -= 1.0

        excessive_appends = code.count('append') > 5
        if excessive_appends:
            base -= 1.0

        # Bonusuri
        if re.search(r'\[.+for.+in.+\]', code):  # list comprehension
            base += 1.0
        if 'map(' in code or 'filter(' in code:
            base += 0.5
        if 'cache' in code.lower() or 'memo' in code.lower():
            base += 1.0

        # CodeBERT ajustează ±1.5
        final = base + pattern * 1.0
        return int(np.clip(final, 1, 10))

    def score_versatility(self, code: str, structure: float) -> int:
        """
        Versatilitate = reutilizabilitate + abstractizare.
        """
        base = 4.0

        if 'class ' in code:
            base += 2.0
        if 'def ' in code or 'function ' in code:
            base += 1.5
        if 'return' in code:
            base += 1.0
        if 'template' in code or '<T>' in code:
            base += 1.5
        if 'interface' in code or 'abstract' in code:
            base += 1.0

        # Hardcodare = mai puțin versatil
        hardcoded = len(re.findall(r'\b(?!0\b|1\b|2\b)\d{2,}\b', code))
        base -= min(hardcoded * 0.3, 2.0)

        # CodeBERT ajustează ±1.5
        final = base + structure * 1.0
        return int(np.clip(final, 1, 10))

    # ------------------------------------------------------------------ #
    #  PASUL 4 — Sumar în română                                         #
    # ------------------------------------------------------------------ #
    def generate_summary(self, scores: dict) -> str:
        avg = np.mean(list(scores.values()))
        weakest  = min(scores, key=scores.get)
        strongest = max(scores, key=scores.get)

        labels = {
            'logicScore':       ('logica',          'logică solidă'),
            'cleanCodeScore':   ('lizibilitatea',   'cod curat și comentat'),
            'efficiencyScore':  ('eficiența',       'algoritmi eficienți'),
            'versatilityScore': ('versatilitatea',  'cod modular și reutilizabil'),
        }

        if avg >= 8.5:
            intro = "Cod excelent! Demonstrezi stăpânirea conceptelor avansate."
        elif avg >= 7:
            intro = "Cod bun, cu mici aspecte de rafinat."
        elif avg >= 5:
            intro = "Cod funcțional, dar există îmbunătățiri importante de făcut."
        else:
            intro = "Cod la nivel de început. Continuă să exersezi!"

        weak_label, strong_label = labels[weakest][0], labels[strongest][1]

        return (
            f"{intro} Punctul tău forte este {strong_label}. "
            f"Cel mai mult ai de lucrat la {weak_label}."
        )

    # ------------------------------------------------------------------ #
    #  FUNCȚIA PRINCIPALĂ                                                 #
    # ------------------------------------------------------------------ #
    def analyze(self, code: str) -> dict:
        # 1. CodeBERT → embedding
        embedding = self.get_embedding(code)

        # 2. Extragem semnale din embedding
        complexity, structure, pattern = self.extract_signals(embedding)

        # 3. Calculăm scorurile (euristici + AI)
        scores = {
            'logicScore':       self.score_logic(code, complexity),
            'cleanCodeScore':   self.score_clean_code(code, structure),
            'efficiencyScore':  self.score_efficiency(code, pattern),
            'versatilityScore': self.score_versatility(code, structure),
        }

        # 4. Generăm sumarul
        scores['summary'] = self.generate_summary(scores)

        return scores