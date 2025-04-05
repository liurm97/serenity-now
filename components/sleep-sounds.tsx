"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SleepSoundsProps {
  onClose: () => void
}

interface SoundOption {
  id: string
  name: string
  url: string
  description: string
}

export default function SleepSounds({ onClose }: SleepSoundsProps) {
  const soundOptions: SoundOption[] = [
    {
      id: "ocean",
      name: "Ocean Waves",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      description: "Gentle ocean waves to help you drift off to sleep",
    },
    {
      id: "rain",
      name: "Rainfall",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      description: "Soothing rainfall sounds for deep relaxation",
    },
    {
      id: "white-noise",
      name: "White Noise",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
      description: "Consistent white noise to block out distractions",
    },
  ]

  const [selectedSound, setSelectedSound] = useState<SoundOption>(soundOptions[0])
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }

    const handleEnded = () => {
      // For sleep sounds, we loop automatically
      audio.currentTime = 0
      audio.play()
    }

    audio.addEventListener("timeupdate", handleTimeUpdate)
    audio.addEventListener("loadedmetadata", handleLoadedMetadata)
    audio.addEventListener("ended", handleEnded)

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate)
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata)
      audio.removeEventListener("ended", handleEnded)
    }
  }, [])

  useEffect(() => {
    // When sound changes, update the audio source and reset state
    const audio = audioRef.current
    if (!audio) return

    audio.src = selectedSound.url
    audio.load()
    setCurrentTime(0)

    if (isPlaying) {
      audio.play()
    }
  }, [selectedSound, isPlaying])

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const newTime = Number.parseFloat(e.target.value)
    audio.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleSoundChange = (value: string) => {
    const newSound = soundOptions.find((sound) => sound.id === value)
    if (newSound) {
      setSelectedSound(newSound)
    }
  }

  return (
    <>
      <CardHeader className="relative bg-blue-100 rounded-t-lg">
        <Button variant="ghost" size="icon" onClick={onClose} className="absolute right-2 top-2" aria-label="Close">
          <X className="h-6 w-6" />
        </Button>
        <CardTitle className="text-2xl text-blue-800">Sleep Sounds</CardTitle>
        <CardDescription className="text-blue-600">{selectedSound.description}</CardDescription>
      </CardHeader>
      <CardContent className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex flex-col items-center space-y-6">
          <Select value={selectedSound.id} onValueChange={handleSoundChange}>
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue placeholder="Select a sound" />
            </SelectTrigger>
            <SelectContent>
              {soundOptions.map((sound) => (
                <SelectItem key={sound.id} value={sound.id}>
                  {sound.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="w-40 h-40 rounded-full bg-blue-200 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-blue-300 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full bg-blue-400 flex items-center justify-center">
                <Button
                  onClick={togglePlayPause}
                  variant="ghost"
                  size="icon"
                  className="w-16 h-16 rounded-full bg-white text-blue-600 hover:bg-blue-50"
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
                </Button>
              </div>
            </div>
          </div>

          <div className="w-full space-y-2">
            <div className="flex justify-between text-sm text-blue-700">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
              aria-label="Seek audio position"
            />
          </div>

          <audio ref={audioRef} src={selectedSound.url} preload="metadata" loop />

          <div className="w-full max-w-md">
            <div className="flex justify-center space-x-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-${8 + Math.floor(Math.random() * 16)} bg-blue-400 rounded-full animate-pulse`}
                  style={{
                    animationDuration: `${0.8 + Math.random() * 1.2}s`,
                    opacity: isPlaying ? 1 : 0.3,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </>
  )
}

