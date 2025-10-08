import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../../projects");
const GLOBAL = "_global";

export type Precepts = {
  principles?: { id: string; title: string; body: string; tags?: string[] }[];
  tenets?: { id: string; text: string; tags?: string[] }[];
  elements?: { id: string; name: string; description?: string; tokens?: string[]; tags?: string[] }[];
};

export async function ensureProject(projectId: string) {
  const dir = path.join(ROOT, projectId);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

async function readJson<T>(p: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(p, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(p: string, obj: any) {
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(obj, null, 2), "utf8");
}

export async function readPrecepts(projectId: string): Promise<Precepts> {
  const g = await readJson<Precepts>(path.join(ROOT, GLOBAL, "principles.json"), {});
  const gTen = await readJson<Precepts>(path.join(ROOT, GLOBAL, "tenets.json"), {});
  const gEl = await readJson<Precepts>(path.join(ROOT, GLOBAL, "elements.json"), {});

  const p = await readJson<Precepts>(path.join(ROOT, projectId, "principles.json"), {});
  const pTen = await readJson<Precepts>(path.join(ROOT, projectId, "tenets.json"), {});
  const pEl = await readJson<Precepts>(path.join(ROOT, projectId, "elements.json"), {});

  return {
    principles: [...(g.principles ?? []), ...(p.principles ?? [])],
    tenets: [...(gTen.tenets ?? []), ...(pTen.tenets ?? [])],
    elements: [...(gEl.elements ?? []), ...(pEl.elements ?? [])],
  };
}

export async function upsertPrinciple(projectId: string, item: { id: string; title: string; body: string; tags?: string[] }) {
  const pPath = path.join(ROOT, projectId, "principles.json");
  const data = await readJson<Precepts>(pPath, {});
  const list = data.principles ?? [];
  const idx = list.findIndex(x => x.id === item.id);
  if (idx >= 0) list[idx] = item; else list.push(item);
  data.principles = list;
  await writeJson(pPath, data);
}

export async function appendMarkdown(projectId: string, file: "notes.md" | "decisions.md", text: string) {
  const p = path.join(ROOT, projectId, file);
  await fs.mkdir(path.dirname(p), { recursive: true });
  const stamp = new Date().toISOString();
  await fs.appendFile(p, `\n\n## ${stamp}\n${text}\n`, "utf8");
}

export async function listMoodboards(projectId: string) {
  const glob = path.join(ROOT, GLOBAL, "moodboards");
  const proj = path.join(ROOT, projectId, "moodboards");
  const files: string[] = [];
  for (const dir of [glob, proj]) {
    try {
      const entries = await fs.readdir(dir);
      for (const f of entries) if (f.endsWith(".json")) files.push(path.join(dir, f));
    } catch {}
  }
  return files;
}

export type Moodboard = { id: string; title: string; description?: string; tags?: string[]; assets: { id: string; title?: string; uri: string; tags?: string[]; notes?: string }[] };

export async function readMoodboard(projectId: string, boardId: string): Promise<Moodboard | null> {
  const candidates = await listMoodboards(projectId);
  for (const p of candidates) {
    const raw = await readJson<Moodboard>(p, { id: "", title: "", assets: [] });
    if (raw.id === boardId) return raw;
  }
  return null;
}

export async function addMoodAsset(projectId: string, boardId: string, asset: Moodboard["assets"][number]) {
  const boardPath = path.join(ROOT, projectId, "moodboards", `${boardId}.json`);
  let board = await readJson<Moodboard>(boardPath, { id: boardId, title: boardId, assets: [] });
  board.assets.push(asset);
  await writeJson(boardPath, board);
}

export async function searchGuidelines(projectId: string, query: string) {
  const pre = await readPrecepts(projectId);
  const q = query.toLowerCase();
  const results: { type: string; id: string; text: string; tags?: string[] }[] = [];
  for (const p of pre.principles ?? []) {
    const hay = `${p.title}\n${p.body}\n${(p.tags ?? []).join(" ")}`.toLowerCase();
    if (hay.includes(q)) results.push({ type: "principle", id: p.id, text: `${p.title}: ${p.body}`, tags: p.tags });
  }
  for (const t of pre.tenets ?? []) {
    const hay = `${t.text}\n${(t.tags ?? []).join(" ")}`.toLowerCase();
    if (hay.includes(q)) results.push({ type: "tenet", id: t.id, text: t.text, tags: t.tags });
  }
  for (const e of pre.elements ?? []) {
    const hay = `${e.name}\n${e.description ?? ""}\n${(e.tags ?? []).join(" ")}`.toLowerCase();
    if (hay.includes(q)) results.push({ type: "element", id: e.id, text: `${e.name}: ${e.description ?? ""}`, tags: e.tags });
  }
  return results;
}

export function projectResourceUris(projectId: string) {
  const base = path.join(ROOT, projectId);
  const mk = (f: string) => `file://${path.join(base, f)}`;
  return [
    mk("brief.md"),
    mk("goals.md"),
    mk("personas.md"),
    mk("decisions.md"),
    mk("notes.md"),
    mk("principles.json"),
    mk("tenets.json"),
    mk("elements.json"),
    mk("tokens.json"),
    mk("palette.json"),
  ];
}
