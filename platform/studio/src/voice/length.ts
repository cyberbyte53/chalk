/**
 * How long an audio file plays, in seconds, read from its header: a WAV's data size over its byte
 * rate, an MP4/M4A's movie header (`moov/mvhd`) duration over its timescale. Publish saves it with
 * each line, so a board knows when a line ends without playing it (event-model.md, Voice).
 */
export function audioSeconds(bytes: Uint8Array, extension: string): number {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const seconds =
    extension === "wav"
      ? wavSeconds(view)
      : extension === "m4a" || extension === "mp4"
        ? mp4Seconds(view)
        : undefined;
  if (seconds === undefined || !Number.isFinite(seconds) || seconds <= 0)
    throw new Error(
      `Can't tell how long this .${extension} file plays (its header isn't one we read)`,
    );
  return seconds;
}

function tag(view: DataView, at: number): string {
  return String.fromCharCode(
    view.getUint8(at),
    view.getUint8(at + 1),
    view.getUint8(at + 2),
    view.getUint8(at + 3),
  );
}

function wavSeconds(view: DataView): number | undefined {
  if (view.byteLength < 12 || tag(view, 0) !== "RIFF" || tag(view, 8) !== "WAVE") return undefined;
  let byteRate: number | undefined;
  for (let at = 12; at + 8 <= view.byteLength; ) {
    const size = view.getUint32(at + 4, true);
    const id = tag(view, at);
    if (id === "fmt ") {
      if (size < 16 || at + 20 > view.byteLength) return undefined;
      byteRate = view.getUint32(at + 16, true);
    }
    // A streamed WAV may not know its size (0xFFFFFFFF): what is in the file is what plays.
    if (id === "data")
      return byteRate === undefined || byteRate === 0
        ? undefined
        : Math.min(size, view.byteLength - (at + 8)) / byteRate;
    at += 8 + size + (size % 2);
  }
  return undefined;
}

function mp4Seconds(view: DataView): number | undefined {
  const box = (
    from: number,
    to: number,
    want: string,
  ): { start: number; end: number } | undefined => {
    for (let at = from; at + 8 <= to; ) {
      let size = view.getUint32(at);
      let header = 8;
      if (size === 1) {
        if (at + 16 > to) return undefined;
        size = Number(view.getBigUint64(at + 8));
        header = 16;
      } else if (size === 0) size = to - at;
      if (size < header) return undefined;
      if (tag(view, at + 4) === want) return { start: at + header, end: at + size };
      at += size;
    }
    return undefined;
  };
  const moov = box(0, view.byteLength, "moov");
  const mvhd = moov === undefined ? undefined : box(moov.start, moov.end, "mvhd");
  if (mvhd === undefined) return undefined;
  const version1 = mvhd.start < view.byteLength && view.getUint8(mvhd.start) === 1;
  if (mvhd.start + (version1 ? 32 : 20) > Math.min(mvhd.end, view.byteLength)) return undefined;
  const version = view.getUint8(mvhd.start);
  const timescale = view.getUint32(mvhd.start + (version === 1 ? 20 : 12));
  const duration =
    version === 1 ? Number(view.getBigUint64(mvhd.start + 24)) : view.getUint32(mvhd.start + 16);
  return timescale === 0 ? undefined : duration / timescale;
}
