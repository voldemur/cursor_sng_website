import { copyFile, mkdir, readFile, readdir, rename, unlink, writeFile } from "fs/promises";
import path from "path";
import { CONTENT_BACKUP_KEEP } from "@/lib/config";
import { HttpError } from "@/lib/errors";
import { siteContentSchema } from "@/lib/validation/content";
import type { SiteContent } from "@/types/content";

const DATA_DIR = path.join(process.cwd(), "data");
const CONTENT_PATH = path.join(DATA_DIR, "content.json");
const BACKUP_DIR = path.join(DATA_DIR, "backups");

let writeChain: Promise<unknown> = Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = writeChain.then(task, task);
  writeChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export async function readContent(): Promise<SiteContent> {
  const raw = await readFile(CONTENT_PATH, "utf8");
  const parsed = JSON.parse(raw);
  const result = siteContentSchema.safeParse(parsed);
  if (!result.success) {
    throw new HttpError(500, "Content file is invalid");
  }
  return result.data;
}

async function persist(content: SiteContent): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await mkdir(BACKUP_DIR, { recursive: true });

  try {
    await copyFile(CONTENT_PATH, path.join(BACKUP_DIR, `content-${Date.now()}.json`));
  } catch {
    // First write may have no existing file.
  }

  const json = `${JSON.stringify(content, null, 2)}\n`;
  const tmp = path.join(DATA_DIR, `content.${process.pid}.${Date.now()}.tmp`);
  await writeFile(tmp, json, "utf8");
  await rename(tmp, CONTENT_PATH);
  await pruneBackups();
}

async function pruneBackups(): Promise<void> {
  const files = (await readdir(BACKUP_DIR))
    .filter((name) => name.startsWith("content-") && name.endsWith(".json"))
    .sort();
  const extra = files.length - CONTENT_BACKUP_KEEP;
  if (extra <= 0) return;
  await Promise.all(files.slice(0, extra).map((name) => unlink(path.join(BACKUP_DIR, name))));
}

export function writeContent(content: SiteContent): Promise<void> {
  const parsed = siteContentSchema.safeParse(content);
  if (!parsed.success) {
    throw new HttpError(400, "Invalid content payload");
  }
  return enqueue(() => persist(parsed.data));
}

export function updateContent(mutator: (current: SiteContent) => SiteContent | Promise<SiteContent>): Promise<SiteContent> {
  return enqueue(async () => {
    const current = await readContent();
    const next = await mutator(current);
    const parsed = siteContentSchema.safeParse(next);
    if (!parsed.success) {
      throw new HttpError(400, "Invalid content payload");
    }
    await persist(parsed.data);
    return parsed.data;
  });
}
