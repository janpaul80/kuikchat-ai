'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VoiceMessageBubbleProps {
  url: string
  mine: boolean
  durationMs?: number
}

export function VoiceMessageBubble({ url, mine, durationMs }: VoiceMessageBubbleProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(durationMs ? durationMs / 1000 : 0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const audio = new Audio(url)
    audioRef.current = audio

    audio.onloadedmetadata = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setDuration(audio.duration)
      }
    }

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime)
      setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0)
    }

    audio.onended = () => {
      setPlaying(false)
      setCurrentTime(0)
      setProgress(0)
    }

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [url])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play().catch(() => setPlaying(false))
      setPlaying(true)
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio || !audio.duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    audio.currentTime = ratio * audio.duration
  }

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = Math.floor(sec % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  // Waveform bar heights — sine-wave-ish for authentic look
  const barHeights = [3, 5, 7, 10, 13, 11, 8, 14, 16, 12, 9, 7, 11, 15, 18, 14, 10, 8, 13, 16, 11, 9, 7, 12, 10, 8, 6, 4]

  return (
    <div className={cn(
      'flex items-center gap-3 rounded-2xl px-3 py-2.5 min-w-[200px] max-w-[280px]',
      mine
        ? 'bg-blue-600 text-white'
        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
    )}>
      {/* Play / Pause button */}
      <button
        onClick={togglePlay}
        className={cn(
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors',
          mine
            ? 'bg-white/20 hover:bg-white/30 text-white'
            : 'bg-zinc-300 dark:bg-zinc-700 hover:bg-zinc-400 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-200'
        )}
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing
          ? <Pause className="h-4 w-4 fill-current" />
          : <Play className="h-4 w-4 fill-current translate-x-px" />
        }
      </button>

      {/* Waveform + timer */}
      <div className="flex flex-1 flex-col gap-1.5">
        <div
          className="relative h-6 cursor-pointer"
          onClick={handleSeek}
          role="slider"
          aria-label="Seek audio"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="absolute inset-0 flex items-center gap-px">
            {barHeights.map((h, i) => {
              const filled = (i / barHeights.length) * 100 <= progress
              return (
                <div
                  key={i}
                  style={{ height: `${h}px` }}
                  className={cn(
                    'flex-1 rounded-full transition-colors duration-75',
                    filled
                      ? mine ? 'bg-white' : 'bg-blue-500'
                      : mine ? 'bg-white/35' : 'bg-zinc-400 dark:bg-zinc-600'
                  )}
                />
              )
            })}
          </div>
        </div>

        <div className={cn(
          'text-[10px] font-medium tabular-nums leading-none',
          mine ? 'text-blue-100' : 'text-zinc-500 dark:text-zinc-400'
        )}>
          {playing || currentTime > 0 ? formatTime(currentTime) : formatTime(duration)}
        </div>
      </div>
    </div>
  )
}
