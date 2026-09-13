import { describe, it, expect } from 'vitest';
import {
  parseNegotiationTranscript,
  draftContractSpecFromVoice,
  formatTranscriptMarkdown,
  formatTranscriptJson,
  filterSupportedGeminiModels,
  rankGeminiCandidateList,
  cleanLLMDialogue,
  rankSpeechSynthesisVoices,
  selectOptimalVoicePair,
  VoiceDialogueTurn,
} from '../src/voice';

describe('Voice Negotiation & AI Contract Drafting Module', () => {
  const sampleDialogue: VoiceDialogueTurn[] = [
    {
      id: '1',
      sender: 'VoxAgent-Alpha',
      role: 'buyer_agent',
      text: 'Initiating request for 100k speech tokens. We propose 6.00 USDC.',
      timestamp: '14:20:01',
      tag: 'PROPOSAL',
    },
    {
      id: '2',
      sender: 'ComputeNode-7',
      role: 'provider_agent',
      text: 'Standard rate is 9.50 USDC with 99.9% uptime and <120ms latency.',
      timestamp: '14:20:05',
      tag: 'COUNTER_OFFER',
    },
    {
      id: '3',
      sender: 'VoxAgent-Alpha',
      role: 'buyer_agent',
      text: 'We can settle at 8.00 USDC if the HTLC timelock is 3600 seconds.',
      timestamp: '14:20:10',
      tag: 'TERMS',
    },
    {
      id: '4',
      sender: 'ComputeNode-7',
      role: 'provider_agent',
      text: 'Deal accepted at 8.00 USDC. Timelock 3600s confirmed.',
      timestamp: '14:20:15',
      tag: 'AGREEMENT',
    },
  ];

  it('should accurately parse agreed pricing and terms from dialogue turns', () => {
    const parsed = parseNegotiationTranscript(sampleDialogue);
    expect(parsed.hasConsensus).toBe(true);
    expect(parsed.agreedAmountUsdc).toBe(8.0);
    expect(parsed.agreedAmountStroops).toBe(80_000_000n);
    expect(parsed.timelockSeconds).toBe(3600);
    expect(parsed.slaTerms).toContain('99.9% Uptime');
  });

  it('should draft a complete on-chain Soroban contract specification', () => {
    const buyer = 'GDTUMB7F22XEYJ4FXVJ5FRNYXGF6XIPYAOLESUC432SEWVJ5PAKEWSCF';
    const seller = 'GBZXN7PIRZGNMHGA72ST2EQTVGQDXF45NWZ46CXCW462KC22W6KZNVLB';

    const spec = draftContractSpecFromVoice(sampleDialogue, buyer, seller);
    expect(spec.agreementId).toMatch(/^AGR-\d{4}$/);
    expect(spec.buyer).toBe(buyer);
    expect(spec.seller).toBe(seller);
    expect(spec.amountUsdc).toBe(8.0);
    expect(spec.amountStroops).toBe(80_000_000n);
    expect(spec.hashLockHex.length).toBe(64);
    expect(spec.preimageHex.length).toBe(64);
    expect(spec.timelockSeconds).toBe(3600);
  });

  it('should format transcript into GitHub Flavored Markdown for download', () => {
    const buyer = 'GDTUMB7F22XEYJ4FXVJ5FRNYXGF6XIPYAOLESUC432SEWVJ5PAKEWSCF';
    const seller = 'GBZXN7PIRZGNMHGA72ST2EQTVGQDXF45NWZ46CXCW462KC22W6KZNVLB';
    const spec = draftContractSpecFromVoice(sampleDialogue, buyer, seller);

    const md = formatTranscriptMarkdown(sampleDialogue, {
      callMode: 'agent-to-agent',
      durationSeconds: 45,
      contractSpec: spec,
    });

    expect(md).toContain('# VoxTrade Voice Negotiation Transcript');
    expect(md).toContain('AGENT-TO-AGENT');
    expect(md).toContain('VoxAgent-Alpha');
    expect(md).toContain('ComputeNode-7');
    expect(md).toContain('## Drafted Smart Contract Specification');
    expect(md).toContain('80000000 stroops');
    expect(md).toContain(spec.hashLockHex);
  });

  it('should format transcript into structured JSON for download', () => {
    const buyer = 'GDTUMB7F22XEYJ4FXVJ5FRNYXGF6XIPYAOLESUC432SEWVJ5PAKEWSCF';
    const seller = 'GBZXN7PIRZGNMHGA72ST2EQTVGQDXF45NWZ46CXCW462KC22W6KZNVLB';
    const spec = draftContractSpecFromVoice(sampleDialogue, buyer, seller);

    const jsonStr = formatTranscriptJson(sampleDialogue, {
      callMode: 'user-to-agent',
      durationSeconds: 90,
      contractSpec: spec,
    });

    const parsed = JSON.parse(jsonStr);
    expect(parsed.meta.callMode).toBe('user-to-agent');
    expect(parsed.meta.durationSeconds).toBe(90);
    expect(parsed.transcript.length).toBe(4);
    expect(parsed.contractSpec.amountUsdc).toBe(8.0);
    expect(parsed.contractSpec.buyer).toBe(buyer);
  });

  it('should filter raw Google ListModels entries strictly by generateContent support', () => {
    const rawGoogleModels = [
      {
        name: 'models/text-embedding-004',
        supportedGenerationMethods: ['embedContent'],
      },
      {
        name: 'models/gemini-1.5-flash',
        supportedGenerationMethods: ['generateContent', 'countTokens'],
      },
      {
        name: 'models/gemini-2.0-flash',
        supportedGenerationMethods: ['generateContent'],
      },
      {
        name: 'models/aqa',
        supportedGenerationMethods: ['generateAnswer'],
      },
    ];

    const filtered = filterSupportedGeminiModels(rawGoogleModels, 'v1beta');
    expect(filtered.length).toBe(2);
    expect(filtered.map((m) => m.modelName)).toEqual(['gemini-1.5-flash', 'gemini-2.0-flash']);
    expect(filtered[0].apiVersion).toBe('v1beta');
  });

  it('should prioritize modern 2.0-flash and rank v1 higher for gemini-1.5-flash', () => {
    const candidates = [
      { apiVersion: 'v1beta' as const, modelName: 'gemini-1.5-flash' },
      { apiVersion: 'v1' as const, modelName: 'gemini-1.5-flash' },
      { apiVersion: 'v1beta' as const, modelName: 'gemini-2.0-flash' },
      { apiVersion: 'v1beta' as const, modelName: 'gemini-1.5-pro' },
    ];

    const ranked = rankGeminiCandidateList(candidates);
    expect(ranked[0].modelName).toBe('gemini-2.0-flash');
    expect(ranked[1].modelName).toBe('gemini-1.5-flash');
    expect(ranked[1].apiVersion).toBe('v1'); // v1 prioritized over v1beta for 1.5-flash to avoid 404
    expect(ranked[2].apiVersion).toBe('v1beta');
  });

  it('should promote user preferred model to top priority', () => {
    const candidates = [
      { apiVersion: 'v1beta' as const, modelName: 'gemini-2.0-flash' },
      { apiVersion: 'v1beta' as const, modelName: 'gemini-1.5-pro' },
    ];

    const ranked = rankGeminiCandidateList(candidates, 'gemini-1.5-pro');
    expect(ranked[0].modelName).toBe('gemini-1.5-pro');
  });

  it('should clean and extract spoken response from LLM chain-of-thought scratchpad output', () => {
    const rawCoT = `* User says: "wassup" * Context: Commercial negotiation for high-performance compute and synthetic voice inference. * Persona: VoxAgent (concise, direct, professional but conversational). * Goal: Move the conversation toward negotiating terms (price/volume). * The user is being casual. I should acknowledge but pivot quickly to the business objective. * Response: "Not much, just ready to talk compute. What kind of inference volume are you looking for?" * Tag: \`CHAT\` * Amount: 0 * Token: \`USDC\` [METADATA: {"tag": "CHAT", "amount": 8.0, "token": "USDC"}]`;

    const cleaned = cleanLLMDialogue(rawCoT);
    expect(cleaned.reply).toBe('Not much, just ready to talk compute. What kind of inference volume are you looking for?');
    expect(cleaned.tag).toBe('CHAT');
    expect(cleaned.token).toBe('USDC');
    expect(cleaned.amount).toBe(8.0);
  });

  it('should prioritize natural and neural voices over legacy robotic desktop synthesizers', () => {
    const mockVoices = [
      { name: 'Microsoft David Desktop - English (United States)', lang: 'en-US' },
      { name: 'Microsoft Jenny Online (Natural) - English (United States)', lang: 'en-US' },
      { name: 'Google US English', lang: 'en-US' },
      { name: 'eSpeak English', lang: 'en' },
      { name: 'Microsoft Raul - Spanish (Mexico)', lang: 'es-MX' },
    ];

    const ranked = rankSpeechSynthesisVoices(mockVoices);
    expect(ranked[0].name).toContain('Jenny Online (Natural)');
    expect(ranked[1].name).toContain('Google US English');
    // Legacy desktop voices should be ranked below natural voices
    const davidIndex = ranked.findIndex((v) => v.name.includes('David Desktop'));
    const jennyIndex = ranked.findIndex((v) => v.name.includes('Jenny Online'));
    expect(jennyIndex).toBeLessThan(davidIndex);
  });

  it('should select distinct complementary natural voices for bilateral simulation', () => {
    const mockVoices = [
      { name: 'Microsoft Jenny Online (Natural) - English (United States)', lang: 'en-US' },
      { name: 'Microsoft Guy Online (Natural) - English (United States)', lang: 'en-US' },
      { name: 'Google UK English Male', lang: 'en-GB' },
    ];

    const { sellerVoice, buyerVoice } = selectOptimalVoicePair(mockVoices);
    expect(sellerVoice).toBeDefined();
    expect(buyerVoice).toBeDefined();
    expect(sellerVoice?.name).not.toBe(buyerVoice?.name);
    expect(sellerVoice?.name).toContain('Jenny');
    expect(buyerVoice?.name).toContain('Guy');
  });
});
