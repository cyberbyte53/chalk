import { type Box, type Picture, onComposer } from "./app-driver";

/**
 * Puts the pictures of one answer together, so each answer is one image: a board with its pieces
 * named, a piece cut out with its parts named, versions side by side (languages, widths, before
 * and after), a lesson's boards as thumbnails.
 *
 * Everything is drawn on a copy of a screenshot already taken, on a page of its own: the app's
 * page is never touched, so what was measured is what is shown, and the clean picture
 * (`labels: false`) is the student's screen, pixel for pixel. Names go in a margin beside the
 * picture, joined to their piece by a line, so they never cover it.
 */

export type Labels = "pieces" | "parts" | "none";

export type Tile = {
  picture: Picture;
  /** Pieces or parts to cut out (their names), else the whole picture. */
  crop?: readonly string[];
  /** What to outline and name: the pieces, the parts (of the cut-out piece, if one), or nothing. */
  labels: Labels;
  /** Problems by piece name: that piece is outlined in red, and its tag says the problem. */
  problems?: ReadonlyMap<string, string>;
  /** Written above it ("before", "hi · 360"). */
  caption?: string;
};

export type Arrangement = { kind: "row" } | { kind: "grid"; columns: number; width: number };

/** The space around a cut-out piece, in CSS pixels. */
const PAD = 12;

/** The tiles as one PNG. */
export function compose(tiles: readonly Tile[], arrangement: Arrangement): Promise<Buffer> {
  const input = tiles.map((t) => {
    const crop = t.crop === undefined ? undefined : cropOf(t.picture, t.crop);
    return {
      src: `data:image/png;base64,${t.picture.png.toString("base64")}`,
      width: t.picture.width,
      crop,
      caption: t.caption ?? "",
      boxes: labelled(t, crop),
    };
  });
  return onComposer(async (page) => {
    const data = await page.evaluate(draw, { tiles: input, arrangement });
    return Buffer.from(data.replace(/^data:image\/png;base64,/, ""), "base64");
  });
}

/** The area to cut out for pieces or parts: every box with their names, together, with some room. */
function cropOf(picture: Picture, names: readonly string[]): Area {
  const hits = picture.boxes.filter((b) => names.includes(b.name));
  if (hits.length === 0) throw new Error(`${names.join(", ")} isn't on the picture`);
  const x = Math.max(0, Math.min(...hits.map((b) => b.x)) - PAD);
  const y = Math.max(0, Math.min(...hits.map((b) => b.y)) - PAD);
  const right = Math.min(picture.width, Math.max(...hits.map((b) => b.x + b.w)) + PAD);
  const bottom = Math.max(...hits.map((b) => b.y + b.h)) + PAD;
  return { x, y, w: right - x, h: bottom - y };
}

type Area = { x: number; y: number; w: number; h: number };
type Tagged = Area & { name: string; tag: string; isProblem: boolean };

/** The boxes to outline on a tile, each with its tag. */
function labelled(t: Tile, crop: Area | undefined): Tagged[] {
  if (t.labels === "none") return [];
  const inside = (b: Box) =>
    crop === undefined ||
    (b.x < crop.x + crop.w && b.x + b.w > crop.x && b.y < crop.y + crop.h && b.y + b.h > crop.y);
  const wanted = t.picture.boxes.filter((b) => {
    if (!inside(b)) return false;
    if (t.labels === "pieces") return b.kind === "piece";
    // Parts of the cut-out piece (or all parts, on a whole board).
    const pieces = (t.crop ?? []).map((c) => c.split("/")[0]);
    return b.kind === "part" && (t.crop === undefined || pieces.includes(b.name.split("/")[0]));
  });
  return wanted.map((b) => {
    const problem = t.problems?.get(b.name.split("/")[0] ?? b.name);
    const isProblem = problem !== undefined && b.kind === "piece";
    return { ...b, tag: isProblem ? `${b.name}: ${problem}` : b.name, isProblem };
  });
}

/** Runs in the composer page: draws the tiles on a canvas and returns it as a PNG data URL. */
async function draw(arg: {
  tiles: {
    src: string;
    width: number;
    crop?: { x: number; y: number; w: number; h: number };
    caption: string;
    boxes: {
      x: number;
      y: number;
      w: number;
      h: number;
      name: string;
      tag: string;
      isProblem: boolean;
    }[];
  }[];
  arrangement: { kind: "row" } | { kind: "grid"; columns: number; width: number };
}): Promise<string> {
  const COLORS = ["#2f6fed", "#0f9d76", "#b4570b", "#8a3ffc", "#c2185b", "#00838f", "#5d4037"];
  const RED = "#d93025";
  const load = (src: string) =>
    new Promise<HTMLImageElement>((done, fail) => {
      const img = new Image();
      img.onload = () => done(img);
      img.onerror = () => fail(new Error("a picture didn't load"));
      img.src = src;
    });
  /** One tile: its picture (cut out if asked), outlines, and tags in a margin at the right. */
  const tileCanvas = async (t: (typeof arg.tiles)[number]) => {
    const img = await load(t.src);
    const scale = img.width / t.width;
    const crop = t.crop ?? { x: 0, y: 0, w: t.width, h: img.height / scale };
    const px = { x: crop.x * scale, y: crop.y * scale, w: crop.w * scale, h: crop.h * scale };
    px.h = Math.min(px.h, img.height - px.y);
    const font = 13 * scale;
    const margin = t.boxes.length > 0 ? 190 * scale : 0;
    const measure = document.createElement("canvas").getContext("2d") as CanvasRenderingContext2D;
    measure.font = `600 ${font}px ui-monospace, Menlo, monospace`;
    const wrap = (words: string, width: number): string[] => {
      const lines: string[] = [];
      let line = "";
      for (const word of words.split(" ")) {
        const next = line === "" ? word : `${line} ${word}`;
        if (measure.measureText(next).width > width && line !== "") {
          lines.push(line);
          line = word;
        } else line = next;
      }
      if (line !== "") lines.push(line);
      return lines;
    };
    // Tags from top to bottom, each at its box's middle unless the one above is in the way.
    const sorted = [...t.boxes].sort((a, b) => a.y - b.y || a.x - b.x);
    const seenNames = new Map<string, number>();
    let lastBottom = 0;
    const tags = sorted.map((b, i) => {
      const color = b.isProblem ? RED : (COLORS[i % COLORS.length] as string);
      const mid = (b.y - crop.y + b.h / 2) * scale;
      const first = seenNames.get(b.name);
      if (first !== undefined) return { b, color, lines: [] as string[], top: first };
      const lines = wrap(b.tag, margin - 24 * scale);
      const height = lines.length * font * 1.3;
      const top = Math.max(mid - height / 2, lastBottom + 6 * scale);
      lastBottom = top + height;
      seenNames.set(b.name, top);
      return { b, color, lines, top };
    });
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(px.w + margin);
    canvas.height = Math.ceil(Math.max(px.h, lastBottom + 8 * scale));
    const g = canvas.getContext("2d") as CanvasRenderingContext2D;
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, canvas.width, canvas.height);
    g.drawImage(img, px.x, px.y, px.w, px.h, 0, 0, px.w, px.h);
    if (margin > 0) {
      g.fillStyle = "#f6f6f8";
      g.fillRect(px.w, 0, margin, canvas.height);
    }
    g.font = `600 ${font}px ui-monospace, Menlo, monospace`;
    g.textBaseline = "top";
    for (const { b, color, lines, top } of tags) {
      const x = (b.x - crop.x) * scale;
      const y = (b.y - crop.y) * scale;
      g.strokeStyle = color;
      g.lineWidth = (b.isProblem ? 2.5 : 1.5) * scale;
      g.setLineDash(b.isProblem ? [] : [4 * scale, 3 * scale]);
      g.strokeRect(x, y, b.w * scale, b.h * scale);
      g.setLineDash([]);
      // A line from the box's right edge to its tag.
      g.lineWidth = 1 * scale;
      g.beginPath();
      g.moveTo(Math.min(x + b.w * scale, px.w), y + (b.h * scale) / 2);
      g.lineTo(px.w + 8 * scale, top + font * 0.65);
      g.stroke();
      g.fillStyle = color;
      lines.forEach((line, k) => g.fillText(line, px.w + 12 * scale, top + k * font * 1.3));
    }
    return { canvas, scale };
  };
  const made = await Promise.all(arg.tiles.map(tileCanvas));
  const out = document.createElement("canvas");
  const g = out.getContext("2d") as CanvasRenderingContext2D;
  const scale = made[0]?.scale ?? 2;
  const captionH = arg.tiles.some((t) => t.caption !== "") ? 22 * scale : 0;
  const gap = 16 * scale;
  if (arg.arrangement.kind === "row") {
    out.width = made.reduce((w, m) => w + m.canvas.width, 0) + gap * (made.length - 1);
    out.height = Math.max(...made.map((m) => m.canvas.height)) + captionH;
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, out.width, out.height);
    let x = 0;
    for (const [i, m] of made.entries()) {
      g.fillStyle = "#3c3c43";
      g.font = `600 ${13 * scale}px system-ui, sans-serif`;
      g.textBaseline = "top";
      g.fillText(arg.tiles[i]?.caption ?? "", x, 4 * scale);
      g.drawImage(m.canvas, x, captionH);
      x += m.canvas.width + gap;
    }
  } else {
    const { columns, width } = arg.arrangement;
    const cell = width * scale;
    const heights = made.map((m) => (m.canvas.height * cell) / m.canvas.width);
    const rows = Math.ceil(made.length / columns);
    const rowH = Array.from({ length: rows }, (_, r) =>
      Math.max(...heights.slice(r * columns, r * columns + columns)),
    );
    out.width = columns * cell + gap * (columns - 1);
    out.height = rowH.reduce((h, r) => h + r + captionH + gap, 0);
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, out.width, out.height);
    let y = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        const i = r * columns + c;
        const m = made[i];
        if (m === undefined) continue;
        const x = c * (cell + gap);
        g.fillStyle = "#3c3c43";
        g.font = `600 ${12 * scale}px system-ui, sans-serif`;
        g.textBaseline = "top";
        g.fillText(arg.tiles[i]?.caption ?? "", x, y + 4 * scale);
        g.drawImage(m.canvas, x, y + captionH, cell, heights[i] ?? 0);
        g.strokeStyle = "#d4d4da";
        g.lineWidth = 1;
        g.strokeRect(x, y + captionH, cell, heights[i] ?? 0);
      }
      y += (rowH[r] ?? 0) + captionH + gap;
    }
  }
  return out.toDataURL("image/png");
}
