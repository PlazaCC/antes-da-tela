export type PdfjsLib = typeof import('pdfjs-dist')

export async function loadPdfjsLib(): Promise<PdfjsLib> {
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString()
  return pdfjsLib
}

export async function validatePdfStructure(file: File): Promise<string | null> {
  try {
    const pdfjsLib = await loadPdfjsLib()
    const data = new Uint8Array(await file.arrayBuffer())
    const loadingTask = pdfjsLib.getDocument({ data, disableWorker: true } as Parameters<
      typeof pdfjsLib.getDocument
    >[0])
    const document = await loadingTask.promise
    document.destroy?.()
    return null
  } catch (error) {
    if (error instanceof Error) {
      return `PDF inválido: ${error.message}`
    }
    return 'PDF inválido: formato ou estrutura inválidos.'
  }
}
