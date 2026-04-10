import torch
import csv
import random
import time
from torch import nn
from torch.utils.data import Dataset, DataLoader
from transformers import AutoTokenizer, AutoModel

print("Pornim antrenamentul CodeBERT...")
device = 'cuda' if torch.cuda.is_available() else 'cpu'
print(f"Dispozitiv: {device.upper()}")

# ============================================================
# PASUL 1 — Citim datele
# ============================================================

def load_csv(path):
    records = []
    with open(path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                code = row['code'].strip()
                # Sarim peste exemple prea scurte sau prea lungi
                if len(code) < 30 or len(code) > 6000:
                    continue
                records.append({
                    'code':            code,
                    'logicScore':      float(row['logicScore']),
                    'cleanCodeScore':  float(row['cleanCodeScore']),
                    'efficiencyScore': float(row['efficiencyScore']),
                    'versatilityScore':float(row['versatilityScore']),
                })
            except:
                continue
    return records

print("\n1. Citim training_data_final.csv...")
all_data = load_csv('training_data_final.csv')
print(f"   Total exemple incarcate: {len(all_data)}")

# Amestecam datele
random.shuffle(all_data)

# Limitam la 10000 exemple pentru un antrenament rezonabil pe CPU
# Daca ai GPU, schimba la all_data = all_data (foloseste tot)
MAX_TRAINING_SAMPLES = 57000
if len(all_data) > MAX_TRAINING_SAMPLES:
    all_data = all_data[:MAX_TRAINING_SAMPLES]
    print(f"   Folosim: {len(all_data)} exemple (optimizat pentru CPU)")

# Impartim 90% train, 10% validare
split_index = int(len(all_data) * 0.9)
train_data  = all_data[:split_index]
val_data    = all_data[split_index:]
print(f"   Train: {len(train_data)} | Validare: {len(val_data)}")

# ============================================================
# PASUL 2 — Dataset
# ============================================================

class CodeDataset(Dataset):
    def __init__(self, data, tokenizer):
        self.data      = data
        self.tokenizer = tokenizer

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        item = self.data[idx]

        enc = self.tokenizer(
            item['code'],
            truncation=True,
            max_length=256,
            padding='max_length',
            return_tensors='pt'
        )

        # Normalizam scorurile la 0-1 pentru training mai stabil
        # (le scalăm înapoi la 0-10 în output)
        labels = torch.tensor([
            item['logicScore']       / 10.0,
            item['cleanCodeScore']   / 10.0,
            item['efficiencyScore']  / 10.0,
            item['versatilityScore'] / 10.0,
        ], dtype=torch.float32)

        return {
            'input_ids':      enc['input_ids'].squeeze(),
            'attention_mask': enc['attention_mask'].squeeze(),
            'labels':         labels
        }

# ============================================================
# PASUL 3 — Modelul
# ============================================================

class CodeQualityModel(nn.Module):
    """
    CodeBERT cu cap de regresie pentru 4 scoruri de calitate.
    
    Arhitectura:
    - CodeBERT (125M parametri) extrage reprezentarea codului
    - Capul de regresie transforma vectorul [CLS] (768 dim) in 4 scoruri
    - Sigmoid asigura output intre 0-1 (scalat apoi la 0-10)
    """
    def __init__(self):
        super().__init__()
        self.bert = AutoModel.from_pretrained("microsoft/codebert-base", use_safetensors=True)

        # Cap de regresie: 768 -> 256 -> 64 -> 4
        self.regression_head = nn.Sequential(
            nn.Linear(768, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, 64),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(64, 4),
            nn.Sigmoid()           # output 0-1
        )

    def forward(self, input_ids, attention_mask):
        # Extragem reprezentarea CodeBERT
        bert_output = self.bert(
            input_ids=input_ids,
            attention_mask=attention_mask
        )

        # Token-ul [CLS] reprezinta intregul cod
        cls_representation = bert_output.last_hidden_state[:, 0, :]

        # Calculam cele 4 scoruri
        return self.regression_head(cls_representation)

# ============================================================
# PASUL 4 — Antrenament
# ============================================================

print("\n2. Incarcam CodeBERT (prima data dureaza ~2 minute)...")
tokenizer = AutoTokenizer.from_pretrained("microsoft/codebert-base")

# Batch size: 8 e optim pentru CPU, 16-32 pentru GPU
BATCH_SIZE = 8 if device == 'cpu' else 16
EPOCHS     = 3

train_loader = DataLoader(
    CodeDataset(train_data, tokenizer),
    batch_size=BATCH_SIZE,
    shuffle=True
)
val_loader = DataLoader(
    CodeDataset(val_data, tokenizer),
    batch_size=BATCH_SIZE
)

model     = CodeQualityModel().to(device)
optimizer = torch.optim.AdamW(model.parameters(), lr=2e-5, weight_decay=0.01)
loss_fn   = nn.MSELoss()

# Scheduler: reduce learning rate daca loss-ul stagneaza
scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
    optimizer, mode='min', patience=1, factor=0.5
)

best_val_loss = float('inf')
start_time    = time.time()

print(f"\n3. Antrenament ({EPOCHS} epoci, {len(train_loader)} batch-uri/epoca)...")
print(f"   Timp estimat pe CPU: {len(train_loader) * EPOCHS * 2 // 60} - {len(train_loader) * EPOCHS * 3 // 60} minute\n")

for epoch in range(EPOCHS):
    epoch_start = time.time()

    # ── Training ──
    model.train()
    train_loss   = 0.0
    batches_done = 0

    for i, batch in enumerate(train_loader):
        input_ids = batch['input_ids'].to(device)
        attn_mask = batch['attention_mask'].to(device)
        labels    = batch['labels'].to(device)

        predictions = model(input_ids, attn_mask)
        loss        = loss_fn(predictions, labels)

        optimizer.zero_grad()
        loss.backward()

        # Gradient clipping — previne explozia gradientilor
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)

        optimizer.step()

        train_loss   += loss.item()
        batches_done += 1

        # Log la fiecare 50 batch-uri
        if i % 50 == 0:
            elapsed   = (time.time() - start_time) / 60
            remaining = (elapsed / max(batches_done + epoch * len(train_loader), 1)) * (EPOCHS * len(train_loader) - batches_done - epoch * len(train_loader))
            print(f"   Epoca {epoch+1}/{EPOCHS} | "
                  f"Batch {i:4d}/{len(train_loader)} | "
                  f"Loss: {loss.item():.4f} | "
                  f"Scurs: {elapsed:.1f}min | "
                  f"Ramas: ~{remaining:.0f}min")

    # ── Validare ──
    model.eval()
    val_loss = 0.0

    with torch.no_grad():
        for batch in val_loader:
            preds = model(
                batch['input_ids'].to(device),
                batch['attention_mask'].to(device)
            )
            val_loss += loss_fn(preds, batch['labels'].to(device)).item()

    avg_train = train_loss / len(train_loader)
    avg_val   = val_loss   / len(val_loader)
    epoch_min = (time.time() - epoch_start) / 60

    print(f"\n{'='*60}")
    print(f"  EPOCA {epoch+1} FINALIZATA in {epoch_min:.1f} minute")
    print(f"  Train Loss: {avg_train:.4f} | Val Loss: {avg_val:.4f}")

    # Salvam cel mai bun model
    if avg_val < best_val_loss:
        best_val_loss = avg_val
        torch.save(model.state_dict(), 'codebert_quality.pth')
        print(f"  Model salvat! (best val loss: {best_val_loss:.4f})")

    print(f"{'='*60}\n")

    # Ajustam learning rate-ul
    scheduler.step(avg_val)

# ============================================================
# PASUL 5 — Test rapid pe exemple cunoscute
# ============================================================

print("\n4. Test rapid pe exemple cunoscute...")
model.load_state_dict(torch.load('codebert_quality.pth', map_location=device))
model.eval()

test_examples = [
    ("cod excelent documentat", """
def binary_search(sorted_array, target):
    \"\"\"Cauta un element folosind cautare binara. O(log n)\"\"\"
    left, right = 0, len(sorted_array) - 1
    while left <= right:
        mid = left + (right - left) // 2
        if sorted_array[mid] == target:
            return mid
        elif sorted_array[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1
"""),
    ("cod slab fara documentatie", """
def f(a,b,c):
    r=0
    for i in range(a):
        for j in range(b):
            for k in range(c):
                r+=i*j*k
    return r
"""),
]

for label, code in test_examples:
    enc = tokenizer(
        code, truncation=True, max_length=256,
        padding='max_length', return_tensors='pt'
    )
    with torch.no_grad():
        scores = model(
            enc['input_ids'].to(device),
            enc['attention_mask'].to(device)
        ).squeeze() * 10  # scalăm înapoi la 0-10

    print(f"\n  [{label}]")
    print(f"  Logica:       {scores[0]:.1f}/10")
    print(f"  Cod Curat:    {scores[1]:.1f}/10")
    print(f"  Eficienta:    {scores[2]:.1f}/10")
    print(f"  Versatilitate:{scores[3]:.1f}/10")

total_minutes = (time.time() - start_time) / 60
print(f"\nAntrenament complet in {total_minutes:.1f} minute.")
print("Modelul este salvat in: codebert_quality.pth")
print("Urmatorul pas: porneste main.py si testeaza din platforma!")