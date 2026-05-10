'use client'

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type MouseEvent,
} from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Chapter {
  start: number  // seconds
  title: string
}

interface WaveformPlayerProps {
  audioUrl: string
  peaks: number[]           // normalised 0–1, one per bar (300 recommended)
  chapters?: Chapter[]
  transcript?: string
  title?: string
  durationSeconds?: number
  mini?: boolean            // floating mini-player mode
}

const SPEEDS = [1, 1.25, 1.5, 2] as const
type Speed = (typeof SPEEDS)[number]

function formatTime(s: number): string {
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

// Single waveform bar
function Bar({
  height,
  state,
  onClick,
}: {
  height: number
  state: 'played' | 'playing' | 'unplayed'
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      aria-hidden="true"
      tabIndex={-1}
      className={`waveform-bar cursor-pointer hover:opacity-80 transition-opacity ${state}`}
      style={{ height: `${Math.max(4, height * 100)}%` }}
    />
  )
}

// Chapter divider overlaid on the waveform
function ChapterMarker({
  chapter,
  position, // 0–1
  active,
}: {
  chapter: Chapter
  position: number
  active: boolean
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="absolute top-0 bottom-0 flex flex-col items-center"
      style={{ left: `${position * 100}%` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={`w-px h-full ${active ? 'bg-amber' : 'bg-amber/30'}`} />
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute bottom-full mb-1 px-1.5 py-0.5 bg-charcoal-50 border border-amber/30 text-amber text-[10px] font-mono whitespace-nowrap pointer-events-none"
          >
            {chapter.title}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function WaveformPlayer({
  audioUrl,
  peaks,
  chapters = [],
  transcript,
  title,
  durationSeconds,
  mini = false,
}: WaveformPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const waveformRef = useRef<HTMLDivElement | null>(null)

  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(durationSeconds ?? 0)
  const [speed, setSpeed] = useState<Speed>(1)
  const [showTranscript, setShowTranscript] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const progress = duration > 0 ? currentTime / duration : 0
  const playedBars = Math.floor(progress * peaks.length)
  const currentChapterIdx = chapters.findLastIndex((c) => c.start <= currentTime)

  // Audio event handlers
  useEffect(() => {
    const audio = new Audio(audioUrl)
    audio.preload = 'metadata'
    audioRef.current = audio

    const onMeta = () => {
      if (!durationSeconds) setDuration(audio.duration)
      setLoaded(true)
    }
    const onTime = () => setCurrentTime(audio.currentTime)
    const onEnded = () => setPlaying(false)

    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('ended', onEnded)

    return () => {
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('ended', onEnded)
      audio.pause()
    }
  }, [audioUrl, durationSeconds])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play().catch(() => {})
      setPlaying(true)
    }
  }, [playing])

  const seekTo = useCallback((seconds: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Math.max(0, Math.min(seconds, audio.duration || 0))
  }, [])

  const seekByBar = useCallback(
    (barIndex: number) => {
      if (!duration) return
      seekTo((barIndex / peaks.length) * duration)
    },
    [duration, peaks.length, seekTo],
  )

  const seekByWaveformClick = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (!waveformRef.current || !duration) return
      const rect = waveformRef.current.getBoundingClientRect()
      const ratio = (e.clientX - rect.left) / rect.width
      seekTo(ratio * duration)
    },
    [duration, seekTo],
  )

  const cycleSpeed = useCallback(() => {
    const next = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length]
    setSpeed(next)
    if (audioRef.current) audioRef.current.playbackRate = next
  }, [speed])

  // Mini player — compact strip
  if (mini) {
    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-charcoal-100 border-t border-rule">
        <button
          onClick={togglePlay}
          className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-amber hover:text-paper transition-colors"
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? '❚❚' : '▶'}
        </button>
        <div
          ref={waveformRef}
          onClick={seekByWaveformClick}
          className="flex-1 flex items-center gap-px h-6 cursor-pointer"
          role="slider"
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-valuenow={currentTime}
          aria-label="Audio position"
        >
          {peaks.map((h, i) => (
            <Bar
              key={i}
              height={h}
              state={i < playedBars ? 'played' : i === playedBars && playing ? 'playing' : 'unplayed'}
              onClick={() => seekByBar(i)}
            />
          ))}
        </div>
        <span className="text-paper-dim text-xs font-mono tabular-nums shrink-0">
          {formatTime(currentTime)}
        </span>
      </div>
    )
  }

  // Full player
  return (
    <div className="border border-rule bg-charcoal-100 p-4 space-y-3">
      {/* Title row */}
      {title && (
        <div className="flex items-center gap-2">
          <span className="text-amber text-xs font-mono uppercase tracking-wider">Audio Brief</span>
          <span className="text-rule text-xs">·</span>
          <span className="text-paper-dim text-xs font-sans truncate">{title}</span>
        </div>
      )}

      {/* Waveform */}
      <div className="relative">
        <div
          ref={waveformRef}
          onClick={seekByWaveformClick}
          className="flex items-end gap-px h-16 cursor-pointer select-none"
          role="slider"
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-valuenow={currentTime}
          aria-label="Audio scrubber"
        >
          {peaks.map((h, i) => (
            <Bar
              key={i}
              height={h}
              state={i < playedBars ? 'played' : i === playedBars && playing ? 'playing' : 'unplayed'}
              onClick={() => seekByBar(i)}
            />
          ))}
        </div>

        {/* Chapter markers overlaid on waveform */}
        {chapters.map((ch, i) => (
          <ChapterMarker
            key={i}
            chapter={ch}
            position={duration > 0 ? ch.start / duration : 0}
            active={i === currentChapterIdx}
          />
        ))}
      </div>

      {/* Current chapter label */}
      {chapters.length > 0 && currentChapterIdx >= 0 && (
        <div className="text-paper-dim text-xs font-mono">
          {chapters[currentChapterIdx].title}
        </div>
      )}

      {/* Controls row */}
      <div className="flex items-center gap-3">
        {/* Play/pause */}
        <button
          onClick={togglePlay}
          disabled={!loaded}
          className="flex-shrink-0 w-9 h-9 flex items-center justify-center border border-amber/30 text-amber hover:bg-amber hover:text-charcoal transition-colors disabled:opacity-40"
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? '❚❚' : '▶'}
        </button>

        {/* Time */}
        <span className="text-paper-dim text-xs font-mono tabular-nums shrink-0">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Chapter jump buttons */}
        {chapters.length > 1 && (
          <div className="flex gap-1">
            {chapters.map((ch, i) => (
              <button
                key={i}
                onClick={() => seekTo(ch.start)}
                className={`px-2 py-1 text-[10px] font-mono border transition-colors ${
                  i === currentChapterIdx
                    ? 'border-amber text-amber'
                    : 'border-rule text-paper-dim hover:border-amber/50'
                }`}
                title={ch.title}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}

        {/* Speed control */}
        <button
          onClick={cycleSpeed}
          className="px-2 py-1 text-[10px] font-mono border border-rule text-paper-dim hover:border-amber/50 hover:text-amber transition-colors"
          aria-label={`Playback speed: ${speed}×`}
        >
          {speed}×
        </button>

        {/* Transcript toggle */}
        {transcript && (
          <button
            onClick={() => setShowTranscript((v) => !v)}
            className={`px-2 py-1 text-[10px] font-mono border transition-colors ${
              showTranscript
                ? 'border-amber text-amber'
                : 'border-rule text-paper-dim hover:border-amber/50'
            }`}
          >
            TRANSCRIPT
          </button>
        )}
      </div>

      {/* Transcript */}
      <AnimatePresence>
        {showTranscript && transcript && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3 border-t border-rule">
              <p className="text-paper-dim text-sm leading-relaxed font-sans whitespace-pre-wrap max-h-48 overflow-y-auto scrollbar-amber">
                {transcript}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Floating persistent mini-player — appears when user scrolls past the main player
export function FloatingPlayer(props: WaveformPlayerProps) {
  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 60, opacity: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50"
    >
      <WaveformPlayer {...props} mini />
    </motion.div>
  )
}
