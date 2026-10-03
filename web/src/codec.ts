// Deflate compression for Firestore documents (built into browsers, no extra download).
// Firestore bills storage and downloads by bytes, so large text is stored as a compressed `z` bytes field.
// Readers accept both forms, so older uncompressed documents keep working.
import { Bytes } from 'firebase/firestore'

const COMPRESS_FROM = 200

export async function pack(text: string): Promise<{ text: string } | { z: Bytes }> {
  if (text.length < COMPRESS_FROM || typeof CompressionStream === 'undefined') return { text }
  const stream = new Blob([text]).stream().pipeThrough(new CompressionStream('deflate-raw'))
  const packed = new Uint8Array(await new Response(stream).arrayBuffer())
  return packed.length < new TextEncoder().encode(text).length ? { z: Bytes.fromUint8Array(packed) } : { text }
}

export async function unpack(data: { text?: string; z?: Bytes } | undefined): Promise<string> {
  if (!data) return ''
  if (data.z) {
    const stream = new Blob([data.z.toUint8Array() as Uint8Array<ArrayBuffer>]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
    return new Response(stream).text()
  }
  return data.text ?? ''
}

/** JSON value → `{ z }` (compressed) or `{ data }` (plain, for small values / old browsers) */
export async function packJson(value: unknown): Promise<{ data: string } | { z: Bytes }> {
  const packed = await pack(JSON.stringify(value))
  return 'z' in packed ? packed : { data: packed.text }
}

/** Reads either form written by packJson (or an old plain `data` string) */
export async function unpackJson<T>(doc: { data?: string; z?: Bytes } | undefined): Promise<T> {
  const text = doc?.z ? await unpack({ z: doc.z }) : (doc?.data ?? 'null')
  return JSON.parse(text) as T
}
