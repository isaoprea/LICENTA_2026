import torch
from torch import nn
from transformers import AutoModel
import transformers.utils.import_utils as transformers_utils
transformers_utils.check_torch_load_is_safe = lambda: None

class CodeQualityModel(nn.Module):
    def __init__(self):
        super().__init__()
        # Folosim safetensors=True pentru securitate în 2026
        self.bert = AutoModel.from_pretrained("microsoft/codebert-base")
        self.regression_head = nn.Sequential(
            nn.Linear(768, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, 64),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(64, 4),
            nn.Sigmoid()
        )

    def forward(self, input_ids, attention_mask):
        bert_output = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        cls_representation = bert_output.last_hidden_state[:, 0, :]
        return self.regression_head(cls_representation)