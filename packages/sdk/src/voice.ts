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
