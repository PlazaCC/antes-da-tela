import '@ungap/with-resolvers'

export type PdfjsLib = typeof import('pdfjs-dist')

let pdfjsInstance: PdfjsLib | null = null

export async function loadPdfjsLib(): Promise<PdfjsLib> {
  if (pdfjsInstance) return pdfjsInstance

  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString()

  pdfjsInstance = pdfjsLib
  return pdfjsLib
}

export async function validatePdfStructure(file: File): Promise<string | null> {
  try {
    const pdfjsLib = await loadPdfjsLib()
    const data = new Uint8Array(await file.arrayBuffer())
    const doc = await pdfjsLib.getDocument({ data }).promise
    doc.destroy()
    return null
  } catch (error) {
    return error instanceof Error
      ? `PDF inválido: ${error.message}`
      : 'PDF inválido: formato ou estrutura inválidos.'
  }
}
