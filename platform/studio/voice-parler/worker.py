"""Indic Parler-TTS worker for Chalk publish.

Loads the model once, then reads one JSON request per line on stdin:
  {"text": "...", "description": "Divya speaks ...", "out": "/path/file.wav"}
and answers one JSON line on stdout: {"ok": true} or {"ok": false, "error": "..."}.
It prints {"ready": true} when the model is loaded.
"""

import json
import os
import sys

import soundfile as sf
import torch
from parler_tts import ParlerTTSForConditionalGeneration
from transformers import AutoTokenizer

MODEL = os.environ.get("CHALK_PARLER_MODEL", "ai4bharat/indic-parler-tts")


def pick_device() -> str:
    wanted = os.environ.get("CHALK_PARLER_DEVICE")
    if wanted:
        return wanted
    if torch.cuda.is_available():
        return "cuda:0"
    if torch.backends.mps.is_available():
        return "mps"
    return "cpu"


def reply(message: dict) -> None:
    sys.stdout.write(json.dumps(message) + "\n")
    sys.stdout.flush()


def main() -> None:
    device = pick_device()
    model = ParlerTTSForConditionalGeneration.from_pretrained(MODEL).to(device)
    text_tokenizer = AutoTokenizer.from_pretrained(MODEL)
    description_tokenizer = AutoTokenizer.from_pretrained(model.config.text_encoder._name_or_path)
    reply({"ready": True, "device": device})
    for line in sys.stdin:
        if not line.strip():
            continue
        try:
            request = json.loads(line)
            description = description_tokenizer(request["description"], return_tensors="pt").to(device)
            prompt = text_tokenizer(request["text"], return_tensors="pt").to(device)
            with torch.no_grad():
                audio = model.generate(
                    input_ids=description.input_ids,
                    attention_mask=description.attention_mask,
                    prompt_input_ids=prompt.input_ids,
                    prompt_attention_mask=prompt.attention_mask,
                )
            sf.write(request["out"], audio.cpu().numpy().squeeze(), model.config.sampling_rate, subtype="PCM_16")
            reply({"ok": True})
        except Exception as error:  # report and keep serving the next line
            reply({"ok": False, "error": f"{type(error).__name__}: {error}"})


if __name__ == "__main__":
    main()
