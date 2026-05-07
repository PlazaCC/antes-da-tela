// Polyfill for URL.parse() — pdfjs-dist v5 uses it, not available pre-Safari 18.2
if (typeof URL !== 'undefined' && !URL.parse) {
  ;(URL as unknown as Record<string, unknown>).parse = (url: string, base?: string | URL) => {
    try {
      return new URL(url, base)
    } catch {
      return null
    }
  }
}

import '@ungap/with-resolvers'
import type * as PdfjsLib from 'pdfjs-dist'

// Module-level singleton — pdfjs-dist is loaded once across all callers.
// workerSrc points to the static file in /public, served by Next.js directly.
// Update public/pdf.worker.min.mjs when upgrading pdfjs-dist:
//   cp node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/pdf.worker.min.mjs
let _pdfjs: typeof PdfjsLib | null = null

export async function getPdfjs(): Promise<typeof PdfjsLib> {
  if (_pdfjs) return _pdfjs
  const lib = await import('pdfjs-dist')
  lib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'
  _pdfjs = lib
  return lib
}

export async function validatePdfStructure(file: File): Promise<string | null> {
  try {
    const pdfjs = await getPdfjs()
    const data = new Uint8Array(await file.arrayBuffer())
    const doc = await pdfjs.getDocument({ data }).promise
    doc.destroy()
    return null
  } catch (error) {
    return error instanceof Error ? `PDF inválido: ${error.message}` : 'PDF inválido: formato ou estrutura inválidos.'
  }
}

// Eagerly warm up the singleton on the client so pdfjs is always ready globally.
if (typeof window !== 'undefined') {
  void getPdfjs()
}
