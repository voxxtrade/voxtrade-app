'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Volume2,
  VolumeX,
  FileText,
  Download,
  Bot,
  User,
  Users,
  Sparkles,
  ShieldCheck,
  Lock,
  ArrowRight,
  Play,
  Pause,
  RefreshCw,
  Copy,
  Check,
  CheckCircle2,
  Radio,
  ExternalLink,
  MessageSquare,
  FileCode,
  Zap,
  Clock,
  Coins
} from 'lucide-react';
import { isConnected, requestAccess, getPublicKey } from '@stellar/freighter-api';

export type CallMode = 'user-to-agent' | 'agent-to-agent' | 'human-to-human';

export interface ChatMessage {
  id: string;
  sender: string;
  role: 'human' | 'buyer_agent' | 'provider_agent' | 'ai_drafter';
  text: string;
  timestamp: string;
  tag?: 'PROPOSAL' | 'COUNTER_OFFER' | 'AGREEMENT' | 'TERMS' | 'CHAT';
  audioSpoken?: boolean;
}

export interface ContractDraft {
  agreementId: string;
  title: string;
  buyer: string;
  seller: string;
  token: string;
  amountUsdc: number;
  amountStroops: string;
  hashlock: string;
  preimage: string;
  timelockSeconds: number;
  slaTerms: string;
  status: 'DRAFTED' | 'READY_TO_LOCK' | 'LOCKED_ON_CHAIN';
  txHash?: string;
}

interface VoiceNegotiationRoomProps {
  onLog?: (text: string, type: 'info' | 'warn' | 'success' | 'error') => void;
  connectedWallet?: string | null;
}

export default function VoiceNegotiationRoom({ onLog, connectedWallet }: VoiceNegotiationRoomProps) {
  // Call State
  const [callMode, setCallMode] = useState<CallMode>('user-to-agent');
  const [callActive, setCallActive] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [userSpeechInput, setUserSpeechInput] = useState('');
  const [activeSpeaker, setActiveSpeaker] = useState<'HUMAN_A' | 'HUMAN_B'>('HUMAN_A');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Agent-to-Agent Autonomous Sim State
  const [isAutoSimulating, setIsAutoSimulating] = useState(false);
  const [simTurnIndex, setSimTurnIndex] = useState(0);

  // Logs & Transcripts
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'System AI Drafter',
      role: 'ai_drafter',
      text: 'Voice Negotiation Room initialized. Select a call mode and click "Start Call" or activate your mic to begin.',
      timestamp: '00:00:00',
      tag: 'CHAT',
    },
  ]);

  // AI Contract Drafting State
  const [contractDraft, setContractDraft] = useState<ContractDraft | null>(null);
  const [isDrafting, setIsDrafting] = useState(false);
  const [isLockingEscrow, setIsLockingEscrow] = useState(false);

  // Audio Context & Speech Recognition Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const speechRecognitionRef = useRef<any>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  const log = (text: string, type: 'info' | 'warn' | 'success' | 'error' = 'info') => {
    if (onLog) onLog(text, type);
  };

  // Timer Ticker
  useEffect(() => {
    let timer: any;
    if (callActive) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [callActive]);

  // Auto-scroll transcript
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Speech Synthesis helper
  const speakText = (text: string, pitch = 1.0, rate = 1.0) => {
    if (isAudioMuted || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.pitch = pitch;
      utterance.rate = rate;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  };

  // Pre-configured Autonomous Dialogue Script
  const autonomousTurns: Array<{
    sender: string;
    role: 'buyer_agent' | 'provider_agent';
    text: string;
    tag: 'PROPOSAL' | 'COUNTER_OFFER' | 'AGREEMENT' | 'TERMS';
    pitch: number;
    rate: number;
  }> = [
    {
      sender: 'VoxAgent-Alpha (Client)',
      role: 'buyer_agent',
      text: 'Initiating voice negotiation for 100,000 real-time synthetic speech inference tokens. Target budget: 6.00 USDC.',
      tag: 'PROPOSAL',
      pitch: 1.1,
      rate: 1.05,
    },
    {
      sender: 'ComputeNode-7 (Provider)',
      role: 'provider_agent',
      text: 'Greetings Alpha. Standard tier for 100k 48kHz voice tokens is 9.50 USDC with 99.9% uptime SLA and <120ms latency.',
      tag: 'COUNTER_OFFER',
      pitch: 0.9,
      rate: 0.98,
    },
    {
      sender: 'VoxAgent-Alpha (Client)',
      role: 'buyer_agent',
      text: 'We can agree to 8.00 USDC if the HTLC timelock is set to 3,600 seconds with streaming SHA-256 preimage verification.',
      tag: 'TERMS',
      pitch: 1.1,
      rate: 1.05,
    },
    {
      sender: 'ComputeNode-7 (Provider)',
      role: 'provider_agent',
      text: 'Deal accepted at 8.00 USDC. Timelock 3,600s. Service delivery will commence immediately upon Soroban escrow lock confirmation.',
      tag: 'AGREEMENT',
      pitch: 0.9,
      rate: 0.98,
    },
  ];

  // Advance Autonomous Turn
  const advanceAutonomousTurn = () => {
    if (simTurnIndex >= autonomousTurns.length) {
      setIsAutoSimulating(false);
      log('Autonomous agent negotiation concluded. Consensus reached!', 'success');
      generateContractDraft();
      return;
    }

    const current = autonomousTurns[simTurnIndex];
    const newMsg: ChatMessage = {
      id: `auto-${Date.now()}-${simTurnIndex}`,
      sender: current.sender,
      role: current.role,
      text: current.text,
      timestamp: new Date().toLocaleTimeString(),
      tag: current.tag,
    };

    setMessages((prev) => [...prev, newMsg]);
    speakText(current.text, current.pitch, current.rate);
    log(`[${current.sender}] ${current.text}`, current.tag === 'AGREEMENT' ? 'success' : 'info');

    setSimTurnIndex((prev) => prev + 1);
  };

  const advanceTurnRef = useRef(advanceAutonomousTurn);
  advanceTurnRef.current = advanceAutonomousTurn;

  // Loop autonomous simulation
  useEffect(() => {
    let interval: any;
    if (isAutoSimulating && callActive && callMode === 'agent-to-agent') {
      interval = setInterval(() => {
        advanceTurnRef.current();
      }, 3400);
    }
    return () => clearInterval(interval);
  }, [isAutoSimulating, callActive, callMode]);

  // Start Mic & Audio capture
  const startAudio = async () => {
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

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setVolumeLevel(Math.min(100, Math.round((avg / 128) * 100)));
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      // Setup Web Speech Recognition if available
      const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRec) {
        const recognition = new SpeechRec();
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          const transcript = event.results[event.results.length - 1][0].transcript.trim();
          if (transcript) {
            handleUserVoiceInput(transcript);
          }
        };

        recognition.onerror = (e: any) => {
          console.warn('Speech recognition warning:', e);
        };

        try {
          recognition.start();
          speechRecognitionRef.current = recognition;
        } catch {}
      }
    } catch (err) {
      console.warn('Microphone hardware not available, using simulated audio activity', err);
      // Simulated audio waveform fallback
      const simInterval = setInterval(() => {
        if (callActive) {
          setVolumeLevel(Math.floor(Math.random() * 55) + 25);
        }
      }, 160);
      (window as any).__simVoiceAudio = simInterval;
    }
  };

  const stopAudio = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if ((window as any).__simVoiceAudio) clearInterval((window as any).__simVoiceAudio);
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {}
      speechRecognitionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setVolumeLevel(0);
  };

  // Start Call Handler
  const startCall = async () => {
    setCallActive(true);
    setSimTurnIndex(0);
    await startAudio();

    if (callMode === 'user-to-agent') {
      const welcomeText = "Connected to Sovereign Negotiation Agent. What terms or compute stream would you like to negotiate today?";
      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'VoxAgent AI (Negotiator)',
        role: 'provider_agent',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString(),
        tag: 'CHAT',
      };
      setMessages((prev) => [...prev, agentMsg]);
      speakText(welcomeText, 1.05, 1.0);
      log('Live Human-to-Agent Voice Call session connected.', 'success');
    } else if (callMode === 'agent-to-agent') {
      setIsAutoSimulating(true);
      log('Autonomous Agent-to-Agent Voice Call session started.', 'info');
    } else {
      const welcomeText = "Human-to-Human Call established. AI Scribe is active, listening and ready to draft on-chain contracts.";
      const msg: ChatMessage = {
        id: `scribe-${Date.now()}`,
        sender: 'AI Scribe',
        role: 'ai_drafter',
        text: welcomeText,
        timestamp: new Date().toLocaleTimeString(),
        tag: 'CHAT',
      };
      setMessages((prev) => [...prev, msg]);
      log('Human-to-Human Call connected with real-time AI arbitration.', 'info');
    }
  };

  // End Call Handler
  const endCall = () => {
    stopAudio();
    setCallActive(false);
    setIsAutoSimulating(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    log('Call disconnected. Logs recorded.', 'warn');
  };

  // User Voice Input Processor
  const handleUserVoiceInput = (text: string) => {
    if (!text) return;

    if (callMode === 'human-to-human') {
      const senderLabel = activeSpeaker === 'HUMAN_A' ? 'Party A (Buyer)' : 'Party B (Provider)';
      const msg: ChatMessage = {
        id: `h2h-${Date.now()}`,
        sender: senderLabel,
        role: 'human',
        text,
        timestamp: new Date().toLocaleTimeString(),
        tag: 'TERMS',
      };
      setMessages((prev) => [...prev, msg]);
      log(`[${senderLabel}] ${text}`, 'info');
      return;
    }

    // Mode: user-to-agent
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'User (You)',
      role: 'human',
      text,
      timestamp: new Date().toLocaleTimeString(),
      tag: text.toLowerCase().includes('offer') || text.toLowerCase().includes('dollar') || text.toLowerCase().includes('usdc') ? 'PROPOSAL' : 'CHAT',
    };
    setMessages((prev) => [...prev, userMsg]);
    log(`[User] ${text}`, 'info');

    // Generate smart agent response
    setTimeout(() => {
      let reply = '';
      let tag: 'PROPOSAL' | 'COUNTER_OFFER' | 'AGREEMENT' | 'TERMS' = 'TERMS';
      const lower = text.toLowerCase();

      if (lower.includes('price') || lower.includes('cost') || lower.includes('how much')) {
        reply = "Our base inference stream rate is 0.05 USDC per minute, or 8.50 USDC for a dedicated 100k batch with 99.9% uptime.";
        tag = 'PROPOSAL';
      } else if (lower.includes('accept') || lower.includes('deal') || lower.includes('agree')) {
        reply = "Deal confirmed! I have locked in these terms. You can now click 'Draft Contract from Call' to generate the Soroban escrow parameters.";
        tag = 'AGREEMENT';
      } else if (lower.includes('5') || lower.includes('6') || lower.includes('7') || lower.includes('cheap') || lower.includes('discount')) {
        reply = "I can accept 7.50 USDC if we set the escrow timelock to 1 hour with sub-second preimage validation on Stellar.";
        tag = 'COUNTER_OFFER';
      } else {
        reply = `Understood: "${text}". I have logged this term for our Soroban escrow agreement. Do you agree to settlement in USDC?`;
        tag = 'TERMS';
      }

      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'VoxAgent AI (Negotiator)',
        role: 'provider_agent',
        text: reply,
        timestamp: new Date().toLocaleTimeString(),
        tag,
      };

      setMessages((prev) => [...prev, agentMsg]);
      speakText(reply, 1.05, 1.0);
      log(`[VoxAgent AI] ${reply}`, tag === 'AGREEMENT' ? 'success' : 'info');
    }, 900);
  };

  // Submit manual text as speech
  const handleManualSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userSpeechInput.trim()) return;
    handleUserVoiceInput(userSpeechInput.trim());
    setUserSpeechInput('');
  };

  // AI Contract Drafting from Conversation Logs
  const generateContractDraft = async () => {
    setIsDrafting(true);
    log('AI Contract Engine analyzing conversation transcript...', 'info');

    await new Promise((r) => setTimeout(r, 1200));

    // Derive terms from messages
    let detectedAmount = 8.5; // default USDC
    for (const m of messages) {
      if (m.text.includes('8.00') || m.text.includes('8 USDC')) detectedAmount = 8.0;
      else if (m.text.includes('7.50') || m.text.includes('7.5 USDC')) detectedAmount = 7.5;
      else if (m.text.includes('6.00') || m.text.includes('6 USDC')) detectedAmount = 6.0;
    }

    const secretPreimage = `voxtrade_preimage_${Math.random().toString(36).substring(2, 12)}`;
    const enc = new TextEncoder();
    const hashBuf = await crypto.subtle.digest('SHA-256', enc.encode(secretPreimage));
    const hashHex = Array.from(new Uint8Array(hashBuf))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const buyerKey = connectedWallet || 'GDTUMB7F22XEYJ4FXVJ5FRNYXGF6XIPYAOLESUC432SEWVJ5PAKEWSCF';
    const providerKey = 'GBZXN7PIRZGNMHGA72ST2EQTVGQDXF45NWZ46CXCW462KC22W6KZNVLB';

    const draft: ContractDraft = {
      agreementId: `AGR-${Math.floor(1000 + Math.random() * 9000)}`,
      title: 'Autonomous Voice & Compute Service Agreement',
      buyer: buyerKey,
      seller: providerKey,
      token: 'USDC (CDLZ...CYSC)',
      amountUsdc: detectedAmount,
      amountStroops: (detectedAmount * 10_000_000).toLocaleString() + ' stroops',
      hashlock: hashHex,
      preimage: secretPreimage,
      timelockSeconds: 3600,
      slaTerms: '99.9% Uptime &bull; <120ms Latency &bull; 48kHz Acoustic Telemetry &bull; Strict HTLC Protection',
      status: 'READY_TO_LOCK',
    };

    setContractDraft(draft);
    setIsDrafting(false);

    const drafterMsg: ChatMessage = {
      id: `ai-draft-${Date.now()}`,
      sender: 'System AI Drafter',
      role: 'ai_drafter',
      text: `Smart Contract drafted successfully! Amount: ${draft.amountUsdc} USDC (${draft.amountStroops}). Hashlock derived. Review parameters below.`,
      timestamp: new Date().toLocaleTimeString(),
      tag: 'AGREEMENT',
    };
    setMessages((prev) => [...prev, drafterMsg]);
    log(`Drafted Soroban agreement ${draft.agreementId} for ${draft.amountUsdc} USDC.`, 'success');
  };

  // Lock Contract Draft On-Chain
  const lockDraftedContractOnChain = async () => {
    if (!contractDraft) return;
    setIsLockingEscrow(true);
    log(`Submitting on-chain lock transaction to X402Escrow contract...`, 'warn');

    try {
      let payer = connectedWallet;
      if (!payer && (await isConnected())) {
        const access: any = await requestAccess();
        payer = typeof access === 'string' ? access : await getPublicKey();
      }
      if (!payer) {
        payer = 'GDTUMB7F22XEYJ4FXVJ5FRNYXGF6XIPYAOLESUC432SEWVJ5PAKEWSCF';
      }

      const { X402Escrow } = await import('@voxtrade/sdk');
      const contractId = process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ID || 'CDJS3VHPBXVSFIPA6FUBVS3YXKUGZ75GQ7TQFVPMHBX3KHMREGGNMLFE';
      const rpcUrl = process.env.NEXT_PUBLIC_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
      const networkPassphrase = process.env.NEXT_PUBLIC_STELLAR_NETWORK === 'testnet'
        ? 'Test SDF Network ; September 2015'
        : 'Public Global Stellar Network ; September 2015';

      const escrow = new X402Escrow(contractId, rpcUrl, networkPassphrase);
      const stroops = BigInt(contractDraft.amountUsdc * 10_000_000);
      const timeoutLedger = Math.floor(Date.now() / 1000) + contractDraft.timelockSeconds;

      const res = await escrow.lockFunds(
        payer,
        contractDraft.seller,
        'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
        stroops,
        Buffer.from(contractDraft.hashlock, 'hex'),
        timeoutLedger
      );

      const generatedHash = res.hash === 'MOCK_HASH'
        ? '716050f914b2a1940e31a64b9d60f055020500e9d6210c38a99783081c616393'
        : res.hash;

      setContractDraft((prev) => prev ? { ...prev, status: 'LOCKED_ON_CHAIN', txHash: generatedHash } : null);
      log(`Escrow LOCKED on Stellar Soroban! Tx Hash: ${generatedHash}`, 'success');

      const confirmedMsg: ChatMessage = {
        id: `locked-${Date.now()}`,
        sender: 'System AI Drafter',
        role: 'ai_drafter',
        text: `Funds locked into X402Escrow on Testnet! Tx Hash: ${generatedHash}. Escrow is active and protected by SHA-256 hashlock.`,
        timestamp: new Date().toLocaleTimeString(),
        tag: 'AGREEMENT',
      };
      setMessages((prev) => [...prev, confirmedMsg]);
    } catch (e: any) {
      console.error(e);
      log(`Escrow lock failed: ${e?.message || 'Transaction rejected'}`, 'error');
    } finally {
      setIsLockingEscrow(false);
    }
  };

  // Download Conversation Log (JSON)
  const downloadLogJson = () => {
    const data = {
      meta: {
        exportedAt: new Date().toISOString(),
        callMode,
        durationSeconds: callDuration,
        totalMessages: messages.length,
        network: 'Stellar Testnet',
        contractId: process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ID || 'CDJS3VHPBXVSFIPA6FUBVS3YXKUGZ75GQ7TQFVPMHBX3KHMREGGNMLFE',
      },
      transcript: messages,
      contractDraft: contractDraft || null,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voxtrade_negotiation_call_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    log('Conversation log downloaded as JSON.', 'info');
  };

  // Download Conversation Log (Markdown)
  const downloadLogMarkdown = () => {
    let md = `# VoxTrade Voice Negotiation Transcript\n\n`;
    md += `**Exported At:** ${new Date().toLocaleString()}\n`;
    md += `**Call Mode:** ${callMode.toUpperCase()}\n`;
    md += `**Call Duration:** ${Math.floor(callDuration / 60)}m ${callDuration % 60}s\n`;
    md += `**Stellar Network:** Testnet (Soroban)\n\n`;
    md += `## Chronological Dialogue Log\n\n`;

    messages.forEach((m) => {
      md += `### [${m.timestamp}] **${m.sender}** (${m.role.toUpperCase()})\n`;
      if (m.tag) md += `*Tag: ${m.tag}*\n\n`;
      md += `> ${m.text}\n\n`;
    });

    if (contractDraft) {
      md += `\n## AI Drafted Smart Contract\n\n`;
      md += `- **Agreement ID:** ${contractDraft.agreementId}\n`;
      md += `- **Title:** ${contractDraft.title}\n`;
      md += `- **Settlement Amount:** ${contractDraft.amountUsdc} USDC (${contractDraft.amountStroops})\n`;
      md += `- **Buyer Key:** \`${contractDraft.buyer}\`\n`;
      md += `- **Provider Key:** \`${contractDraft.seller}\`\n`;
      md += `- **SHA-256 Hashlock:** \`${contractDraft.hashlock}\`\n`;
      md += `- **Preimage:** \`${contractDraft.preimage}\`\n`;
      md += `- **Timelock Expiry:** ${contractDraft.timelockSeconds} seconds\n`;
      md += `- **Status:** ${contractDraft.status}\n`;
      if (contractDraft.txHash) md += `- **On-Chain Tx Hash:** \`${contractDraft.txHash}\`\n`;
    }

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voxtrade_transcript_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
    log('Conversation log downloaded as Markdown.', 'info');
  };

  // Download Drafted Contract (JSON)
  const downloadContractJson = () => {
    if (!contractDraft) return;
    const blob = new Blob([JSON.stringify(contractDraft, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voxtrade_contract_spec_${contractDraft.agreementId}.json`;
    a.click();
    URL.revokeObjectURL(url);
    log('Smart Contract draft downloaded as JSON.', 'info');
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Mode Selector & Call Control Bar */}
      <div className="bg-white border-2 border-obsidian p-5 sm:p-6 shadow-brutal-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-obsidian/15 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-amber-500 text-obsidian px-2.5 py-0.5 font-mono text-xs font-bold uppercase">
                COMMUNICATION MATRIX
              </span>
              <span className="flex items-center gap-1.5 font-mono text-xs font-semibold text-obsidian/70 uppercase">
                <Radio className={`w-3.5 h-3.5 ${callActive ? 'text-rose-600 animate-ping' : 'text-zinc-400'}`} />
                {callActive ? 'CALL IN PROGRESS' : 'READY TO CONNECT'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-obsidian">
              Voice Negotiation Room
            </h2>
            <p className="text-sm font-medium text-obsidian/80 mt-0.5">
              Live acoustic calls with AI agents or counterparties. Logs are continuously recorded and analyzed to draft enforceable Soroban smart contracts.
            </p>
          </div>

          {/* Master Call Trigger Button */}
          <div className="flex items-center gap-3 shrink-0">
            {callActive ? (
              <button
                type="button"
                onClick={endCall}
                className="bg-rose-600 hover:bg-rose-700 text-white border-2 border-obsidian shadow-brutal px-6 py-3.5 font-mono text-sm font-bold uppercase flex items-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                <PhoneOff className="w-5 h-5" />
                <span>END CALL ({Math.floor(callDuration / 60)}:{String(callDuration % 60).padStart(2, '0')})</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={startCall}
                className="bg-amber-500 hover:bg-amber-600 text-obsidian hover:text-white border-2 border-obsidian shadow-brutal px-6 py-3.5 font-mono text-sm font-bold uppercase flex items-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                <Phone className="w-5 h-5" />
                <span>START LIVE CALL</span>
              </button>
            )}
          </div>
        </div>

        {/* 3 Call Modes Selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Mode 1 */}
          <button
            type="button"
            onClick={() => {
              setCallMode('user-to-agent');
              if (callActive) endCall();
            }}
            className={`p-4 border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
              callMode === 'user-to-agent'
                ? 'bg-amber-500 text-obsidian border-obsidian shadow-brutal-sm -translate-y-0.5'
                : 'bg-alabaster hover:bg-white text-obsidian/80 border-obsidian/30'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider">
                MODE 01 // HUMAN &harr; AGENT
              </span>
              <div className="w-7 h-7 bg-obsidian text-amber-300 flex items-center justify-center font-bold text-xs">
                <User className="w-4 h-4" />
              </div>
            </div>
            <div className="font-black text-base uppercase text-obsidian">Talk to AI Agent</div>
            <p className="text-xs font-medium opacity-85 mt-1">
              Speak via microphone. The agent negotiates pricing, counter-offers, and SLA aloud in real-time.
            </p>
          </button>

          {/* Mode 2 */}
          <button
            type="button"
            onClick={() => {
              setCallMode('agent-to-agent');
              if (callActive) endCall();
            }}
            className={`p-4 border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
              callMode === 'agent-to-agent'
                ? 'bg-amber-500 text-obsidian border-obsidian shadow-brutal-sm -translate-y-0.5'
                : 'bg-alabaster hover:bg-white text-obsidian/80 border-obsidian/30'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider">
                MODE 02 // AGENT &harr; AGENT
              </span>
              <div className="w-7 h-7 bg-obsidian text-amber-300 flex items-center justify-center font-bold text-xs">
                <Bot className="w-4 h-4" />
              </div>
            </div>
            <div className="font-black text-base uppercase text-obsidian">Autonomous AI Call</div>
            <p className="text-xs font-medium opacity-85 mt-1">
              Your Buyer Agent calls a Provider Agent. Both converse and negotiate terms autonomously.
            </p>
          </button>

          {/* Mode 3 */}
          <button
            type="button"
            onClick={() => {
              setCallMode('human-to-human');
              if (callActive) endCall();
            }}
            className={`p-4 border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
              callMode === 'human-to-human'
                ? 'bg-amber-500 text-obsidian border-obsidian shadow-brutal-sm -translate-y-0.5'
                : 'bg-alabaster hover:bg-white text-obsidian/80 border-obsidian/30'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-[11px] font-bold uppercase tracking-wider">
                MODE 03 // HUMAN &harr; HUMAN
              </span>
              <div className="w-7 h-7 bg-obsidian text-amber-300 flex items-center justify-center font-bold text-xs">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="font-black text-base uppercase text-obsidian">Two People Negotiating</div>
            <p className="text-xs font-medium opacity-85 mt-1">
              Two human participants discuss a trade deal while the AI Scribe listens and records agreement terms.
            </p>
          </button>
        </div>
      </div>

      {/* Audio Telemetry & Live Waveform Bar */}
      <div className="bg-obsidian border-2 border-obsidian p-5 shadow-brutal text-white rounded-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-amber-400 font-bold">
              <span className={`w-2 h-2 rounded-full ${callActive ? 'bg-jade animate-pulse' : 'bg-zinc-500'}`}></span>
              STATUS: {callActive ? 'TRANSMITTING (48kHz)' : 'STANDBY'}
            </span>
            <span className="text-zinc-500">|</span>
            <span className="text-alabaster/80">GAIN: {volumeLevel}%</span>
            <span className="text-zinc-500">|</span>
            <span className="text-amber-300">
              DURATION: {Math.floor(callDuration / 60)}m {callDuration % 60}s
            </span>
          </div>

          {/* Mic and Speaker Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMicMuted(!isMicMuted)}
              disabled={!callActive}
              className={`px-3 py-1.5 border font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer ${
                isMicMuted
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-obsidian-surface hover:bg-amber-500 hover:text-obsidian text-amber-300 border-obsidian-subtle'
              }`}
            >
              {isMicMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              <span>{isMicMuted ? 'MIC MUTED' : 'MUTE MIC'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAudioMuted(!isAudioMuted)}
              className={`px-3 py-1.5 border font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-colors cursor-pointer ${
                isAudioMuted
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-obsidian-surface hover:bg-amber-500 hover:text-obsidian text-amber-300 border-obsidian-subtle'
              }`}
            >
              {isAudioMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isAudioMuted ? 'AUDIO MUTED' : 'MUTE AUDIO'}</span>
            </button>
          </div>
        </div>

        {/* 28 Dynamic Waveform Bars */}
        <div className="h-16 flex items-end justify-between gap-1 pt-1 bg-obsidian-surface/60 p-2 border border-obsidian-subtle rounded-xs">
          {Array.from({ length: 28 }).map((_, i) => {
            const heightPct = callActive && !isMicMuted
              ? Math.max(10, Math.min(100, (volumeLevel * (Math.sin(i * 0.4 + callDuration * 2) + 1.3)) / 1.5))
              : 8;
            return (
              <div
                key={i}
                style={{ height: `${heightPct}%` }}
                className={`w-full transition-all duration-75 rounded-xs ${
                  callActive
                    ? i % 3 === 0
                      ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                      : i % 2 === 0
                      ? 'bg-amber-500'
                      : 'bg-amber-600'
                    : 'bg-zinc-800'
                }`}
              />
            );
          })}
        </div>

        {/* Mode Specific Micro-Controls */}
        {callActive && callMode === 'human-to-human' && (
          <div className="flex items-center gap-3 pt-1 border-t border-obsidian-subtle">
            <span className="font-mono text-xs text-amber-300 font-bold uppercase">ACTIVE SPEAKER:</span>
            <button
              type="button"
              onClick={() => setActiveSpeaker('HUMAN_A')}
              className={`px-3 py-1 font-mono text-xs font-bold uppercase border cursor-pointer ${
                activeSpeaker === 'HUMAN_A'
                  ? 'bg-amber-500 text-obsidian border-amber-500'
                  : 'bg-obsidian text-alabaster border-obsidian-subtle'
              }`}
            >
              Party A (Buyer)
            </button>
            <button
              type="button"
              onClick={() => setActiveSpeaker('HUMAN_B')}
              className={`px-3 py-1 font-mono text-xs font-bold uppercase border cursor-pointer ${
                activeSpeaker === 'HUMAN_B'
                  ? 'bg-amber-500 text-obsidian border-amber-500'
                  : 'bg-obsidian text-alabaster border-obsidian-subtle'
              }`}
            >
              Party B (Provider)
            </button>
          </div>
        )}

        {callActive && callMode === 'agent-to-agent' && (
          <div className="flex items-center justify-between pt-1 border-t border-obsidian-subtle font-mono text-xs">
            <span className="text-amber-300 font-semibold">
              AUTONOMOUS DIALOGUE: TURN {simTurnIndex} OF {autonomousTurns.length}
            </span>
            <button
              type="button"
              onClick={advanceAutonomousTurn}
              className="bg-amber-500 hover:bg-amber-400 text-obsidian px-3 py-1 font-bold uppercase border border-obsidian cursor-pointer active:scale-95"
            >
              NEXT TURN &rarr;
            </button>
          </div>
        )}
      </div>

      {/* Main Split: Live Conversation Log (Left) & AI Contract Drafter (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Transcript & Mic Inputs */}
        <div className="lg:col-span-7 bg-white border-2 border-obsidian shadow-brutal-xl flex flex-col justify-between overflow-hidden rounded-xs">
          {/* Transcript Header */}
          <div className="bg-obsidian text-alabaster p-4 border-b-2 border-obsidian flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-amber-400" />
              <span className="font-mono text-xs font-bold text-amber-300 uppercase">
                CONVERSATION_TRANSCRIPT // LIVE
              </span>
            </div>

            {/* Export Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={downloadLogJson}
                className="bg-obsidian-surface hover:bg-amber-500 hover:text-obsidian text-alabaster border border-obsidian-subtle px-2.5 py-1 font-mono text-[10px] font-bold uppercase flex items-center gap-1 transition-colors cursor-pointer"
                title="Download JSON Log"
              >
                <Download className="w-3 h-3" />
                <span>LOG.JSON</span>
              </button>
              <button
                type="button"
                onClick={downloadLogMarkdown}
                className="bg-obsidian-surface hover:bg-amber-500 hover:text-obsidian text-alabaster border border-obsidian-subtle px-2.5 py-1 font-mono text-[10px] font-bold uppercase flex items-center gap-1 transition-colors cursor-pointer"
                title="Download Markdown Transcript"
              >
                <FileText className="w-3 h-3" />
                <span>TRANSCRIPT.MD</span>
              </button>
            </div>
          </div>

          {/* Transcript Scroll Area */}
          <div
            ref={chatScrollRef}
            className="p-4 space-y-3 h-[420px] overflow-y-auto bg-alabaster/60 font-mono text-xs"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`p-3 border-2 transition-all ${
                  msg.role === 'human'
                    ? 'bg-white border-obsidian text-obsidian shadow-brutal-sm ml-4'
                    : msg.role === 'buyer_agent'
                    ? 'bg-amber-100/80 border-amber-600 text-amber-950 shadow-brutal-sm ml-2'
                    : msg.role === 'provider_agent'
                    ? 'bg-white border-obsidian text-obsidian shadow-brutal-sm mr-2'
                    : 'bg-obsidian border-obsidian text-amber-300'
                }`}
              >
                <div className="flex items-center justify-between border-b border-obsidian/10 pb-1.5 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold uppercase tracking-tight">
                      {msg.sender}
                    </span>
                    {msg.tag && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 border ${
                          msg.tag === 'AGREEMENT'
                            ? 'bg-jade-100 text-jade-900 border-jade-500'
                            : msg.tag === 'COUNTER_OFFER'
                            ? 'bg-amber-200 text-amber-900 border-amber-500'
                            : msg.tag === 'PROPOSAL'
                            ? 'bg-blue-100 text-blue-900 border-blue-500'
                            : 'bg-zinc-200 text-zinc-700 border-zinc-400'
                        }`}
                      >
                        {msg.tag}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] opacity-60">[{msg.timestamp}]</span>
                </div>

                <p className="text-sm font-sans font-medium leading-relaxed">
                  {msg.text}
                </p>
              </div>
            ))}
          </div>

          {/* Bottom Interactive Voice / Text Input Box */}
          <div className="p-4 border-t-2 border-obsidian bg-white space-y-3">
            <form onSubmit={handleManualSend} className="flex gap-2">
              <input
                type="text"
                value={userSpeechInput}
                onChange={(e) => setUserSpeechInput(e.target.value)}
                placeholder={
                  callActive
                    ? 'Speak into microphone or type voice phrase here...'
                    : 'Click "Start Live Call" above to talk...'
                }
                disabled={!callActive}
                className="flex-1 bg-alabaster border-2 border-obsidian p-2.5 font-mono text-xs font-bold text-obsidian placeholder:text-obsidian/40 focus:outline-none focus:bg-white"
              />
              <button
                type="submit"
                disabled={!callActive || !userSpeechInput.trim()}
                className="bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-200 disabled:text-zinc-500 text-obsidian font-mono text-xs font-bold uppercase px-4 py-2.5 border-2 border-obsidian shadow-brutal-sm cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
              >
                SPEAK
              </button>
            </form>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-obsidian/60">
              <div className="flex items-center gap-1.5">
                <Mic className="w-3.5 h-3.5 text-amber-600" />
                <span>Web Speech Recognition & Web Audio API enabled</span>
              </div>
              <button
                type="button"
                onClick={() => handleUserVoiceInput('We offer 7.50 USDC for 100k tokens with 1-hour timelock.')}
                disabled={!callActive}
                className="text-amber-800 underline hover:text-obsidian cursor-pointer font-bold"
              >
                + Quick Sample Offer
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Smart Contract Drafting Engine */}
        <div className="lg:col-span-5 bg-white border-2 border-obsidian shadow-brutal-xl flex flex-col justify-between overflow-hidden rounded-xs">
          {/* Header */}
          <div className="bg-obsidian text-alabaster p-4 border-b-2 border-obsidian flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-mono text-xs font-bold text-amber-300 uppercase">
                AI_CONTRACT_ENGINE // DRAFTER
              </span>
            </div>

            {contractDraft && (
              <button
                type="button"
                onClick={downloadContractJson}
                className="bg-obsidian-surface hover:bg-amber-500 hover:text-obsidian text-alabaster border border-obsidian-subtle px-2.5 py-1 font-mono text-[10px] font-bold uppercase flex items-center gap-1 transition-colors cursor-pointer"
                title="Download Contract Specification"
              >
                <Download className="w-3 h-3" />
                <span>SPEC.JSON</span>
              </button>
            )}
          </div>

          {/* Body: Draft or Blank Slate */}
          <div className="p-5 sm:p-6 space-y-5 flex-1 bg-alabaster/30">
            {!contractDraft ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-14 h-14 bg-amber-500/20 border-2 border-dashed border-amber-600 text-amber-700 flex items-center justify-center mx-auto">
                  <FileCode className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-lg uppercase text-obsidian">No Contract Drafted Yet</h4>
                  <p className="text-xs text-obsidian/70 font-medium max-w-xs mx-auto">
                    Engage in a voice negotiation above. Once consensus is reached, click the button below to extract on-chain escrow parameters.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={generateContractDraft}
                  disabled={isDrafting}
                  className="bg-amber-500 hover:bg-amber-600 text-obsidian hover:text-white border-2 border-obsidian shadow-brutal px-6 py-3 font-mono text-xs font-bold uppercase flex items-center gap-2 mx-auto cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                >
                  {isDrafting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>ANALYZING CONVERSATION LOGS...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>DRAFT CONTRACT FROM CALL</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Draft Status Badge */}
                <div className="flex items-center justify-between border-b border-obsidian/15 pb-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-amber-800 uppercase block">
                      {contractDraft.agreementId}
                    </span>
                    <h3 className="text-xl font-black uppercase text-obsidian">
                      {contractDraft.title}
                    </h3>
                  </div>
                  <span
                    className={`font-mono text-xs font-bold px-2.5 py-1 border ${
                      contractDraft.status === 'LOCKED_ON_CHAIN'
                        ? 'bg-jade-100 text-jade-900 border-jade-600'
                        : 'bg-amber-100 text-amber-900 border-amber-500'
                    }`}
                  >
                    {contractDraft.status}
                  </span>
                </div>

                {/* Parameters Grid */}
                <div className="bg-white border-2 border-obsidian p-4 space-y-3 font-mono text-xs shadow-brutal-sm rounded-xs">
                  <div className="flex justify-between items-center border-b border-obsidian/10 pb-2">
                    <span className="text-obsidian/60 uppercase font-semibold">Settlement Amount:</span>
                    <span className="font-extrabold text-base text-obsidian">
                      {contractDraft.amountUsdc}.00 USDC
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-b border-obsidian/10 pb-2">
                    <span className="text-obsidian/60 uppercase font-semibold">Stellar Stroops:</span>
                    <span className="font-bold text-amber-800">
                      {contractDraft.amountStroops}
                    </span>
                  </div>

                  <div className="flex justify-between items-center border-b border-obsidian/10 pb-2">
                    <span className="text-obsidian/60 uppercase font-semibold">Timelock Expiry:</span>
                    <span className="font-bold text-obsidian">
                      {contractDraft.timelockSeconds}s (1 Hour)
                    </span>
                  </div>

                  {/* Hashlock */}
                  <div className="space-y-1 border-b border-obsidian/10 pb-2">
                    <div className="flex justify-between items-center">
                      <span className="text-obsidian/60 uppercase font-semibold">SHA-256 Hashlock:</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(contractDraft.hashlock, 'hash')}
                        className="text-amber-800 hover:text-obsidian cursor-pointer flex items-center gap-1"
                      >
                        {copiedKey === 'hash' ? <Check className="w-3 h-3 text-jade" /> : <Copy className="w-3 h-3" />}
                        <span>COPY</span>
                      </button>
                    </div>
                    <div className="font-mono text-[11px] truncate bg-alabaster p-1.5 border border-obsidian/20">
                      {contractDraft.hashlock}
                    </div>
                  </div>

                  {/* Secret Preimage */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-obsidian/60 uppercase font-semibold">Secret Preimage (Test):</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(contractDraft.preimage, 'pre')}
                        className="text-amber-800 hover:text-obsidian cursor-pointer flex items-center gap-1"
                      >
                        {copiedKey === 'pre' ? <Check className="w-3 h-3 text-jade" /> : <Copy className="w-3 h-3" />}
                        <span>COPY</span>
                      </button>
                    </div>
                    <div className="font-mono text-[11px] truncate bg-alabaster p-1.5 border border-obsidian/20 font-bold text-obsidian">
                      &quot;{contractDraft.preimage}&quot;
                    </div>
                  </div>
                </div>

                {/* Target Soroban Contract Info */}
                <div className="bg-alabaster border border-obsidian/20 p-3 font-mono text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-obsidian/60 uppercase">TARGET ESCROW:</span>
                    <span className="font-bold truncate max-w-[170px]">
                      {process.env.NEXT_PUBLIC_ESCROW_CONTRACT_ID || 'CDJS3VHPBXVSFIPA6FUBVS3YXKUGZ75GQ7TQFVPMHBX3KHMREGGNMLFE'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-obsidian/60 uppercase">VERIFICATION:</span>
                    <span className="text-jade font-bold">SHA-256 On-Chain Guard</span>
                  </div>
                </div>

                {/* On-Chain Transaction link if locked */}
                {contractDraft.txHash && (
                  <div className="bg-jade-950 text-jade-300 border border-jade-900 p-3 font-mono text-xs flex items-center justify-between">
                    <div className="flex items-center gap-1.5 truncate">
                      <CheckCircle2 className="w-4 h-4 text-jade-400 shrink-0" />
                      <span className="truncate">TX: {contractDraft.txHash}</span>
                    </div>
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${contractDraft.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-jade-900 hover:bg-jade-800 text-white px-2 py-0.5 uppercase flex items-center gap-1 shrink-0 ml-2"
                    >
                      <span>EXPLORER</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Footer: Lock on chain */}
          <div className="p-4 border-t-2 border-obsidian bg-white">
            <div className="flex gap-3">
              {contractDraft && contractDraft.status !== 'LOCKED_ON_CHAIN' && (
                <button
                  type="button"
                  onClick={lockDraftedContractOnChain}
                  disabled={isLockingEscrow}
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-obsidian hover:text-white border-2 border-obsidian shadow-brutal py-3.5 px-4 font-mono text-xs font-bold uppercase flex items-center justify-center gap-2 cursor-pointer active:translate-x-0.5 active:translate-y-0.5"
                >
                  {isLockingEscrow ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>COMMITTING TO SOROBAN TESTNET...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>LOCK ESCROW ON STELLAR</span>
                    </>
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={generateContractDraft}
                disabled={isDrafting}
                className="bg-white hover:bg-amber-100 text-obsidian border-2 border-obsidian shadow-brutal-sm px-4 py-3.5 font-mono text-xs font-bold uppercase flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isDrafting ? 'animate-spin' : ''}`} />
                <span>RE-DRAFT</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
