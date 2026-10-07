<script lang="ts">
  import { createSignaturePadAction } from 'signetpad/svelte';
  import type { SignatureData } from 'signetpad';

  const VIEWPORT = { width: 720, height: 300 };
  const IMAGE_FORMATS = [
    { type: 'image/png', label: 'PNG', extension: 'png' },
    { type: 'image/jpeg', label: 'JPEG', extension: 'jpg' },
    { type: 'image/webp', label: 'WebP', extension: 'webp' },
  ] as const;

  const SAMPLE_SIGNATURE: SignatureData = {
    version: 1,
    viewport: VIEWPORT,
    strokes: [
      {
        id: 'sample-signature',
        style: { color: '#102935', width: 3, opacity: 1, cap: 'round', join: 'round' },
        points: [
          { x: 80, y: 170, time: 0 },
          { x: 128, y: 98, time: 12 },
          { x: 170, y: 193, time: 24 },
          { x: 220, y: 115, time: 36 },
          { x: 272, y: 177, time: 48 },
          { x: 330, y: 128, time: 60 },
          { x: 405, y: 157, time: 72 },
          { x: 502, y: 110, time: 84 },
          { x: 610, y: 154, time: 96 },
        ],
      },
    ],
  };

  let typedName = '';
  let strokeColor = '#102935';
  let strokeWidth = 3;
  let showData = false;
  let imageFormat: (typeof IMAGE_FORMATS)[number]['type'] = 'image/png';
  let status = 'Ready for a signature.';
  let canvas: HTMLCanvasElement;

  const { action, controller, snapshot } = createSignaturePadAction({
    viewport: VIEWPORT,
    stroke: { color: strokeColor, width: strokeWidth },
  });

  $: signatureData = JSON.stringify(
    $snapshot ? controller.toData() : { version: 1, viewport: VIEWPORT, strokes: [] },
    null,
    2,
  );

  function download(href: string, filename: string) {
    const link = document.createElement('a');
    link.href = href;
    link.download = filename;
    link.click();
  }

  function handleClear() {
    controller.clear();
    status = 'Signature cleared.';
  }

  function handleLoadSample() {
    controller.loadData(SAMPLE_SIGNATURE);
    status = 'Sample signature loaded.';
  }

  async function handleCopyData() {
    if ($snapshot.isEmpty) return;

    try {
      await navigator.clipboard.writeText(signatureData);
      status = 'Signature data copied.';
    } catch {
      status = 'Copy is unavailable. Select the JSON and copy it manually.';
      showData = true;
    }
  }

  function handleExportImage() {
    if ($snapshot.isEmpty) return;

    const format = IMAGE_FORMATS.find((item) => item.type === imageFormat);
    if (!format) return;

    const href = canvas.toDataURL(imageFormat);
    download(href, 'signature.' + format.extension);
    status = format.label + ' image downloaded.';
  }

  function handleExportSvg() {
    if ($snapshot.isEmpty) return;

    const svg = controller.toSvg();
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    download(url, 'signature.svg');
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    status = 'SVG image downloaded.';
  }

  function handleSave(event: Event) {
    event.preventDefault();

    if ($snapshot.isEmpty && !typedName.trim()) {
      status = 'Draw a signature or enter the signatory name.';
      return;
    }

    status = $snapshot.isEmpty
      ? 'Typed signature is ready to submit.'
      : 'Signature is ready to submit.';
  }
</script>

<main id="top" class="page-shell">
  <header class="app-header">
    <a class="example-brand" href="#top">
      <span aria-hidden="true">✎</span>
      SignetPad
    </a>
    <p>Svelte + Canvas example</p>
  </header>

  <section class="hero" aria-labelledby="page-title">
    <h1 id="page-title">A signature field with the details people notice.</h1>
    <p class="lede">
      Draw, adjust the next stroke, inspect the vector payload, or use the typed alternative. The
      controller, adapter, and renderer stay separate.
    </p>
  </section>

  <div class="example-grid">
    <form class="signature-card" onsubmit={handleSave}>
      <fieldset>
        <legend>Your signature</legend>
        <p id="signature-help" class="field-help">
          Draw with a mouse, touch, or stylus. Use the actions below to correct a stroke.
        </p>

        <div class="canvas-frame">
          <canvas
            bind:this={canvas}
            use:action={{
              enabled: true,
              preventDefault: true,
              viewport: VIEWPORT,
              stroke: { color: strokeColor, width: strokeWidth },
            }}
            class="signature-canvas"
            width={VIEWPORT.width}
            height={VIEWPORT.height}
            tabindex="0"
            aria-label="Signature drawing area"
            aria-describedby="signature-help signature-status"
          ></canvas>
        </div>

        <div class="toolbar" aria-label="Signature actions">
          <button type="button" disabled={!$snapshot.canUndo} onclick={() => controller.undo()}>
            Undo
          </button>
          <button type="button" disabled={!$snapshot.canRedo} onclick={() => controller.redo()}>
            Redo
          </button>
          <button type="button" disabled={$snapshot.isEmpty} onclick={handleClear}>Clear</button>
          <span class="stroke-count">
            {$snapshot.strokeCount}
            {$snapshot.strokeCount === 1 ? 'stroke' : 'strokes'}
          </span>
        </div>
      </fieldset>

      <div class="alternative-input">
        <label for="typed-name">Type the signatory name instead</label>
        <p id="typed-name-help" class="field-help">
          Use this option when drawing is not convenient.
        </p>
        <input
          id="typed-name"
          name="typedName"
          type="text"
          autocomplete="name"
          inputmode="text"
          bind:value={typedName}
          aria-describedby="typed-name-help"
        />
      </div>

      <div id="signature-status" class="status" role="status" aria-live="polite">
        {status}
      </div>

      <button class="save-button" type="submit">Prepare signature</button>
    </form>

    <aside class="control-panel" aria-label="Signature playground controls">
      <div class="panel-heading">
        <h2>Adjust, inspect, reuse.</h2>
      </div>

      <div class="control-group">
        <label for="stroke-color">Next stroke color</label>
        <div class="color-control">
          <input id="stroke-color" type="color" bind:value={strokeColor} />
          <code>{strokeColor}</code>
        </div>
      </div>

      <div class="control-group">
        <label for="stroke-width">
          Stroke width <output>{strokeWidth}px</output>
        </label>
        <input
          id="stroke-width"
          type="range"
          min="1"
          max="8"
          step="0.5"
          bind:value={strokeWidth}
        />
      </div>

      <div class="panel-actions">
        <button type="button" onclick={handleLoadSample}>Load sample</button>
        <button
          type="button"
          aria-expanded={showData}
          aria-controls="signature-data"
          onclick={() => (showData = !showData)}
        >
          {showData ? 'Hide data' : 'View data'}
        </button>
        <button type="button" disabled={$snapshot.isEmpty} onclick={handleCopyData}>
          Copy JSON
        </button>
      </div>

      <div class="export-group">
        <div class="export-heading">
          <label for="image-format">Export image</label>
        </div>
        <div class="export-actions">
          <select id="image-format" bind:value={imageFormat}>
            {#each IMAGE_FORMATS as format (format.type)}
              <option value={format.type}>{format.label}</option>
            {/each}
          </select>
          <button type="button" disabled={$snapshot.isEmpty} onclick={handleExportImage}>
            Download
          </button>
        </div>
        <button
          type="button"
          class="svg-export"
          disabled={$snapshot.isEmpty}
          onclick={handleExportSvg}
        >
          Download SVG
        </button>
      </div>

      {#if showData}
        <pre id="signature-data" class="data-preview">
          <code>{signatureData}</code>
        </pre>
      {/if}

      <div class="panel-note">
        <span aria-hidden="true">i</span>
        <p>
          Style applies to new strokes. Saved signatures remain intact, so review flows stay
          predictable.
        </p>
      </div>
    </aside>
  </div>

  <section class="pattern-grid" aria-label="Example highlights">
    <article>
      <span>01</span>
      <h2>Accessible input</h2>
      <p>A clear label, visible focus, corrective actions, status updates, and typed fallback.</p>
    </article>
    <article>
      <span>02</span>
      <h2>Editable data</h2>
      <p>Inspect and copy versioned vector data instead of capturing a flat image.</p>
    </article>
    <article>
      <span>03</span>
      <h2>Reusable renderer</h2>
      <p>The same controller can drive Canvas here, SVG on native, or your own output.</p>
    </article>
  </section>
</main>
