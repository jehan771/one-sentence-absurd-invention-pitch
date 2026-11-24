import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

// The pitch: one sentence, at most 220 characters. It names a tiny everyday
// annoyance (the washing machine eating one sock), the ridiculous invention
// (the RansomWash) and its silly mechanism (the sock is held hostage until
// you apologise for overloading the machine, then returned slightly smug).
const PITCH =
  "Behold the RansomWash: a washing machine that holds one sock hostage until you apologise for overloading it, then returns it slightly smug and one shade lighter.";

const OUT_PATH = process.env.ENTRY_OUTPUT ?? "/output/entry.txt";
const MAX_CHARS = 220;

function gate(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    throw new Error("pitch is empty or only whitespace");
  }
  if (trimmed.length > MAX_CHARS) {
    throw new Error(`pitch is ${trimmed.length} characters, over the ${MAX_CHARS} limit`);
  }
  if (Buffer.byteLength(trimmed, "utf8") > MAX_CHARS) {
    throw new Error("pitch is over the limit in UTF-8 bytes");
  }
  if (/\r|\n/.test(trimmed)) {
    throw new Error("pitch must be a single line");
  }
  // Exactly one sentence: a single terminal period, at the very end, and
  // no other sentence-ending punctuation anywhere in the text.
  const terminals = (trimmed.match(/[.!?]/g) ?? []).length;
  if (terminals !== 1 || !trimmed.endsWith(".")) {
    throw new Error("pitch must be exactly one sentence ending with a period");
  }
  return trimmed;
}

const entry = gate(PITCH);
mkdirSync(dirname(OUT_PATH), { recursive: true });
writeFileSync(OUT_PATH, entry, "utf8");
// Read the file back: the bytes on disk must be exactly the pitch, or the
// run has failed and must not report success.
const written = readFileSync(OUT_PATH, "utf8");
if (written !== entry) {
  throw new Error("written entry.txt does not match the pitch");
}
if (Buffer.byteLength(written, "utf8") !== Buffer.byteLength(entry, "utf8")) {
  throw new Error("written entry.txt has an unexpected byte size");
}
console.log(`wrote ${entry.length} characters to ${OUT_PATH}`);
console.log(entry);
