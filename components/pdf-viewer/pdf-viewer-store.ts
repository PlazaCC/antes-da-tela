import { create } from 'zustand'

interface PDFViewerState {
  currentPage: number
  totalPages: number
  zoom: number
  isLoading: boolean
  setCurrentPage: (page: number) => void
  setTotalPages: (total: number) => void
  setZoom: (zoom: number) => void
  setLoading: (loading: boolean) => void
}

export const usePDFViewerStore = create<PDFViewerState>((set) => ({
  currentPage: 1,
  totalPages: 0,
  zoom: 1.0,
  isLoading: false,
  setCurrentPage: (page) => set({ currentPage: page }),
  setTotalPages: (total) => set({ totalPages: total }),
  setZoom: (zoom) => set({ zoom }),
  setLoading: (loading) => set({ isLoading: loading }),
}))
