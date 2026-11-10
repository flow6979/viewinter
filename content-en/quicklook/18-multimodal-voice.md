**In one line:** Multimodal agents turn images into patch tokens and voice into a streamed STT → LLM → TTS loop (or one speech-to-speech model); the hard parts are verifying extracted numbers, keeping a voice turn under ~1 second, and handling interruptions honestly.

- **VLM internals:** image → patches (336 px / 14 px = 24 × 24 = 576) → ViT/CLIP-style encoder → projector MLP → image tokens in the LLM; high-res images are tiled, so tokens grow with pixel area (2x width and height ≈ 4x tokens).
- **Docs, VLM vs OCR:** OCR + layout + LLM is cheap, exact and traceable (bounding boxes) on clean templates; a VLM handles messy layouts, stamps and charts but can hallucinate digits. Best default: hybrid (OCR text + page image into the VLM).
- **Verify with code:** strict schema, then qty × price = amount, line items + tax = total, GSTIN/PIN/phone formats; failures and low confidence go to human review. Measure accuracy per field, not per document.
- **Visual RAG:** ColPali-style multi-vector embeddings of page images, late-interaction MaxSim scoring, VLM answers over the top 2–3 pages; keeps charts and tables but the index is large (~1,000 vectors per page).
- **Image cost:** downscale to the smallest size that keeps accuracy, crop regions, low-detail mode, dedupe by hash, batch API for offline work, sample video frames by scene change.
- **Cascaded vs speech-to-speech:** cascaded gives control, best STT per language, text guardrails and debuggable logs; speech-to-speech gives tone and lower latency but fewer knobs and weaker complex tool use.
- **Latency budget:** endpointing 200–500 ms + STT final 50–200 + LLM TTFT 200–600 + TTS first audio 80–250 + network 50–150. Stream every stage, send the first sentence to TTS, cache the prefix, co-locate servers; target p95 under ~1 s.
- **Turn detection:** VAD + silence timer cuts off thinkers or adds lag; a semantic end-of-turn model waits on unfinished sentences and replies fast on finished ones.
- **Barge-in:** keep listening with echo cancellation, ignore coughs and backchannels ("haan", "okay"), stop TTS and cancel generation at once, truncate the assistant message to the words actually played.
- **Transport:** WebRTC (UDP, jitter buffer, built-in AEC) for apps, WebSocket for server streams, SIP/PSTN for phone numbers at 8 kHz G.711; pick STT tested on phone audio.
- **Tools in voice:** say a filler before slow tools, pre-fetch on call connect, timeouts with a spoken fallback, read back critical details before any write action.
- **Evals + India:** WER and entity accuracy on your own calls, latency p50/p95, task success checked in the DB, interruption tests, simulated callers with noise; Hinglish code-switching STT, number normalization ("dedh sau" = 150), digit-by-digit read-back.

**Say in the interview:** "For a business voice agent I start cascaded and streamed end to end: semantic turn detection, a fast model with a cached prefix, sentence-level TTS, and barge-in that truncates history to what was actually heard. I budget every stage in milliseconds and track p95, not the average."

**Avoid:** trusting VLM numbers without arithmetic checks; sending full-resolution photos; waiting for the whole LLM reply before TTS; keeping the full unspoken reply in history after an interruption; testing only on clean laptop audio; confirming with the raw transcript instead of parsed values.
