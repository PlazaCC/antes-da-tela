'use client'

import { useAudio } from '@/lib/hooks/use-audio'
import { useProgressScrubber } from '@/lib/hooks/use-progress-scrubber'
import { cn } from '@/lib/utils'
import { PauseIcon, PlayIcon, RotateCcw, RotateCw, Volume2 } from 'lucide-react'
import { useState } from 'react'

function formatTime(s: number) {
  if (!isFinite(s) || isNaN(s)) return '0:00'
  return `${Math.floor(s / 60)}:${Math.floor(s % 60)
    .toString()
    .padStart(2, '0')}`
}

interface Props {
  src: string
  title?: string
}

export function AudioPlayer({ src, title }: Props) {
  const {
    audioRef,
    playing,
    currentTime,
    duration,
    volume,
    speed,
    progress,
    togglePlay,
    cycleSpeed,
    seekTo,
    seekBy,
    setVolume,
  } = useAudio()
  const { barRef, onMouseDown, onTouchStart, onTouchMove } = useProgressScrubber(seekTo)
  const [hovered, setHovered] = useState(false)

  // Expand only on hover — playing state does NOT expand the bar
  const expanded = hovered

  return (
    <div
      className='fixed bottom-0 left-0 right-0 z-30 bg-surface/95 backdrop-blur-md border-t border-border-subtle'
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}>
      <audio ref={audioRef} src={src} preload='metadata' />

      {/* Scrubber */}
      <div
        ref={barRef}
        role='slider'
        aria-valuenow={Math.round(progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label='Progresso do áudio'
        className={cn(
          'relative w-full cursor-pointer select-none transition-[height] duration-300 delay-100',
          expanded ? 'h-1.5' : 'h-0.5',
        )}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}>
        <div className='absolute inset-0 bg-border-subtle' />
        <div
          className='absolute inset-y-0 left-0 bg-brand-accent transition-[width] duration-100'
          style={{ width: `${progress * 100}%` }}
        />
        <div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-brand-accent shadow-md pointer-events-none transition-opacity duration-300 delay-100',
            expanded ? 'opacity-100' : 'opacity-0',
          )}
          style={{ left: `calc(${progress * 100}% - 6px)` }}
        />
      </div>

      {/* Controls — grid keeps play button perfectly centered regardless of side content */}
      <div
        className={cn(
          'grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 w-full max-w-4xl mx-auto transition-[padding] duration-300 delay-100',
          expanded ? 'py-3' : 'py-1.5',
        )}>
        {/* Left: title */}
        <div className='flex flex-col min-w-0 overflow-hidden'>
          <span
            className={cn(
              'font-mono text-[9px] uppercase tracking-widest text-text-muted leading-none transition-all duration-300 delay-100 whitespace-nowrap overflow-hidden',
              expanded ? 'max-h-4 opacity-100 mb-0.5' : 'max-h-0 opacity-0',
            )}>
            Escuta guiada
          </span>
          {title && <span className='font-display text-[13px] text-text-primary truncate leading-snug'>{title}</span>}
        </div>

        {/* Center: always-visible controls — fixed layout so play button never shifts */}
        <div className='flex items-center gap-2 shrink-0'>
          <button
            type='button'
            onClick={() => seekBy(-30)}
            aria-label='Voltar 30 segundos'
            className='flex flex-col items-center justify-center gap-0.5 w-10 h-10 text-text-muted hover:text-text-primary transition-colors touch-manipulation'>
            <RotateCcw className='w-4 h-4' />
            <span className='font-mono text-[7px] leading-none'>30s</span>
          </button>

          <button
            type='button'
            onClick={togglePlay}
            aria-label={playing ? 'Pausar' : 'Reproduzir'}
            className='flex items-center justify-center w-10 h-10 rounded-full bg-brand-accent hover:bg-brand-accent/90 active:scale-95 transition-all shadow-md touch-manipulation shrink-0'>
            {playing ? (
              <PauseIcon className='w-4 h-4 text-white' />
            ) : (
              <PlayIcon className='w-4 h-4 text-white ml-0.5' />
            )}
          </button>

          <button
            type='button'
            onClick={() => seekBy(30)}
            aria-label='Avançar 30 segundos'
            className='flex flex-col items-center justify-center gap-0.5 w-10 h-10 text-text-muted hover:text-text-primary transition-colors touch-manipulation'>
            <RotateCw className='w-4 h-4' />
            <span className='font-mono text-[7px] leading-none'>30s</span>
          </button>
        </div>

        {/* Right: volume + time + speed */}
        <div className='flex items-center gap-2 justify-end'>
          {/* Volume — hidden below sm */}
          <div className='hidden sm:flex items-center gap-1.5'>
            <Volume2 className='w-3.5 h-3.5 text-text-muted shrink-0' />
            <input
              type='range'
              min='0'
              max='1'
              step='0.01'
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              aria-label='Volume'
              className='w-14 h-1 accent-brand-accent cursor-pointer'
            />
          </div>

          {/* Time — only expanded */}
          <span
            className={cn(
              'font-mono text-[11px] text-text-muted tabular-nums whitespace-nowrap transition-all duration-300 delay-100 overflow-hidden',
              expanded ? 'max-w-24 opacity-100' : 'max-w-0 opacity-0',
            )}>
            {formatTime(currentTime)}
            <span className='text-text-muted/40 mx-0.5'>/</span>
            {formatTime(duration)}
          </span>

          <button
            type='button'
            onClick={cycleSpeed}
            aria-label={`Velocidade: ${speed}x`}
            className='font-mono text-[11px] text-text-secondary hover:text-text-primary transition-colors px-2 py-1 min-h-[32px] min-w-[36px] rounded-sm border border-border-subtle hover:border-border-default touch-manipulation'>
            {speed === 1 ? '1×' : `${speed}×`}
          </button>
        </div>
      </div>
    </div>
  )
}
