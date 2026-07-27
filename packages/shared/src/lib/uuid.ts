// UUID v7 (RFC 9562) — horodaté, donc trié naturellement par date de création.
// Utilisé comme clé primaire de toutes les tables (spec/data-model.md, en-tête).

function byteAt(bytes: Uint8Array, index: number): number {
  const value = bytes[index];
  if (value === undefined) {
    throw new RangeError(
      `Index ${String(index)} hors limites pour un Uint8Array de longueur ${String(bytes.length)}.`,
    );
  }
  return value;
}

export function uuidv7(): string {
  const unixTsMs = BigInt(Date.now());
  const bytes = new Uint8Array(16);

  bytes[0] = Number((unixTsMs >> 40n) & 0xffn);
  bytes[1] = Number((unixTsMs >> 32n) & 0xffn);
  bytes[2] = Number((unixTsMs >> 24n) & 0xffn);
  bytes[3] = Number((unixTsMs >> 16n) & 0xffn);
  bytes[4] = Number((unixTsMs >> 8n) & 0xffn);
  bytes[5] = Number(unixTsMs & 0xffn);

  const random = crypto.getRandomValues(new Uint8Array(10));

  // Octet 6 : version "0111" (v7) + 4 bits aléatoires de poids fort.
  bytes[6] = 0x70 | (byteAt(random, 0) & 0x0f);
  bytes[7] = byteAt(random, 1);
  // Octet 8 : variante RFC "10" + 6 bits aléatoires de poids fort.
  bytes[8] = 0x80 | (byteAt(random, 2) & 0x3f);
  bytes[9] = byteAt(random, 3);
  bytes[10] = byteAt(random, 4);
  bytes[11] = byteAt(random, 5);
  bytes[12] = byteAt(random, 6);
  bytes[13] = byteAt(random, 7);
  bytes[14] = byteAt(random, 8);
  bytes[15] = byteAt(random, 9);

  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
