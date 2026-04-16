import dynamic from 'next/dynamic'

export const PDFViewer = dynamic(
  () => import('./pdf-viewer').then((m) => m.PDFViewerInner),
  {
    ssr: false,
    loading: () => (
      <div className='animate-pulse rounded-sm bg-elevated' style={{ height: '600px' }} />
    ),
  },
)
