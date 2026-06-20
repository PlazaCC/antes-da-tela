import { create } from 'zustand'

/**
 * Global store holding only the page the reader is currently viewing.
 *
 * Page-scoped comments (CommentsSidebar) read this. The PDF viewer keeps its
 * own local state for zoom/total/loading and only the main reader instance
 * mirrors its visible page here (via the `syncToStore` prop) — the pitch-deck
 * modal must not move the comments' page.
 */
interface PDFViewerState {
  currentPage: number
  setCurrentPage: (page: number) => void
}

export const usePDFViewerStore = create<PDFViewerState>((set) => ({
  currentPage: 1,
  setCurrentPage: (page) => set({ currentPage: page }),
}))
