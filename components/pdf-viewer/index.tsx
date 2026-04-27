import dynamic from 'next/dynamic'

// Force client-side only rendering — worker and browser-only APIs must not run in SSR.
export const PDFViewer = dynamic(() => import('./pdf-viewer').then((m) => m.PDFViewerInner), {
  ssr: false,
  loading: () => <div className='animate-pulse rounded-sm bg-elevated h-[600px]' />,
})
