# Indic Parler-TTS voice (self-hosted)

A voice provider for the audio step (`generateAudio` in `src/voice/`; not wired to a command yet), using [ai4bharat/indic-parler-tts](https://huggingface.co/ai4bharat/indic-parler-tts) (Apache 2.0) on your own machine. It runs only when audio is made; nothing calls it while a student learns.

Each character has one named speaker, described in `content/voices.json` under `parler` (the model is steered by a sentence that names the speaker).

## One-time setup (Mac)

1. On huggingface.co, sign in, open the model page and accept its terms (the model is gated).
2. Make an access token (Settings → Access Tokens, "Read").
3. From the repo root:

```bash
cd studio/voice-parler
python3 -m venv .venv
.venv/bin/pip install -r requirements.txt
.venv/bin/huggingface-cli login     # paste the token
```

The first run downloads the model (~3.5 GB) into the Hugging Face cache.

## Use

Call `generateAudio(lesson, readings, propDefs, parlerProvider, voices, dir, name)`.

Unchanged lines are reused, so only new or edited lines are spoken again.

Settings (environment variables): `CHALK_PARLER_PYTHON` (another Python), `CHALK_PARLER_DEVICE` (`mps`, `cpu`, `cuda:0`; default: best available), `CHALK_PARLER_MODEL`.
