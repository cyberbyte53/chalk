# Piper voice (on this machine)

A voice for `pnpm voice <book>/<chapter> --voice piper`, using [Piper](https://github.com/OHF-Voice/piper1-gpl) (rhasspy): small neural voices that run on a laptop's CPU, many times faster than real time. Lines are made once and kept (named by their words), so only new or edited lines are spoken again.

Which voice speaks each language is in `authoring/voices.json` under `piper`, by voice file name.

## One-time setup (Mac)

Needs `ffmpeg` (`brew install ffmpeg`): each clip is kept as AAC, a sixth of the WAV's size.

```bash
cd platform/studio/voice-piper
uv venv --python 3.12 .venv
uv pip install --python .venv/bin/python piper-tts
mkdir -p voices && cd voices
# each voice: its .onnx and .onnx.json, from huggingface.co/rhasspy/piper-voices
for v in hi/hi_IN/priyamvada/medium/hi_IN-priyamvada-medium en/en_GB/alan/medium/en_GB-alan-medium; do
  n=$(basename $v)
  curl -fL -o $n.onnx "https://huggingface.co/rhasspy/piper-voices/resolve/main/$v.onnx"
  curl -fL -o $n.onnx.json "https://huggingface.co/rhasspy/piper-voices/resolve/main/$v.onnx.json"
done
```

The Hindi voices' training data is CC BY-NC-SA (non-commercial): fine while we aren't selling; look again before we do.
