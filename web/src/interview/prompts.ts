// What the AI interviewer is told for each round type, and how it scores at the end.
import { NO_TEX } from '../gemini'
import type { Lang } from '../i18n'

export type RoundType = 'hld' | 'lld' | 'dsa' | 'behavioral'

export interface Brief {
  type: RoundType
  title: string
  /** hidden reference (study page / editorial) the interviewer judges against */
  reference: string
  /** statement shown to the AI for DSA */
  statement?: string
  minutes: number
}

const STYLE = (lang: Lang) => `This is a LIVE spoken interview: the candidate hears your replies through text-to-speech and answers by voice or text.
- Keep every reply short and conversational: 1-4 sentences, ask ONE thing at a time, like a real interviewer.
- No markdown tables or headings. Code only when absolutely needed.
- ${lang === 'en' ? 'Speak in clear English.' : 'Speak in natural Hinglish (Roman-script Hindi mixed with English tech terms), like an Indian interviewer.'}
- ${NO_TEX}
- Never reveal the reference answer. If the candidate is stuck twice in a row, give a small nudge, not the answer.
- If the candidate says they are done, or asks for feedback, say a short closing line and tell them to press "End interview" for the scorecard.`

const FLOW: Record<RoundType, string> = {
  hld: `You run a system design (HLD) round. Start with the problem in 1-2 lines and let the candidate ask for requirements (answer them like a real interviewer; do not volunteer them).
Push in this order: requirements → back-of-envelope estimates (only if useful) → APIs and data model → high-level design ON THE WHITEBOARD → 2-3 deep dives (scaling, consistency, hot spots) → failures and trade-offs.
You can see a text description of their whiteboard below; refer to it concretely ("you have the cache in front of the DB; what happens on a cache miss storm?"). If the board is empty when they talk about components, ask them to draw it.`,
  lld: `You run a low-level design (LLD / OOD) round. Start with the problem in 1-2 lines; let them clarify requirements.
Push in this order: requirements and use cases → core entities and classes (on the whiteboard) → relationships → design patterns and why → key method signatures / a little code → extensibility, concurrency and edge cases.
You can see their whiteboard (classes) and code editor below; refer to them concretely.`,
  dsa: `You run a coding (DSA) round in C++. Present the problem briefly (they also see the statement). Expect: clarifying questions → a brute force idea → an optimised approach with complexity BEFORE coding → code in the editor → dry run on an example → edge cases.
You can see their current code and their last run result below. Ask them to explain choices; point at bugs by asking questions ("what happens when the array is empty?"), not by fixing them.`,
  behavioral: `You run a behavioral / hiring-manager round. Ask 4-6 questions across: a project they are proud of, a conflict, a failure, ownership beyond their role, a tough decision with trade-offs. Probe each answer with 1-2 follow-ups (what did YOU do, what was the measurable result, what would you change). Expect STAR structure.`,
}

export function interviewerSystem(b: Brief, lang: Lang, workspace: string): string {
  return `You are a senior engineer at a top product company interviewing a candidate for an SDE-2 role. Round length: ${b.minutes} minutes.
${FLOW[b.type]}

${STYLE(lang)}

=== Problem: ${b.title} ===
${b.statement ?? ''}

=== Hidden reference (use it to judge; never paste it) ===
${b.reference.slice(0, 14000)}

=== Candidate's workspace right now ===
${workspace || '(nothing yet)'}`
}

export interface Report {
  id: string
  type: RoundType
  title: string
  slug: string
  at: number
  minutes: number
  score: number
  verdict: string
  dimensions: { name: string; score: number }[]
  strengths: string[]
  improvements: string[]
  summary: string
}

const DIMENSIONS: Record<RoundType, string[]> = {
  hld: ['Requirements', 'High-level design', 'Deep dives', 'Trade-offs', 'Communication'],
  lld: ['Requirements', 'Class design', 'Patterns & principles', 'Code quality', 'Communication'],
  dsa: ['Problem solving', 'Optimality', 'Code correctness', 'Testing & edge cases', 'Communication'],
  behavioral: ['Ownership', 'Impact & numbers', 'Structure (STAR)', 'Self-awareness', 'Communication'],
}

export function scoringPrompt(b: Brief, transcript: string, workspace: string, lang: Lang): string {
  return `You interviewed a candidate (SDE-2 bar) in a ${b.type.toUpperCase()} round on "${b.title}". Score them strictly but fairly from the transcript and their final workspace.
Write text fields in ${lang === 'en' ? 'English' : 'Hinglish (Roman Hindi + English tech terms)'}. ${NO_TEX}
Return ONLY JSON:
{"score": <0-10, one decimal>, "verdict": "Strong hire" | "Hire" | "Lean hire" | "Lean no hire" | "No hire",
 "dimensions": [${DIMENSIONS[b.type].map((d) => `{"name": "${d}", "score": <0-10>}`).join(', ')}],
 "strengths": ["2-4 specific things they did well, quoting moments"],
 "improvements": ["2-4 specific things to fix, most important first, each actionable"],
 "summary": "3-4 sentences a reviewer would write in the debrief"}
If the candidate barely participated, score low and say so.

=== Hidden reference ===
${b.reference.slice(0, 8000)}

=== Final workspace ===
${workspace || '(empty)'}

=== Transcript ===
${transcript.slice(-24000)}`
}
