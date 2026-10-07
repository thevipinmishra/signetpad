import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const from = join(root, '../src/svelte/SignaturePad.svelte');
const to = join(root, '../dist/svelte/SignaturePad.svelte');
mkdirSync(dirname(to), { recursive: true });
copyFileSync(from, to);
