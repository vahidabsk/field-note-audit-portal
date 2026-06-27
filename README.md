# Field Note Audit Portal

Field Note Audit Portal is a frontend-only Single Page Application for UL-style fire alarm field notes. It replaces manual note capture with a tablet-friendly workflow that stores everything in the browser (`localStorage`) and supports print-ready exports.

## Stack

- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3
- Custom shadcn-style UI primitives in `src/components/ui`
- `react-router-dom` 6
- `lucide-react`
- Bun as package manager (npm is a fallback)

## Features

- Auditor onboarding modal persisted in `localStorage` under `fap.auditor`
- Dashboard with upload CTA, drag-drop zone, audit cards, export and delete actions
- Multi-certificate audit workflow with review dialog before audit creation
- DOCX extractor with browser-native `DecompressionStream` and certificate parser implementing the 10 required parsing rules
- Best-effort PDF extractor (no `pdfjs-dist`, no OCR)
- Four audit tabs: Signal Processing, Documentation, Installation, Device Testing
- Voice dictation using `SpeechRecognition` / `webkitSpeechRecognition` where supported
- Tablet/mobile photo capture using `capture="environment"` with client-side downscaling and base64 storage in `localStorage`
- Print export via `window.print()` plus CSV export
- Debounced autosave (500ms)

## Local development

### Bun

```powershell
bun install
bun run dev
```

### npm fallback

```powershell
npm install
npm run dev
```

Then open the Vite local URL shown in the terminal.

## Production build

```powershell
bun install
bun run build
```

The production-ready output is emitted to `dist/` for Render Static Site hosting.

## Render deployment

This repo includes `render.yaml` configured for Render Static Site + SPA rewrite routing. Create the GitHub repo, push to `main`, then in Render choose **New + → Blueprint** and select the repository. Render will auto-detect `render.yaml` and deploy on every push to `main`.

## Certificate extraction behavior

### DOCX extractor (reliable path)

1. Reads the `.docx` file as an `ArrayBuffer`
2. Parses the ZIP central directory in-browser to locate `word/document.xml`
3. Uses `DecompressionStream("deflate-raw")` when `document.xml` is deflate-compressed
4. Converts Word XML paragraph and tab markers into plain text
5. Runs the parser against flattened text using the mandated rules:
   - strips disclaimer text from `THIS CERTIFIES` through `ALARM SYSTEM DESCRIPTION:` first
   - matches `Protected Property:` and `Alarm Service Company:` only as standalone lines
   - splits property name/address at the first digit run
   - keeps ASC names with starting digits intact (for names like `24/7 FIRE ALARM SERVICES`)
   - extracts monitoring location / central station from `Monitoring Location:`
   - uses `_Total: N_` markers for device counts
   - preserves first match per field to avoid duplicate page content
   - shows an editable review dialog before creating or merging an audit

### PDF extractor (best effort only)

The in-browser PDF extractor intentionally avoids `pdfjs-dist` and OCR in v1. It:

1. Scans `stream ... endstream` blocks
2. Tries `deflate`, `deflate-raw`, and `gzip` via `DecompressionStream`
3. Sweeps for literal `(...)` and hex `<...>` PDF string operands
4. Concatenates printable runs and hands them to the same parser

## Honest constraints

These limitations are **real** and should be expected in v1:

- No backend: data is stored per browser and per device only
- PDF extraction is best-effort; DOCX is the reliable upload path
- Image-only / scanned PDFs cannot be parsed without OCR (not included)
- Some PDFs will fail when they use:
  - Type 0 / CID fonts with ToUnicode CMaps
  - PDF 1.5+ object streams
  - font encodings that do not expose usable literal strings
- `localStorage` is usually capped around ~5MB per origin, so large photo sets will eventually hit the browser cap even with downscaling
- Web Speech API support is best in Chrome / Edge / Android; iOS Safari typically does not support this implementation, but typing always works

## Upgrade path for fuller PDF support

For a future v2:

- Add `pdfjs-dist` for robust text extraction from modern PDFs
- Add `tesseract.js` or a server-side OCR service for scanned / image-only PDFs
- Consider IndexedDB or a lightweight backend for larger photo storage and cross-device sync

## Storage keys

- `fap.auditor` → `{ name, since }`
- `fap.audits` → serialized `Audit[]`
- `fap.photos.<photoId>` → downscaled base64 JPEG strings

## Notes on verification

This repository is structured to satisfy the acceptance criteria, but this environment cannot download packages from the internet, so I could not run `bun install && bun run build` here. Please run the commands locally or in GitHub Actions / Render to verify the final build artifact in your environment.
