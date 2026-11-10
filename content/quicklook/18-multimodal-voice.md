**Ek line:** Multimodal agents images ko patch tokens me badalte hain aur voice ko streamed STT → LLM → TTS loop (ya ek speech-to-speech model) me; mushkil hisse hain extract kiye numbers verify karna, voice turn ~1 second ke neeche rakhna, aur interruptions ko imaandari se handle karna.

- **VLM internals:** image → patches (336 px / 14 px = 24 × 24 = 576) → ViT/CLIP-style encoder → projector MLP → LLM me image tokens; high-res images tile hoti hain, to tokens pixel area ke saath badhte hain (width aur height 2x ≈ 4x tokens).
- **Docs, VLM vs OCR:** saaf templates pe OCR + layout + LLM sasta, exact aur traceable (bounding boxes); VLM messy layouts, stamps aur charts sambhalta hai par digits hallucinate kar sakta hai. Best default: hybrid (OCR text + page image VLM me).
- **Code se verify:** strict schema, phir qty × price = amount, line items + tax = total, GSTIN/PIN/phone formats; failures aur low confidence human review pe. Accuracy per field naapo, per document nahi.
- **Visual RAG:** page images ke ColPali-style multi-vector embeddings, late-interaction MaxSim scoring, top 2–3 pages pe VLM jawab deta hai; charts aur tables bachte hain par index bada (~1,000 vectors per page).
- **Image cost:** sabse chhote size tak downscale jahan accuracy tike, regions crop, low-detail mode, hash se dedupe, offline kaam ke liye batch API, video frames scene change pe sample.
- **Cascaded vs speech-to-speech:** cascaded me control, har bhasha ke liye best STT, text guardrails aur debug hone wale logs; speech-to-speech me tone aur kam latency par kam knobs aur complex tool use kamzor.
- **Latency budget:** endpointing 200–500 ms + STT final 50–200 + LLM TTFT 200–600 + TTS first audio 80–250 + network 50–150. Har stage stream karo, pehla sentence TTS ko bhejo, prefix cache karo, servers co-locate karo; target p95 ~1 s ke neeche.
- **Turn detection:** VAD + silence timer sochne walon ko kaat deta hai ya lag jodta hai; semantic end-of-turn model adhoore sentences pe wait karta hai aur poore pe tez jawab deta hai.
- **Barge-in:** echo cancellation ke saath sunte raho, khaansi aur backchannels ("haan", "okay") ignore karo, TTS turant roko aur generation cancel karo, assistant message ko actually play hue words tak truncate karo.
- **Transport:** apps ke liye WebRTC (UDP, jitter buffer, built-in AEC), server streams ke liye WebSocket, phone numbers ke liye SIP/PSTN 8 kHz G.711 pe; phone audio pe tested STT chuno.
- **Voice me tools:** slow tools se pehle filler bolo, call connect pe pre-fetch, spoken fallback ke saath timeouts, kisi bhi write action se pehle critical details read back.
- **Evals + India:** apni calls pe WER aur entity accuracy, latency p50/p95, DB me check kiya task success, interruption tests, noise wale simulated callers; Hinglish code-switching STT, number normalization ("dedh sau" = 150), digit-by-digit read back.

**Interview me bolo:** "Business voice agent ke liye main cascaded se shuru karta hoon aur end to end stream karta hoon: semantic turn detection, cached prefix wala fast model, sentence-level TTS, aur barge-in jo history ko utna hi rakhe jitna actually suna gaya. Har stage ka millisecond me budget banata hoon aur average nahi, p95 track karta hoon."

**Galti mat karna:** bina arithmetic checks ke VLM numbers pe bharosa; full-resolution photos bhejna; TTS se pehle poore LLM reply ka wait; interruption ke baad poora unspoken reply history me rakhna; sirf saaf laptop audio pe test; parsed values ki jagah raw transcript se confirm karna.
