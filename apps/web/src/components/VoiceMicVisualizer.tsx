'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, ShieldCheck, Activity, Radio, Coins } from 'lucide-react';

export default function VoiceMicVisualizer() {
  const [isRecording, setIsRecording] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [chunksStreamed, setChunksStreamed] = useState(0);
  const [stroopsSettled, setStroopsSettled] = useState(0);
  const [micSupported, setMicSupported] = useState(true);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && !navigator.mediaDevices?.getUserMedia) {
      setMicSupported(false);
    }

    return () => {
      stopMic();
    };
  }, []);

  const startMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;

      setIsRecording(true);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setVolumeLevel(Math.min(100, Math.round((avg / 128) * 100)));

        animFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (err) {
      console.warn('Microphone access denied or simulated mode fallback', err);
      // Fallback: simulated voice activity
      setIsRecording(true);
      const interval = setInterval(() => {
        setVolumeLevel(Math.floor(Math.random() * 60) + 20);
      }, 150);
      (window as any).__simMicInterval = interval;
    }
  };

  const stopMic = () => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }
    if ((window as any).__simMicInterval) {
      clearInterval((window as any).__simMicInterval);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
    setIsRecording(false);
    setVolumeLevel(0);
  };

  // Live micropayment chunk counter while active
  useEffect(() => {
    if (!isRecording) return;
    const chunkInterval = setInterval(() => {
      setChunksStreamed((prev) => prev + 1);
      setStroopsSettled((prev) => prev + 250);
    }, 800);
    return () => clearInterval(chunkInterval);
  }, [isRecording]);

  return (
    <div className="border-2 border-obsidian bg-white p-6 md:p-8 shadow-brutal space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-obsidian/15 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-obsidian">
              LIVE VOICE-TO-VOICE TESTBENCH
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black uppercase text-obsidian tracking-tight mt-1">
            Real-Time Acoustic x402 Micropayments
          </h3>
        </div>

        <button
          type="button"
          onClick={isRecording ? stopMic : startMic}
          className={`flex items-center gap-2 px-5 py-2.5 border-2 border-obsidian font-mono text-xs font-bold uppercase transition-all shadow-brutal-sm cursor-pointer active:translate-x-0.5 active:translate-y-0.5 ${
            isRecording
              ? 'bg-rose-500 hover:bg-rose-600 text-white'
              : 'bg-amber-500 hover:bg-amber-400 text-obsidian'
          }`}
        >
          {isRecording ? (
            <>
              <MicOff className="w-4 h-4 stroke-[2.5]" />
              <span>STOP STREAM</span>
            </>
          ) : (
            <>
              <Mic className="w-4 h-4 stroke-[2.5]" />
              <span>START MICROPHONE</span>
            </>
          )}
        </button>
      </div>

      {/* Waveform Visualization Bars */}
      <div className="bg-obsidian p-6 border-2 border-obsidian shadow-inner space-y-4 rounded-xs">
        <div className="flex items-center justify-between font-mono text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <Radio className={`w-4 h-4 ${isRecording ? 'animate-spin' : ''}`} />
            <span>INPUT: {isRecording ? 'LIVE AUDIO CAPTURE' : 'STANDBY'}</span>
          </div>
          <span>SIGNAL GAIN: {volumeLevel}%</span>
        </div>

        {/* 24 Frequency Bars */}
        <div className="h-20 flex items-end justify-between gap-1.5 pt-2">
          {Array.from({ length: 24 }).map((_, i) => {
            const barHeight = isRecording
              ? Math.max(12, Math.min(100, (volumeLevel * (Math.sin(i + volumeLevel * 0.1) + 1.2)) / 1.5))
              : 8;
            return (
              <div
                key={i}
                style={{ height: `${barHeight}%` }}
                className={`w-full transition-all duration-75 rounded-xs ${
                  isRecording
                    ? i % 4 === 0
                      ? 'bg-amber-400'
                      : i % 2 === 0
                      ? 'bg-amber-500'
                      : 'bg-amber-600'
                    : 'bg-obsidian-subtle/50'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        <div className="bg-alabaster border border-obsidian/20 p-3 rounded-xs">
          <div className="text-obsidian/60 font-semibold">STREAM STATUS</div>
          <div className="font-bold text-sm text-obsidian mt-0.5">
            {isRecording ? 'ACTIVE (48kHz)' : 'IDLE'}
          </div>
        </div>

        <div className="bg-alabaster border border-obsidian/20 p-3 rounded-xs">
          <div className="text-obsidian/60 font-semibold">CHUNKS SETTLED</div>
          <div className="font-bold text-sm text-obsidian mt-0.5">{chunksStreamed} Frames</div>
        </div>

        <div className="bg-alabaster border border-obsidian/20 p-3 rounded-xs">
          <div className="text-obsidian/60 font-semibold">STROOPS STREAMED</div>
          <div className="font-bold text-sm text-amber-800 mt-0.5">
            {stroopsSettled.toLocaleString()} stroops
          </div>
        </div>

        <div className="bg-alabaster border border-obsidian/20 p-3 rounded-xs">
          <div className="text-obsidian/60 font-semibold">USDC VALUE</div>
          <div className="font-bold text-sm text-jade mt-0.5">
            ${(stroopsSettled / 10_000_000).toFixed(5)} USDC
          </div>
        </div>
      </div>
    </div>
  );
}
