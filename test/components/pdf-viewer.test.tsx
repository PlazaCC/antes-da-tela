import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockDestroy = vi.fn()
const mockGetDocument = vi.fn().mockReturnValue({
  promise: Promise.resolve({ numPages: 5, destroy: mockDestroy }),
})
const mockGlobalWorkerOptions = { workerSrc: '' }

vi.mock('pdfjs-dist', () => ({
  __esModule: true,
  GlobalWorkerOptions: mockGlobalWorkerOptions,
  getDocument: mockGetDocument,
}))

vi.mock('@ungap/with-resolvers', () => ({}))

function makeFile(bytes: number[] = [1, 2, 3]) {
  const buffer = new Uint8Array(bytes).buffer as ArrayBuffer
  const file = new File([buffer], 'test.pdf', { type: 'application/pdf' })
  Object.defineProperty(file, 'arrayBuffer', {
    value: vi.fn().mockResolvedValue(buffer),
    writable: true,
  })
  return file
}

describe('URL.parse polyfill', () => {
  it('should have URL.parse defined after importing pdf utils', async () => {
    await import('@/lib/utils/pdf')
    expect(typeof URL.parse).toBe('function')
  })

  it('should parse valid URLs using polyfill', async () => {
    await import('@/lib/utils/pdf')
    const url = URL.parse('https://example.com/path')
    expect(url).not.toBeNull()
    expect(url?.href).toContain('example.com')
  })

  it('should handle invalid URLs gracefully', async () => {
    await import('@/lib/utils/pdf')
    const url = URL.parse('not a valid url')
    expect(url).toBeNull()
  })

  it('should parse URLs with base parameter', async () => {
    await import('@/lib/utils/pdf')
    const url = URL.parse('path', 'https://example.com/')
    expect(url).not.toBeNull()
    expect(url?.href).toContain('example.com')
  })
})

describe('getPdfjs', () => {
  beforeEach(() => {
    vi.resetModules()
    mockGlobalWorkerOptions.workerSrc = ''
  })

  it('returns the pdfjs-dist module', async () => {
    const { getPdfjs } = await import('@/lib/utils/pdf')
    const pdfjs = await getPdfjs()
    expect(pdfjs).toBeDefined()
    expect(typeof pdfjs.getDocument).toBe('function')
  })

  it('sets workerSrc to the static worker path', async () => {
    const { getPdfjs } = await import('@/lib/utils/pdf')
    await getPdfjs()
    expect(mockGlobalWorkerOptions.workerSrc).toBe('/pdf.worker.min.mjs')
  })

  it('returns the same instance on repeated calls (singleton)', async () => {
    const { getPdfjs } = await import('@/lib/utils/pdf')
    const a = await getPdfjs()
    const b = await getPdfjs()
    expect(a).toBe(b)
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

describe('usePdfjs hook', () => {
  beforeEach(() => {
    vi.resetModules()
    mockGlobalWorkerOptions.workerSrc = ''
  })

  it('starts as null then resolves to pdfjs instance', async () => {
    const { usePdfjs } = await import('@/lib/hooks/use-pdfjs')
    const { result } = renderHook(() => usePdfjs())
    expect(result.current).toBeNull()
    await act(async () => {})
    expect(result.current).not.toBeNull()
    expect(typeof result.current?.getDocument).toBe('function')
  })
})

describe('PDFViewer component', () => {
  it('exports PDFViewer as a defined renderable component', async () => {
    const { PDFViewer } = await import('@/components/pdf-viewer/index')
    expect(PDFViewer).toBeDefined()
    expect(PDFViewer).not.toBeNull()
  })
})
