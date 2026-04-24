import { PDFJS_WORKER_SRC } from '@/lib/utils/pdf-worker'

test('PDF.js worker path uses the recommended .mjs worker in React-PDF', () => {
  expect(PDFJS_WORKER_SRC).toContain('pdf.worker.min.mjs')
})
