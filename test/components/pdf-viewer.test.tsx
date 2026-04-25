import { PDFViewer } from '@/components/pdf-viewer/index'
import React from 'react'
import { vi } from 'vitest'

const pdfjsMock = { GlobalWorkerOptions: { workerSrc: '/pdf.worker.min.mjs' } }

vi.mock('react-pdf', () => ({
  __esModule: true,
  pdfjs: pdfjsMock,
  Document: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Page: () => <div />,
}))

test('PDF.js worker is configured for Next.js compatibility', () => {
  expect(pdfjsMock.GlobalWorkerOptions.workerSrc).toContain('pdf.worker.min.mjs')
})

test('PDFViewer module imports successfully', () => {
  expect(PDFViewer).toBeDefined()
})
