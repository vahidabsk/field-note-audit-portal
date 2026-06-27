async function inflateXml(method: number, bytes: Uint8Array): Promise<string> {
  if (method === 0) {
    return new TextDecoder("utf-8").decode(bytes);
  }

  if (method !== 8) {
    throw new Error(`Unsupported DOCX compression method: ${method}`);
  }

  const ds = new DecompressionStream("deflate-raw");
  const writer = ds.writable.getWriter();

  // Convert to a plain ArrayBuffer slice so TypeScript accepts it as BufferSource
  const safeBuffer = bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer;

  await writer.write(new Uint8Array(safeBuffer));
  await writer.close();

  const ab = await new Response(ds.readable).arrayBuffer();
  return new TextDecoder("utf-8").decode(ab);
}

function u16(view: DataView, offset: number) {
  return view.getUint16(offset, true);
}

function u32(view: DataView, offset: number) {
  return view.getUint32(offset, true);
}

function stripXml(xml: string) {
  return xml
    .replace(/<w:tab[^>]*\/>/g, "\t")
    .replace(/<w:br[^>]*\/>/g, "\n")
    .replace(/<w:p[^>]*>/g, "\n")
    .replace(/<\/w:p>/g, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter((line, index, arr) => !(line === "" && arr[index - 1] === ""))
    .join("\n")
    .trim();
}

export async function extractDocxText(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const view = new DataView(buffer);
  const total = view.byteLength;

  let eocdOffset = -1;

  for (let i = Math.max(0, total - 66000); i < total - 3; i++) {
    if (u32(view, i) === 0x06054b50) {
      eocdOffset = i;
    }
  }

  if (eocdOffset === -1) {
    throw new Error("DOCX ZIP end record not found");
  }

  const centralDirectoryOffset = u32(view, eocdOffset + 16);
  const centralDirectorySize = u32(view, eocdOffset + 12);

  let ptr = centralDirectoryOffset;
  const end = centralDirectoryOffset + centralDirectorySize;

  while (ptr < end) {
    if (u32(view, ptr) !== 0x02014b50) {
      break;
    }

    const compressionMethod = u16(view, ptr + 10);
    const compressedSize = u32(view, ptr + 20);
    const fileNameLength = u16(view, ptr + 28);
    const extraLength = u16(view, ptr + 30);
    const commentLength = u16(view, ptr + 32);
    const localHeaderOffset = u32(view, ptr + 42);

    const nameBytes = new Uint8Array(buffer, ptr + 46, fileNameLength);
    const entryName = new TextDecoder("utf-8").decode(nameBytes);

    if (entryName === "word/document.xml") {
      const localFileNameLength = u16(view, localHeaderOffset + 26);
      const localExtraLength = u16(view, localHeaderOffset + 28);

      const dataStart = localHeaderOffset + 30 + localFileNameLength + localExtraLength;
      const fileBytes = new Uint8Array(buffer, dataStart, compressedSize);

      const xml = await inflateXml(compressionMethod, fileBytes);
      return stripXml(xml);
    }

    ptr += 46 + fileNameLength + extraLength + commentLength;
  }

  throw new Error("word/document.xml not found in DOCX");
}