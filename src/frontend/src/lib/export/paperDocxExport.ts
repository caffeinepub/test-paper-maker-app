/**
 * Export paper as a .docx file without external dependencies.
 * A .docx file is a ZIP archive containing XML files following the OOXML spec.
 * We build the archive manually using JSZip-compatible logic via Blob composition.
 *
 * Since we cannot add the `docx` or `jszip` packages, we use a minimal
 * embedded ZIP builder to produce a valid, readable .docx file.
 */
import type { Paper } from "../../state/mockData";

// ---------------------------------------------------------------------------
// Minimal CRC-32 implementation (needed for ZIP local file headers)
// ---------------------------------------------------------------------------
function makeCrcTable(): Uint32Array {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
}
const CRC_TABLE = makeCrcTable();

function crc32(buf: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// ---------------------------------------------------------------------------
// Minimal ZIP builder
// ---------------------------------------------------------------------------
interface ZipEntry {
  name: string;
  data: Uint8Array;
}

function uint16LE(n: number): Uint8Array {
  return new Uint8Array([n & 0xff, (n >> 8) & 0xff]);
}
function uint32LE(n: number): Uint8Array {
  return new Uint8Array([
    n & 0xff,
    (n >> 8) & 0xff,
    (n >> 16) & 0xff,
    (n >> 24) & 0xff,
  ]);
}
function concat(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((s, a) => s + a.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) {
    out.set(a, offset);
    offset += a.length;
  }
  return out;
}
const enc = new TextEncoder();

function buildZip(entries: ZipEntry[]): Uint8Array {
  const localHeaders: Uint8Array[] = [];
  const centralHeaders: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBytes = enc.encode(entry.name);
    const crc = crc32(entry.data);
    const size = entry.data.length;
    const modTime = 0x0000; // midnight
    const modDate = 0x0000;

    // Local file header (signature 0x04034b50)
    const local = concat(
      new Uint8Array([0x50, 0x4b, 0x03, 0x04]), // sig
      uint16LE(20), // version needed
      uint16LE(0), // flags
      uint16LE(0), // compression (stored)
      uint16LE(modTime),
      uint16LE(modDate),
      uint32LE(crc),
      uint32LE(size), // compressed size
      uint32LE(size), // uncompressed size
      uint16LE(nameBytes.length),
      uint16LE(0), // extra field len
      nameBytes,
      entry.data,
    );

    // Central directory header (signature 0x02014b50)
    const central = concat(
      new Uint8Array([0x50, 0x4b, 0x01, 0x02]), // sig
      uint16LE(20), // version made by
      uint16LE(20), // version needed
      uint16LE(0), // flags
      uint16LE(0), // compression (stored)
      uint16LE(modTime),
      uint16LE(modDate),
      uint32LE(crc),
      uint32LE(size),
      uint32LE(size),
      uint16LE(nameBytes.length),
      uint16LE(0), // extra
      uint16LE(0), // comment
      uint16LE(0), // disk start
      uint16LE(0), // internal attrs
      uint32LE(0), // external attrs
      uint32LE(offset), // local header offset
      nameBytes,
    );

    localHeaders.push(local);
    centralHeaders.push(central);
    offset += local.length;
  }

  const centralOffset = offset;
  const centralData = concat(...centralHeaders);
  const totalEntries = entries.length;

  // End of central directory (signature 0x06054b50)
  const eocd = concat(
    new Uint8Array([0x50, 0x4b, 0x05, 0x06]),
    uint16LE(0), // disk number
    uint16LE(0), // disk with central dir
    uint16LE(totalEntries), // entries on disk
    uint16LE(totalEntries), // total entries
    uint32LE(centralData.length), // central dir size
    uint32LE(centralOffset), // central dir offset
    uint16LE(0), // comment length
  );

  return concat(...localHeaders, centralData, eocd);
}

// ---------------------------------------------------------------------------
// XML helpers
// ---------------------------------------------------------------------------
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---------------------------------------------------------------------------
// Build document.xml content from Paper
// ---------------------------------------------------------------------------
function buildDocumentXml(paper: Paper): string {
  const paras: string[] = [];

  const para = (
    text: string,
    opts?: {
      bold?: boolean;
      size?: number;
      center?: boolean;
      heading?: boolean;
    },
  ) => {
    const align = opts?.center ? `<w:jc w:val="center"/>` : "";
    const pPr = align ? `<w:pPr>${align}</w:pPr>` : "";
    const bold = opts?.bold ? "<w:b/><w:bCs/>" : "";
    const sz = opts?.size
      ? `<w:sz w:val="${opts.size}"/><w:szCs w:val="${opts.size}"/>`
      : "";
    const rPr = bold || sz ? `<w:rPr>${bold}${sz}</w:rPr>` : "";
    return `<w:p>${pPr}<w:r>${rPr}<w:t xml:space="preserve">${esc(text)}</w:t></w:r></w:p>`;
  };

  const emptyPara = () => "<w:p><w:r><w:t></w:t></w:r></w:p>";

  // Title
  paras.push(
    para(paper.title || "Test Paper", { bold: true, size: 36, center: true }),
  );
  emptyPara();

  // Metadata line
  const metaParts: string[] = [];
  if (paper.board) metaParts.push(`Board: ${paper.board}`);
  if (paper.standard) metaParts.push(`Standard: ${paper.standard}`);
  if (paper.timeMinutes) metaParts.push(`Time: ${paper.timeMinutes} min`);
  if (paper.totalMarks) metaParts.push(`Total Marks: ${paper.totalMarks}`);
  if (metaParts.length > 0) {
    paras.push(para(metaParts.join("   |   "), { center: true, size: 20 }));
  }

  paras.push(emptyPara());

  // Sections
  for (const section of paper.sections) {
    paras.push(para(section.title || "Section", { bold: true, size: 26 }));

    let qNum = 0;
    for (const heading of section.headings) {
      if (heading.title) {
        paras.push(para(heading.title, { bold: true, size: 22 }));
      }

      const headingQuestions = section.questions.filter(
        (q) => q.headingId === heading.id,
      );
      for (const q of headingQuestions) {
        qNum++;
        const marksLabel = `  [${q.marks} mark${q.marks !== 1 ? "s" : ""}]`;
        // Question line with bold Q number
        const qLine = `Q${qNum}. ${q.text}${marksLabel}`;
        paras.push(para(qLine, {}));

        if (q.questionType === "mcq" && q.mcqOptions?.options) {
          for (let i = 0; i < q.mcqOptions.options.length; i++) {
            paras.push(
              para(
                `    ${String.fromCharCode(65 + i)}) ${q.mcqOptions.options[i]}`,
                { size: 20 },
              ),
            );
          }
        } else if (q.questionType === "true-false") {
          paras.push(para("    [True / False]", { size: 20 }));
        } else if (q.questionType === "fill-in-blank") {
          paras.push(para("    _______________", { size: 20 }));
        }
        paras.push(emptyPara());
      }
    }

    paras.push(emptyPara());
  }

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:wpc="http://schemas.microsoft.com/office/word/2010/wordprocessingCanvas"
  xmlns:cx="http://schemas.microsoft.com/office/drawing/2014/chartex"
  xmlns:m="http://schemas.openxmlformats.org/officeDocument/2006/math"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"
  xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006"
  xmlns:v="urn:schemas-microsoft-com:vml"
  xmlns:wp14="http://schemas.microsoft.com/office/word/2010/wordprocessingDrawing"
  xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
  xmlns:w10="urn:schemas-microsoft-com:office:word"
  xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
  xmlns:w14="http://schemas.microsoft.com/office/word/2010/wordml"
  xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml"
  xmlns:w16cex="http://schemas.microsoft.com/office/word/2018/wordml/cex"
  xmlns:w16cid="http://schemas.microsoft.com/office/word/2016/wordml/cid"
  xmlns:w16="http://schemas.microsoft.com/office/word/2018/wordml"
  xmlns:w16sdtdh="http://schemas.microsoft.com/office/word/2020/wordml/sdtdatahash"
  xmlns:w16se="http://schemas.microsoft.com/office/word/2015/wordml/symex"
  xmlns:wpg="http://schemas.microsoft.com/office/word/2010/wordprocessingGroup"
  xmlns:wpi="http://schemas.microsoft.com/office/word/2010/wordprocessingInk"
  xmlns:wne="http://schemas.microsoft.com/office/word/2006/wordml"
  xmlns:wps="http://schemas.microsoft.com/office/word/2010/wordprocessingShape"
  mc:Ignorable="w14 w15 w16se w16cid w16 w16cex w16sdtdh wp14">
  <w:body>
    ${paras.join("\n    ")}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134"/>
    </w:sectPr>
  </w:body>
</w:document>`;
}

// ---------------------------------------------------------------------------
// Static XML files required by the OOXML spec
// ---------------------------------------------------------------------------
const CONTENT_TYPES_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

const RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

const WORD_RELS_XML = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------
export async function exportPaperAsDocx(paper: Paper): Promise<void> {
  const documentXml = buildDocumentXml(paper);

  const entries: ZipEntry[] = [
    { name: "[Content_Types].xml", data: enc.encode(CONTENT_TYPES_XML) },
    { name: "_rels/.rels", data: enc.encode(RELS_XML) },
    { name: "word/document.xml", data: enc.encode(documentXml) },
    { name: "word/_rels/document.xml.rels", data: enc.encode(WORD_RELS_XML) },
  ];

  const zipBytes = buildZip(entries);
  const blob = new Blob([zipBytes.buffer as ArrayBuffer], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(paper.title || "test-paper").replace(/[^\w\s-]/g, "")}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
