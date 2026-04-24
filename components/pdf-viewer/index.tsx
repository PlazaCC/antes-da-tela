import dynamic from 'next/dynamic'

// Force client-side only rendering for the React-PDF module
// so the worker configuration and browser-only APIs are never evaluated in SSR.
export const PDFViewer = dynamic(() => import('./pdf-viewer').then((m) => m.PDFViewerInner), {
  ssr: false,
  loading: () => <div className='animate-pulse rounded-sm bg-elevated h-[600px]' />,
})
