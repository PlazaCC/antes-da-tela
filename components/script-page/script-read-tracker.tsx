'use client'

import { usePdfViewer } from '@/components/pdf-viewer'
import { useRecordRead } from '@/lib/hooks/use-record-read'
import posthog from 'posthog-js'
import { useEffect, useRef } from 'react'

const MILESTONES = [25, 50, 75, 100] as const

interface ScriptReadTrackerProps {
  scriptId: string
  genre: string | null
  isOwner: boolean
  /** Signed in: progress is also saved for the author's dashboard. */
  isSignedIn: boolean
}

/**
 * Reading analytics for the PDF on the script page: `script_read_started` once
 * the document loads, then `script_read_progress` the first time the reader
 * reaches 25/50/75/100% of the pages. Signed-in readers other than the author
 * also have their furthest page saved (script_reads). Renders nothing; must
 * sit inside a <PdfViewerProvider>.
 */
export function ScriptReadTracker({ scriptId, genre, isOwner, isSignedIn }: ScriptReadTrackerProps) {
  const { currentPage, totalPages, isDocumentReady } = usePdfViewer()
  const sent = useRef(new Set<number>())
  const recordRead = useRecordRead(scriptId, isSignedIn && !isOwner)

  useEffect(() => {
    sent.current = new Set()
    if (!isDocumentReady || totalPages === 0) return
    posthog.capture('script_read_started', { script_id: scriptId, genre, pages_total: totalPages, is_owner: isOwner })
    // Only once per loaded document; currentPage changes are handled below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scriptId, isDocumentReady, totalPages])

  useEffect(() => {
    if (!isDocumentReady || totalPages === 0) return
    recordRead(currentPage, totalPages)
    const percent = Math.floor((currentPage / totalPages) * 100)
    for (const milestone of MILESTONES) {
      if (percent < milestone || sent.current.has(milestone)) continue
      sent.current.add(milestone)
      posthog.capture('script_read_progress', {
        script_id: scriptId,
        genre,
        milestone,
        page: currentPage,
        pages_total: totalPages,
        is_owner: isOwner,
      })
    }
  }, [currentPage, totalPages, isDocumentReady, scriptId, genre, isOwner, recordRead])

  return null
}
