import { getDocument } from 'pdfjs-dist'

export async function validatePdfStructure(file: File): Promise<string | null> {
  try {
    const data = new Uint8Array(await file.arrayBuffer())
    const doc = await getDocument({ data }).promise
    doc.destroy()
    return null
  } catch (error) {
    return error instanceof Error ? `PDF inválido: ${error.message}` : 'PDF inválido.'
  }
}
