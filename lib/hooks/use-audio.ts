import { useCallback, useEffect, useRef, useState } from 'react'

export const AUDIO_SPEEDS = [0.75, 1, 1.25, 1.5, 2] as const
export type AudioSpeed = (typeof AUDIO_SPEEDS)[number]

export function useAudio() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [speedIndex, setSpeedIndex] = useState(1)
  const [volume, setVolumeState] = useState(1)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTime = () => setCurrentTime(audio.currentTime)
    const onDur = () => {
      if (isFinite(audio.duration)) setDuration(audio.duration)
    }
    const onEnd = () => setPlaying(false)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('durationchange', onDur)
    audio.addEventListener('ended', onEnd)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('durationchange', onDur)
      audio.removeEventListener('ended', onEnd)
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
    const next = (speedIndex + 1) % AUDIO_SPEEDS.length
    audio.playbackRate = AUDIO_SPEEDS[next]
    setSpeedIndex(next)
  }, [speedIndex])

  const seekTo = useCallback(
    (ratio: number) => {
      const audio = audioRef.current
      if (!audio || !duration) return
      audio.currentTime = Math.max(0, Math.min(1, ratio)) * duration
    },
    [duration],
  )

  const seekBy = useCallback(
    (seconds: number) => {
      const audio = audioRef.current
      if (!audio) return
      audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + seconds))
    },
    [duration],
  )

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v))
    if (audioRef.current) audioRef.current.volume = clamped
    setVolumeState(clamped)
  }, [])

  return {
    audioRef,
    playing,
    currentTime,
    duration,
    volume,
    speed: AUDIO_SPEEDS[speedIndex],
    progress: duration > 0 ? currentTime / duration : 0,
    togglePlay,
    cycleSpeed,
    seekTo,
    seekBy,
    setVolume,
  }
}
