import { describe, it, expect } from 'vitest';
import {
  parseNegotiationTranscript,
  draftContractSpecFromVoice,
  formatTranscriptMarkdown,
  formatTranscriptJson,
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
});
