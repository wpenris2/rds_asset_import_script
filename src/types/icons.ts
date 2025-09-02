// Icon-related domain types: SVG classification, metadata, bindings.

export type SvgClass = 'mono' | 'color' | 'flag';

/**
 * Represents an input SVG file and its derived properties.
 * - `hash` is the content hash (used to detect changes).
 * - `type` is the classification outcome.
 */
export interface IconMeta {
  filename: string;   // e.g., 'arrow-left.svg'
  svg: string;        // raw SVG content
  hash: string;       // hex string (sha256/md5)
  type: SvgClass;     // 'mono' | 'color' | 'flag'
  codepoint?: number; // assigned later (U+EAXX area etc.)
}

/** Binding persisted across runs to keep icons stable. */
export interface Binding {
  name: string;       // public icon name (e.g., 'arrow-left')
  filename: string;   // canonical source filename
  codepoint: string;  // hex codepoint as string, e.g. 'ea01'
  addedAt: string;    // ISO timestamp when first bound
  hash: string;       // content hash captured at binding time
}

/** Map of icon name -> binding (useful for quick lookups). */
export type CodepointMap = Record<string, Binding>;