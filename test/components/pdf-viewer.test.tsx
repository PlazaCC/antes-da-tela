import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockDestroy = vi.fn()
const mockGetDocument = vi.fn().mockReturnValue({
  promise: Promise.resolve({ numPages: 5, destroy: mockDestroy }),
})
const mockGlobalWorkerOptions = { workerSrc: '' }

vi.mock('pdfjs-dist', () => ({
  __esModule: true,
  GlobalWorkerOptions: mockGlobalWorkerOptions,
  getDocument: mockGetDocument,
  TextLayer: vi.fn(),
}))

vi.mock('@ungap/with-resolvers', () => ({}))

function makeFile(bytes: number[] = [1, 2, 3]) {
  const buffer = new Uint8Array(bytes).buffer as ArrayBuffer
  const file = new File([buffer], 'test.pdf', { type: 'application/pdf' })
  // jsdom does not implement File.arrayBuffer — define it directly
  Object.defineProperty(file, 'arrayBuffer', {
    value: vi.fn().mockResolvedValue(buffer),
    writable: true,
  })
  return file
}

describe('loadPdfjsLib', () => {
  beforeEach(() => {
    vi.resetModules()
    mockGlobalWorkerOptions.workerSrc = ''
  })

  it('sets workerSrc to pdf.worker.min.mjs via import.meta.url pattern', async () => {
    const { loadPdfjsLib } = await import('@/lib/utils/pdf')
    const lib = await loadPdfjsLib()
    expect(lib.GlobalWorkerOptions.workerSrc).toContain('pdf.worker.min.mjs')
  })

  it('returns the same instance on repeated calls (singleton)', async () => {
    const { loadPdfjsLib } = await import('@/lib/utils/pdf')
    const a = await loadPdfjsLib()
    const b = await loadPdfjsLib()
    expect(a).toBe(b)
  })

  it('only configures workerSrc on the first call', async () => {
    const { loadPdfjsLib } = await import('@/lib/utils/pdf')
    await loadPdfjsLib()
    const firstSrc = mockGlobalWorkerOptions.workerSrc
    mockGlobalWorkerOptions.workerSrc = 'overwritten-by-test'
    await loadPdfjsLib()
    // singleton returns early — workerSrc is NOT reset
    expect(mockGlobalWorkerOptions.workerSrc).toBe('overwritten-by-test')
    expect(firstSrc).toContain('pdf.worker.min.mjs')
  })
})

describe('validatePdfStructure', () => {
  beforeEach(() => {
    vi.resetModules()
    mockGetDocument.mockReturnValue({
      promise: Promise.resolve({ numPages: 5, destroy: mockDestroy }),
    })
    mockDestroy.mockReset()
  })

  it('returns null for a valid PDF', async () => {
    const { validatePdfStructure } = await import('@/lib/utils/pdf')
    const result = await validatePdfStructure(makeFile())
    expect(result).toBeNull()
  })

  it('returns error string when pdf.js throws an Error', async () => {
    mockGetDocument.mockReturnValueOnce({
      promise: Promise.reject(new Error('Invalid PDF structure')),
    })
    const { validatePdfStructure } = await import('@/lib/utils/pdf')
    const result = await validatePdfStructure(makeFile([0]))
    expect(result).toContain('PDF inválido')
    expect(result).toContain('Invalid PDF structure')
  })

  it('returns generic error string when a non-Error is thrown', async () => {
    mockGetDocument.mockReturnValueOnce({
      promise: Promise.reject('string error'),
    })
    const { validatePdfStructure } = await import('@/lib/utils/pdf')
    const result = await validatePdfStructure(makeFile([0]))
    expect(result).toBe('PDF inválido: formato ou estrutura inválidos.')
  })

  it('calls destroy on the successfully loaded document', async () => {
    const { validatePdfStructure } = await import('@/lib/utils/pdf')
    await validatePdfStructure(makeFile())
    expect(mockDestroy).toHaveBeenCalledOnce()
  })
})

describe('PDFViewer component', () => {
  it('exports PDFViewer as a defined renderable component', async () => {
    const { PDFViewer } = await import('@/components/pdf-viewer/index')
    // next/dynamic returns an object wrapper — validate it is defined and non-null
    expect(PDFViewer).toBeDefined()
    expect(PDFViewer).not.toBeNull()
  })
})
