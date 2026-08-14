/**
 * Writes a ZIP, storing entries uncompressed.
 *
 * Both callers hand it PDFs and PNGs, which are already compressed — deflating
 * them again buys a percent or two and costs the whole `CompressionStream`
 * dance, so entries are stored. That keeps this to a header layout and a CRC,
 * and it is the mirror of the reader in `docx-text.ts`, which is what the tests
 * check it against.
 */

const LOCAL_SIGNATURE = 0x04034b50;
const CENTRAL_SIGNATURE = 0x02014b50;
const EOCD_SIGNATURE = 0x06054b50;
const STORED = 0;
/** ZIP's own ceiling: sizes and offsets are 32-bit without the ZIP64 extension. */
const MAX_TOTAL = 0xffffffff;

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value >>> 0;
  }
  return table;
})();

export function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let at = 0; at < bytes.length; at += 1) {
    crc = CRC_TABLE[(crc ^ bytes[at]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export type ZipEntry = { name: string; bytes: Uint8Array };

/**
 * Names are used as written. The callers build them from a page number and the
 * uploaded file's own name, and a name that would climb out of the archive is
 * rejected rather than sanitised — silently renaming someone's file is worse
 * than telling them.
 */
function checkName(name: string): void {
  if (!name || name.length > 255) throw new Error(`Unusable entry name: "${name}"`);
  if (name.startsWith('/') || name.includes('..') || name.includes('\\')) {
    throw new Error(`Unsafe entry name: "${name}"`);
  }
}

export function writeZip(entries: ZipEntry[]): Blob {
  if (!entries.length) throw new Error('A ZIP needs at least one entry.');

  const locals: Uint8Array[] = [];
  const central: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    checkName(entry.name);
    const name = new TextEncoder().encode(entry.name);
    const sum = crc32(entry.bytes);

    const local = new DataView(new ArrayBuffer(30));
    local.setUint32(0, LOCAL_SIGNATURE, true);
    local.setUint16(4, 20, true);
    // Bit 11 marks the name as UTF-8, without which a Korean filename opens as
    // mojibake in Windows Explorer.
    local.setUint16(6, 0x0800, true);
    local.setUint16(8, STORED, true);
    local.setUint32(14, sum, true);
    local.setUint32(18, entry.bytes.length, true);
    local.setUint32(22, entry.bytes.length, true);
    local.setUint16(26, name.length, true);
    locals.push(new Uint8Array(local.buffer), name, entry.bytes);

    const directory = new DataView(new ArrayBuffer(46));
    directory.setUint32(0, CENTRAL_SIGNATURE, true);
    directory.setUint16(4, 20, true);
    directory.setUint16(6, 20, true);
    directory.setUint16(8, 0x0800, true);
    directory.setUint16(10, STORED, true);
    directory.setUint32(16, sum, true);
    directory.setUint32(20, entry.bytes.length, true);
    directory.setUint32(24, entry.bytes.length, true);
    directory.setUint16(28, name.length, true);
    directory.setUint32(42, offset, true);
    central.push(new Uint8Array(directory.buffer), name);

    offset += 30 + name.length + entry.bytes.length;
    if (offset > MAX_TOTAL) throw new Error('The archive is too large for a plain ZIP.');
  }

  const directorySize = central.reduce((total, part) => total + part.length, 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, EOCD_SIGNATURE, true);
  end.setUint16(8, entries.length, true);
  end.setUint16(10, entries.length, true);
  end.setUint32(12, directorySize, true);
  end.setUint32(16, offset, true);

  return new Blob([...locals, ...central, new Uint8Array(end.buffer)] as BlobPart[], {
    type: 'application/zip',
  });
}
