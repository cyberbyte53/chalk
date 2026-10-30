"""
Piper, for `pnpm voice --voice piper`: one process that loads each voice once and speaks line after
line. Reads one JSON request a line on stdin ({"text", "voice", "out"}), writes an M4A file, and
answers one JSON line on stdout ({"ok": true} or {"ok": false, "error"}). Voices are .onnx files in
voices/ (see README.md).
"""

import json
import subprocess
import sys
import tempfile
import wave
from pathlib import Path

from piper import PiperVoice

VOICES = Path(__file__).parent / "voices"
loaded: dict[str, PiperVoice] = {}


def voice(name: str) -> PiperVoice:
    if name not in loaded:
        path = VOICES / f"{name}.onnx"
        if not path.exists():
            raise FileNotFoundError(f"no voice {name}: download {name}.onnx and .onnx.json into {VOICES}")
        loaded[name] = PiperVoice.load(str(path))
    return loaded[name]


print(json.dumps({"ready": True}), flush=True)
for line in sys.stdin:
    try:
        request = json.loads(line)
        # Piper writes WAV; a phone gets AAC (about a sixth of the size), as the Mac voices give.
        with tempfile.NamedTemporaryFile(suffix=".wav") as raw:
            with wave.open(raw.name, "wb") as out:
                voice(request["voice"]).synthesize_wav(request["text"], out)
            subprocess.run(
                ["ffmpeg", "-loglevel", "error", "-y", "-i", raw.name, "-c:a", "aac", "-b:a", "48k", request["out"]],
                check=True,
            )
        print(json.dumps({"ok": True}), flush=True)
    except Exception as error:  # noqa: BLE001 - every failure is reported back, never swallowed
        print(json.dumps({"ok": False, "error": f"{type(error).__name__}: {error}"}), flush=True)
