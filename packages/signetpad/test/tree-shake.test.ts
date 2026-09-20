import { gzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { build, type BuildOptions } from 'esbuild';
import { describe, expect, it } from 'vitest';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

async function bundle(entry: string, options: BuildOptions = {}): Promise<string> {
  const result = await build({
    absWorkingDir: root,
    bundle: true,
    format: 'esm',
    platform: 'browser',
    treeShaking: true,
    minify: true,
    write: false,
    legalComments: 'none',
    logLevel: 'silent',
    ...options,
    stdin: {
      contents: entry,
      resolveDir: root,
      sourcefile: 'tree-shake-entry.ts',
      loader: 'ts',
    },
  });

  const file = result.outputFiles?.[0];
  if (!file) throw new Error('esbuild produced no output');
  return file.text;
}

describe('tree shaking', () => {
  it('keeps the core entry free of framework and renderer code', async () => {
    const code = await bundle(`import { createSignaturePad, toSvg } from './src/index.ts';
createSignaturePad();
toSvg({ version: 1, viewport: { width: 1, height: 1 }, strokes: [] });
`);

    expect(code).not.toMatch(
      /useSignaturePad|createCanvasRenderer|PanResponder|react-native-svg|onBeforeUnmount/,
    );
    expect(gzipSync(code).length).toBeLessThan(3500);
  });

  it('does not pull Vue, Svelte, or native code into the React entry', async () => {
    const code = await bundle(
      `import { useSignaturePad } from './src/react/index.ts';
export { useSignaturePad };
`,
      {
        external: ['react'],
      },
    );

    expect(code).toContain('useSignaturePad');
    expect(code).not.toMatch(
      /onBeforeUnmount|createSignaturePadAction|PanResponder|createCanvasRenderer|react-native-svg/,
    );
    expect(gzipSync(code).length).toBeLessThan(4500);
  });

  it('keeps the Canvas renderer independent of adapters', async () => {
    const code = await bundle(`import { createCanvasRenderer } from './src/canvas/index.ts';
export { createCanvasRenderer };
`);

    expect(code).toContain('createCanvasRenderer');
    expect(code).not.toMatch(/createSignaturePad|useSignaturePad|PanResponder|onBeforeUnmount/);
    expect(gzipSync(code).length).toBeLessThan(2500);
  });

  it('drops unused core helpers when only toSvg is imported', async () => {
    const code = await bundle(`import { toSvg } from './src/index.ts';
toSvg({ version: 1, viewport: { width: 1, height: 1 }, strokes: [] });
`);

    expect(code).toContain('http://www.w3.org/2000/svg');
    expect(code).not.toMatch(/createSignaturePad|minDistance|strokeSequence|canUndo/);
    expect(gzipSync(code).length).toBeLessThan(1500);
  });
});
