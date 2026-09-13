import crypto from 'crypto';

export interface VoiceDialogueTurn {
  id: string;
  sender: string;
  role: 'human' | 'buyer_agent' | 'provider_agent' | 'ai_drafter';
  text: string;
  timestamp: string;
  tag?: 'PROPOSAL' | 'COUNTER_OFFER' | 'AGREEMENT' | 'TERMS' | 'CHAT';
}

export interface VoiceNegotiationContractSpec {
  agreementId: string;
  title: string;
  buyer: string;
  seller: string;
  token: string;
  amountUsdc: number;
  amountStroops: bigint;
  hashLockHex: string;
  preimageHex: string;
  timelockSeconds: number;
  slaTerms: string;
}

/**
 * Analyzes conversational dialogue turns between agents or humans to extract agreed contract parameters.
 */
export function parseNegotiationTranscript(turns: VoiceDialogueTurn[]): {
  agreedAmountUsdc: number;
  agreedAmountStroops: bigint;
  timelockSeconds: number;
  hasConsensus: boolean;
  slaTerms: string;
} {
  let agreedAmountUsdc = 8.5; // fallback
  let timelockSeconds = 3600; // 1 hour
  let hasConsensus = false;
  let slaTerms = 'Standard Real-Time Audio Streaming SLA (<150ms latency)';

  for (const turn of turns) {
    const text = turn.text.toLowerCase();

    // Check for specific price quotations
    const matchUsdc = text.match(/([0-9]+(?:\.[0-9]+)?)\s*(?:usdc|dollar|\$)/i);
    if (matchUsdc && matchUsdc[1]) {
      agreedAmountUsdc = parseFloat(matchUsdc[1]);
    }

    // Check for timelock
    const matchTime = text.match(/([0-9]+)\s*(?:seconds|s|secs|hour|hours|minutes|mins)/i);
    if (matchTime) {
      if (text.includes('hour')) timelockSeconds = parseInt(matchTime[1], 10) * 3600;
      else if (text.includes('min')) timelockSeconds = parseInt(matchTime[1], 10) * 60;
      else timelockSeconds = parseInt(matchTime[1], 10);
    }

    // Check for SLA terms
    if (text.includes('uptime') || text.includes('latency') || text.includes('48khz')) {
      slaTerms = 'High-Performance 48kHz Acoustic Inference (99.9% Uptime, <120ms Latency)';
    }

    // Check for agreement consensus
    if (
      turn.tag === 'AGREEMENT' ||
      text.includes('deal accepted') ||
      text.includes('agreed') ||
      text.includes('confirm') ||
      text.includes('deal confirmed')
    ) {
      hasConsensus = true;
    }
  }

  const agreedAmountStroops = BigInt(Math.round(agreedAmountUsdc * 10_000_000));

  return {
    agreedAmountUsdc,
    agreedAmountStroops,
    timelockSeconds,
    hasConsensus,
    slaTerms,
  };
}

/**
 * Automatically drafts on-chain Soroban escrow parameters from a voice negotiation conversation.
 */
export function draftContractSpecFromVoice(
  turns: VoiceDialogueTurn[],
  buyer: string,
  seller: string,
  token = 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC'
): VoiceNegotiationContractSpec {
  const parsed = parseNegotiationTranscript(turns);
  
  const preimageBytes = crypto.randomBytes(32);
  const hashLockBytes = crypto.createHash('sha256').update(preimageBytes).digest();

  return {
    agreementId: `AGR-${Math.floor(1000 + Math.random() * 9000)}`,
    title: 'Autonomous Voice & Compute Service Agreement',
    buyer,
    seller,
    token,
    amountUsdc: parsed.agreedAmountUsdc,
    amountStroops: parsed.agreedAmountStroops,
    hashLockHex: hashLockBytes.toString('hex'),
    preimageHex: preimageBytes.toString('hex'),
    timelockSeconds: parsed.timelockSeconds,
    slaTerms: parsed.slaTerms,
  };
}

/**
 * Formats a voice negotiation transcript as GitHub Flavored Markdown for download.
 */
export function formatTranscriptMarkdown(
  turns: VoiceDialogueTurn[],
  meta: { callMode: string; durationSeconds: number; contractSpec?: VoiceNegotiationContractSpec }
): string {
  let md = `# VoxTrade Voice Negotiation Transcript\n\n`;
  md += `**Exported At:** ${new Date().toISOString()}\n`;
  md += `**Call Mode:** ${meta.callMode.toUpperCase()}\n`;
  md += `**Call Duration:** ${Math.floor(meta.durationSeconds / 60)}m ${meta.durationSeconds % 60}s\n`;
  md += `**Network:** Stellar Testnet (Soroban)\n\n`;

  md += `## Chronological Conversation Log\n\n`;
  turns.forEach((t) => {
    md += `### [${t.timestamp}] **${t.sender}** (${t.role.toUpperCase()})\n`;
    if (t.tag) md += `*Tag: ${t.tag}*\n\n`;
    md += `> ${t.text}\n\n`;
  });

  if (meta.contractSpec) {
    const s = meta.contractSpec;
    md += `## Drafted Smart Contract Specification\n\n`;
    md += `- **Agreement ID:** \`${s.agreementId}\`\n`;
    md += `- **Settlement Amount:** ${s.amountUsdc} USDC (${s.amountStroops.toString()} stroops)\n`;
    md += `- **Buyer Key:** \`${s.buyer}\`\n`;
    md += `- **Provider Key:** \`${s.seller}\`\n`;
    md += `- **SHA-256 Hashlock:** \`${s.hashLockHex}\`\n`;
    md += `- **Preimage:** \`${s.preimageHex}\`\n`;
    md += `- **Timelock Duration:** ${s.timelockSeconds} seconds\n`;
    md += `- **SLA Terms:** ${s.slaTerms}\n`;
  }

  return md;
}

/**
 * Formats a voice negotiation transcript as JSON for download.
 */
export function formatTranscriptJson(
  turns: VoiceDialogueTurn[],
  meta: { callMode: string; durationSeconds: number; contractSpec?: VoiceNegotiationContractSpec }
): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      meta: {
        callMode: meta.callMode,
        durationSeconds: meta.durationSeconds,
        network: 'Stellar Testnet',
      },
      transcript: turns,
      contractSpec: meta.contractSpec || null,
    },
    (_key, value) => (typeof value === 'bigint' ? value.toString() : value),
    2
  );
}

export interface GeminiModelCandidate {
  apiVersion: 'v1beta' | 'v1';
  modelName: string;
  displayName?: string;
}

/**
 * Filters raw models returned by Google ModelService.ListModels to only those
 * that explicitly support the 'generateContent' method.
 */
export function filterSupportedGeminiModels(
  rawModels: any[],
  apiVersion: 'v1beta' | 'v1' = 'v1beta'
): GeminiModelCandidate[] {
  if (!Array.isArray(rawModels)) return [];
  const result: GeminiModelCandidate[] = [];
  const seen = new Set<string>();

  for (const m of rawModels) {
    if (!m || typeof m !== 'object') continue;
    const name: string = m.name || '';
    const cleanName = name.replace(/^models\//, '').trim();
    if (!cleanName) continue;

    const methods: string[] = Array.isArray(m.supportedGenerationMethods)
      ? m.supportedGenerationMethods
      : [];

    if (methods.includes('generateContent') && !seen.has(cleanName)) {
      seen.add(cleanName);
      result.push({
        apiVersion,
        modelName: cleanName,
        displayName: m.displayName || cleanName,
      });
    }
  }

  return result;
}

/**
 * Ranks Gemini model candidates so that modern, fast flash models (2.0-flash, 2.5-flash, 1.5-flash-002)
 * are prioritized over older or deprecated variants, respecting user preferences.
 */
export function rankGeminiCandidateList(
  candidates: GeminiModelCandidate[],
  preferredModel?: string
): GeminiModelCandidate[] {
  const cleanPref = (preferredModel || '').replace(/^models\//, '').trim().toLowerCase();

  const scoreCandidate = (c: GeminiModelCandidate): number => {
    const n = c.modelName.toLowerCase();
    if (cleanPref && cleanPref !== 'auto' && n === cleanPref) return 1000;

    // Prioritize 2.0 / 2.5 Flash
    if (n.includes('2.0-flash') || n.includes('2.5-flash')) return 200;
    if (n.includes('2.0')) return 180;

    // Versioned 1.5 Flash
    if (n === 'gemini-1.5-flash-002') return 160;
    if (n === 'gemini-1.5-flash-001') return 150;
    if (n === 'gemini-1.5-flash-8b') return 145;

    // Notice: v1 for gemini-1.5-flash is preferred over v1beta to avoid 'not found for v1beta'
    if (n === 'gemini-1.5-flash' && c.apiVersion === 'v1') return 140;
    if (n === 'gemini-1.5-flash') return 130;
    if (n.includes('1.5-flash')) return 120;

    // Pro models
    if (n.includes('1.5-pro')) return 110;
    if (n.includes('pro')) return 100;

    return 50;
  };

  return [...candidates].sort((a, b) => scoreCandidate(b) - scoreCandidate(a));
}

/**
 * Sanitizes and extracts the true conversational voice reply from an LLM output,
 * stripping reasoning scratchpads, bullet artifacts, chain-of-thought, and metadata tags.
 */
export function cleanLLMDialogue(rawText: string): {
  reply: string;
  tag: 'PROPOSAL' | 'COUNTER_OFFER' | 'AGREEMENT' | 'TERMS' | 'CHAT';
  amount: number;
  token: string;
} {
  let clean = (rawText || '').trim();
  let tag: 'PROPOSAL' | 'COUNTER_OFFER' | 'AGREEMENT' | 'TERMS' | 'CHAT' = 'CHAT';
  let amount = 8.0;
  let token = 'USDC';

  // 1. Extract and remove [METADATA: {...}] block
  const metadataMatch = clean.match(/\[METADATA:\s*(\{.*?\})\s*\]/is);
  if (metadataMatch) {
    clean = clean.replace(metadataMatch[0], '').trim();
    try {
      const parsed = JSON.parse(metadataMatch[1]);
      if (parsed.tag) tag = parsed.tag;
      if (parsed.amount) amount = Number(parsed.amount);
      if (parsed.token) token = parsed.token;
    } catch {}
  }

  // 2. If the LLM leaked chain-of-thought scratchpad with "Response: ..." or "* Response: ..."
  const explicitResponseMatch = clean.match(/(?:^|\*|\n)\s*(?:Response|Final Response|Spoken Response|Reply):\s*["“]?([^"”\n\r*]+)["”]?/i);
  if (explicitResponseMatch && explicitResponseMatch[1]?.trim()) {
    clean = explicitResponseMatch[1].trim();
  } else {
    // 3. Strip any scratchpad reasoning bullets if present
    const lines = clean.split('\n');
    const filteredLines = lines.filter((line) => {
      const trimmed = line.trim();
      if (!trimmed) return false;
      if (/^(\*|-)\s*(User says|Context|Persona|Goal|Constraint Check|Metadata|Thinking|Analysis):/i.test(trimmed)) {
        return false;
      }
      return true;
    });
    clean = filteredLines.join(' ').trim();

    // If inline bullet separators exist: e.g. "* User says: ... * Response: ... "
    if (clean.includes('* User says:') || clean.includes('* Context:')) {
      const subMatch = clean.match(/\*\s*(?:Response|Reply):\s*["“]?([^"”*]+)["”]?/i);
      if (subMatch && subMatch[1]?.trim()) {
        clean = subMatch[1].trim();
      }
    }
  }

  // 4. Strip any leftover wrapping quotes
  clean = clean.replace(/^["'“`]+|["'”`]+$/g, '').trim();

  // 5. If model forgot metadata, perform heuristic tag extraction
  if (!metadataMatch) {
    const lower = clean.toLowerCase();
    if (lower.includes('deal') || lower.includes('agree') || lower.includes('confirm') || lower.includes('accepted')) {
      tag = 'AGREEMENT';
    } else if (lower.includes('counter') || lower.includes('instead') || lower.includes('how about')) {
      tag = 'COUNTER_OFFER';
    } else if (lower.includes('usdc') || lower.includes('xlm') || lower.includes('rate') || lower.includes('price')) {
      tag = 'PROPOSAL';
    }
  }

  return { reply: clean, tag, amount, token };
}

export interface SpeechVoiceDescriptor {
  name: string;
  lang: string;
  voiceURI?: string;
  default?: boolean;
  localService?: boolean;
}

/**
 * Scores and sorts browser SpeechSynthesis voices, prioritizing natural/neural human voices
 * over legacy robotic speech synthesizers.
 */
export function rankSpeechSynthesisVoices<T extends SpeechVoiceDescriptor>(voices: T[]): T[] {
  const scoreVoice = (v: T): number => {
    let score = 0;
    const name = (v.name || '').toLowerCase();
    const lang = (v.lang || '').toLowerCase();

    // Prioritize English for negotiation dialog
    if (lang.startsWith('en')) {
      score += 50;
      if (lang.includes('us') || lang.includes('gb') || lang.includes('en-us') || lang.includes('en-gb')) {
        score += 10;
      }
    } else {
      score -= 50;
    }

    // Modern high-quality / neural / natural cloud voices
    if (name.includes('online (natural)') || name.includes('neural')) {
      score += 150;
    } else if (name.includes('natural')) {
      score += 120;
    }

    // Chrome / Google high-fidelity voices
    if (name.includes('google')) {
      score += 90;
    }

    // Apple / macOS enhanced voices
    if (name.includes('enhanced') || name.includes('premium') || name.includes('siri') || name.includes('samantha')) {
      score += 80;
    }

    // Known smooth human-like voices
    if (name.includes('jenny') || name.includes('guy') || name.includes('aria') || name.includes('christopher') || name.includes('ava')) {
      score += 40;
    }

    // Penalize known legacy robotic synthesizers
    if (name.includes('desktop') || name.includes('sapi') || name.includes('espeak')) {
      score -= 30;
    }

    if (v.default) {
      score += 5;
    }

    return score;
  };

  return [...voices].sort((a, b) => scoreVoice(b) - scoreVoice(a));
}

/**
 * Selects an optimal pair of distinct natural voices for bilateral agent-to-agent negotiations,
 * ensuring buyer and seller have distinct voices.
 */
export function selectOptimalVoicePair<T extends SpeechVoiceDescriptor>(voices: T[]): {
  sellerVoice: T | null;
  buyerVoice: T | null;
} {
  const ranked = rankSpeechSynthesisVoices(voices);
  if (ranked.length === 0) {
    return { sellerVoice: null, buyerVoice: null };
  }

  const sellerVoice = ranked[0];

  // Try to find a distinct complementary voice for the buyer (e.g. different gender or distinct name)
  const sellerLower = (sellerVoice.name || '').toLowerCase();
  const isSellerFemale = sellerLower.includes('jenny') || sellerLower.includes('aria') || sellerLower.includes('zira') || sellerLower.includes('female');
  
  let buyerVoice = ranked.find((v) => {
    if (v.name === sellerVoice.name) return false;
    const vLower = (v.name || '').toLowerCase();
    if (isSellerFemale) {
      return vLower.includes('guy') || vLower.includes('david') || vLower.includes('male') || vLower.includes('christopher');
    } else {
      return vLower.includes('jenny') || vLower.includes('aria') || vLower.includes('zira') || vLower.includes('female');
    }
  });

  if (!buyerVoice && ranked.length > 1) {
    buyerVoice = ranked[1];
  }

  return {
    sellerVoice,
    buyerVoice: buyerVoice || sellerVoice,
  };
}

