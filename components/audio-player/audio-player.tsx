'use client'

import { cn } from '@/lib/utils'
import { PauseIcon, PlayIcon } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

interface Props {
  src: string
  durationSeconds?: number
  className?: string
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return '00:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const SPEEDS = [0.75, 1, 1.25, 1.5, 2] as const

export function AudioPlayer({ src, durationSeconds, className }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(durationSeconds ?? 0)
  const [speedIndex, setSpeedIndex] = useState(1)

  const speed = SPEEDS[speedIndex]

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTimeUpdate = () => setCurrentTime(audio.currentTime)
    const onDurationChange = () => { if (isFinite(audio.duration)) setDuration(audio.duration) }
    const onEnded = () => setPlaying(false)
    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('durationchange', onDurationChange)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('durationchange', onDurationChange)
      audio.removeEventListener('ended', onEnded)
    }
  }, [])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      void audio.play()
      setPlaying(true)
    }
  }, [playing])

  const cycleSpeed = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    const next = (speedIndex + 1) % SPEEDS.length
    audio.playbackRate = SPEEDS[next]
    setSpeedIndex(next)
  }, [speedIndex])

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const audio = audioRef.current
      if (!audio || !duration) return
      const rect = e.currentTarget.getBoundingClientRect()
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      audio.currentTime = ratio * duration
    },
    [duration],
  )

  const progress = duration > 0 ? currentTime / duration : 0

  return (
    <div className={cn('flex items-center gap-3 rounded-md bg-elevated border border-border-subtle px-3 py-2', className)}>
      <audio ref={audioRef} src={src} preload='metadata' />

      <button
        type='button'
        onClick={togglePlay}
        className='flex-none flex items-center justify-center w-8 h-8 rounded-full bg-brand-accent hover:bg-brand-accent/90 transition-colors'
        aria-label={playing ? 'Pausar' : 'Reproduzir'}>
        {playing ? (
          <PauseIcon className='w-3.5 h-3.5 text-text-primary' />
        ) : (
          <PlayIcon className='w-3.5 h-3.5 text-text-primary' />
        )}
      </button>

      <div className='flex flex-col gap-2 flex-1 min-w-0'>
        <div className='flex items-center justify-between'>
          <span className='font-mono text-[11px] leading-tight text-text-muted'>
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
          <button
            type='button'
            onClick={cycleSpeed}
            className='font-mono text-[11px] leading-tight text-text-secondary hover:text-text-primary transition-colors'>
            {speed === 1 ? '1x' : `${speed}x`} ▾
          </button>
        </div>

        <div
          role='slider'
          aria-valuenow={Math.round(progress * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label='Progresso do áudio'
          className='h-1 w-full rounded-full bg-border-subtle cursor-pointer'
          onClick={handleSeek}>
          <div
            className='h-full rounded-full bg-brand-accent transition-[width] duration-100'
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
