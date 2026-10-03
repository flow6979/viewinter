import { allPages } from '../content'
import { useTr } from '../i18n'
import { href } from '../router'
import { SEED } from '../quizBank'
import { PROBLEMS } from '../dsa/practice'
import { Icon, type IconName } from './Icon'

interface Feature {
  icon: IconName
  title: string
  text: string
  link?: string
  ai?: boolean
}

/** What Viewinter is and why it is different */
export function About() {
  const tr = useTr()
  const studyPages = allPages.length
  // Mermaid + step-by-step text diagrams, counted from the content itself
  const diagrams = allPages.reduce((n, p) => n + (p.body.match(/```(mermaid|text)\n/g)?.length ?? 0), 0)

  const stats: [string, string][] = [
    [String(studyPages), tr('study pages', 'study pages')],
    [String(PROBLEMS.length), tr('judged DSA problems', 'judged DSA problems')],
    [`${SEED.length}+`, tr('quiz questions', 'quiz questions')],
    [String(diagrams), tr('diagrams', 'diagrams')],
  ]

  const groups: { title: string; lead: string; items: Feature[] }[] = [
    {
      title: tr('Seekho, interview ke hisaab se', 'Learn, the way interviews test you'),
      lead: tr('Har page "interview me kya bolna hai" ke liye likha hai: example, diagram, trade-offs, common galtiyan.', 'Every page is written for what you say in the room: examples, diagrams, trade-offs and common mistakes.'),
      items: [
        { icon: 'hld', title: tr('System design (HLD)', 'System design (HLD)'), text: tr('26 core topics + 26 real problems (URL shortener se Uber tak), step-by-step interview flow ke saath.', '26 core topics and 26 real problems (URL shortener to Uber), each in a step-by-step interview flow.'), link: href('topic/00-interview-framework') },
        { icon: 'code', title: 'DSA · C++', text: tr('C++ basics se DP on graphs tak, diagrams ke saath, aur "kab kya use karein" pehchanna.', 'C++ basics to DP on graphs, with diagrams and how to recognise which technique a question needs.'), link: href('dsa/04-patterns-cheatsheet') },
        { icon: 'db', title: tr('LLD, Java, Databases, CS, RAG', 'LLD, Java, Databases, CS, RAG'), text: tr('Design patterns + LLD problems, Java internals, har tarah ke databases, networking/OS, aur RAG.', 'Design patterns and LLD problems, Java internals, every kind of database, networking/OS and RAG.') },
        { icon: 'bolt', title: tr('3 reading modes', '3 reading modes'), text: tr('Full page pehli baar, Revision me sirf ★ sections, Quick look me 1-minute cheat sheet.', 'Full page the first time, Revision for the ★ sections only, Quick look for a one-minute cheat sheet.') },
        { icon: 'flask', title: tr('Agentic AI labs', 'Agentic AI labs'), text: tr('ReAct, RAG, multi-agent labs browser me hi chalao, Python ke saath.', 'Run ReAct, RAG and multi-agent labs right in the browser, Python included.'), link: href('agents') },
      ],
    },
    {
      title: tr('Code karo, asli judge pe', 'Code on a real judge'),
      lead: tr('LeetCode jaisa experience, site ke andar: C++ editor, hidden tests, points.', 'A LeetCode-style experience inside the site: a C++ editor, hidden tests and points.'),
      items: [
        { icon: 'code', title: tr('C++ judge, 35 tests each', 'C++ judge, 35 tests each'), text: tr('Run se examples, Submit pe 35 hidden tests asli g++ pe. Har test green/red, fail case ka input/expected/output.', 'Run checks the examples, Submit runs 35 hidden tests on real g++. Every test shows green or red, with the failing input, expected and actual output.'), link: href('practice') },
        { icon: 'link', title: tr('LeetCode link se import', 'Import from a LeetCode link'), text: tr('Koi bhi LeetCode URL paste karo: AI statement, signature aur tests banata hai, aur problem site pe solve karne ko ready.', 'Paste any LeetCode URL: the AI writes the statement, signature and tests, and the problem is ready to solve here.'), link: href('practice'), ai: true },
        { icon: 'search', title: tr('Company ke top questions', 'Top questions by company'), text: tr('Company aur/ya topic do: web se sabse zyada pooche gaye problems, ek click me judge me add.', 'Give a company and/or topic: the most-asked problems from the web, added to the judge in one click.'), link: href('practice'), ai: true },
        { icon: 'check', title: tr('Har AI test verified', 'Every AI test is verified'), text: tr('AI ke likhe answers pe bharosa nahi: expected outputs compiler pe reference solution se nikalte hain, aur brute force se cross-check hote hain.', 'AI-written answers are never trusted: expected outputs come from a reference solution on the compiler and are cross-checked with a brute force.'), ai: true },
        { icon: 'sparkle', title: tr('AI coach', 'AI coach'), text: tr('Atke ho? "Agla step", "fail kyu hua", compile error samjhao, ya pura solution. AI tumhara current code aur result dekhta hai.', 'Stuck? "Next step", "why did it fail", explain the compile error, or the full solution. The AI sees your current code and result.'), ai: true },
      ],
    },
    {
      title: tr('Apni company ke liye taiyaar', 'Prepare for your company'),
      lead: tr('Generic list nahi: tumhari company, tumhara role, tumhara resume.', 'Not a generic list: your company, your role, your resume.'),
      items: [
        { icon: 'target', title: tr('Company prep', 'Company prep'), text: tr('Company + role (SDE2 → SDE1/SDE3 bhi): web ke interview experiences se sawal, DSA, HLD, LLD, managerial, resume, CS, misc me.', 'Company + role (SDE2 → also SDE1/SDE3): questions from interview experiences on the web, split into DSA, HLD, LLD, managerial, resume, CS and misc.'), link: href('company'), ai: true },
        { icon: 'pen', title: tr('AI answer + apna answer', 'AI answer + your answer'), text: tr('Har sawal ka round ke hisaab se AI answer (HLD me diagram, behavioral me STAR), apna answer likho, list me save karo.', 'An AI answer shaped for the round (diagrams for HLD, STAR for behavioral), write your own, save it to a list.'), ai: true },
        { icon: 'file', title: tr('Resume se sawal + score', 'Resume questions + score'), text: tr('Resume upload karo: projects aur skills pe interviewer jaise sawal, 45 common experience sawal, aur har jawab ka score + kya improve karein.', 'Upload your resume: interviewer-style questions on your projects and skills, 45 common experience questions, and a score with what to improve for every answer.'), link: href('resume'), ai: true },
        { icon: 'chat', title: tr('Mock interview', 'Mock interview'), text: tr('HLD problems pe 45-minute AI interviewer, end me scorecard.', 'A 45-minute AI interviewer on HLD problems, with a scorecard at the end.'), ai: true },
      ],
    },
    {
      title: tr('Revise karo, track karo', 'Revise and track'),
      lead: tr('Interview se pehle ki raat tak ka system.', 'A system that carries you to the night before.'),
      items: [
        { icon: 'plan', title: tr('Personal plan', 'Personal plan'), text: tr('Interview date + roz ke ghante: day-by-day plan, must-do pehle, roz progress se update.', 'Interview date + hours a day: a day-by-day plan, must-do first, re-balanced from your progress every day.'), link: href('plan') },
        { icon: 'list', title: tr('Meri lists', 'My lists'), text: tr('"Amazon round" ya "weak topics" jaisi lists; ek click me poori list ka Quick look.', 'Lists like "Amazon round" or "weak topics"; Quick look a whole list in one click.'), link: href('lists') },
        { icon: 'quiz', title: tr('Endless quiz', 'Endless quiz'), text: tr('Har subject ke MCQs, khatam hone pe AI naye banata hai; ★ bucket, galat wale dobara, accuracy.', 'MCQs for every subject, new ones written by AI when you run out; a ★ bucket, retry-wrong and accuracy.'), link: href('quiz') },
        { icon: 'check', title: tr('Progress jo dikhe', 'Progress you can see'), text: tr('Har page ki checklist, har page ek square wala progress map, notes har device pe sync.', 'A checklist on every page, a progress map with one square per page, notes synced across devices.'), link: href('') },
      ],
    },
  ]

  const verify = [
    tr('Problem web se dhoondha jata hai', 'The problem is looked up on the web'),
    tr('AI statement, 35 test inputs, reference + brute force likhta hai', 'AI writes the statement, 35 inputs, a reference and a brute force'),
    tr('Dono solutions asli g++ pe chalte hain', 'Both solutions run on real g++'),
    tr('Sirf wahi tests rehte hain jahan dono agree karein', 'Only tests where both agree are kept'),
    tr('Problem sabke liye judge me save', 'The problem is saved to the judge for everyone'),
  ]

  return (
    <div className="about">
      <header className="about-hero">
        <span className="eyebrow">{tr('Viewinter ke baare me', 'About Viewinter')}</span>
        <h1>{tr('Interview prep jo asli interview jaisa lage.', 'Interview prep that feels like the real interview.')}</h1>
        <p className="about-lead">
          {tr(
            'System design, DSA, LLD aur baaki sab ek jagah: Hinglish ya English me padho, asli C++ judge pe code karo, apni company ke sawal practice karo, aur AI coach se seekho.',
            'System design, DSA, LLD and everything else in one place: read in English or Hinglish, code on a real C++ judge, practise your company’s questions, and learn with an AI coach.',
          )}
        </p>
        <div className="row wrap">
          <a className="btn primary" href={href('')}>
            {tr('Shuru karo', 'Start preparing')} <Icon name="arrow" size={15} />
          </a>
          <a className="btn" href={href('practice')}>
            {tr('DSA practice kholo', 'Open DSA practice')}
          </a>
        </div>
        <dl className="about-stats">
          {stats.map(([n, label]) => (
            <div key={label}>
              <dt className="mono">{n}</dt>
              <dd>{label}</dd>
            </div>
          ))}
        </dl>
      </header>

      {groups.map((g) => (
        <section key={g.title} className="about-group">
          <div className="about-group-head">
            <h2>{g.title}</h2>
            <p className="muted">{g.lead}</p>
          </div>
          <div className="about-grid">
            {g.items.map((f) => {
              const body = (
                <>
                  <span className={`about-icon ${f.ai ? 'ai' : ''}`}>
                    <Icon name={f.icon} size={18} />
                  </span>
                  <b>
                    {f.title}
                    {f.ai && <span className="ai-tag">AI</span>}
                  </b>
                  <span className="about-text">{f.text}</span>
                </>
              )
              return f.link ? (
                <a key={f.title} className={`about-card link ${f.ai ? 'is-ai' : ''}`} href={f.link}>
                  {body}
                </a>
              ) : (
                <div key={f.title} className={`about-card ${f.ai ? 'is-ai' : ''}`}>
                  {body}
                </div>
              )
            })}
          </div>
        </section>
      ))}

      <section className="about-group">
        <div className="about-group-head">
          <h2>{tr('AI ke banaye problems pe bharosa kyun?', 'Why you can trust AI-built problems')}</h2>
          <p className="muted">{tr('Har naya problem save hone se pehle ye 5 steps se guzarta hai.', 'Every new problem goes through these five steps before it is saved.')}</p>
        </div>
        <ol className="timeline about-flow">
          {verify.map((v, i) => (
            <li key={v}>
              <span className="timeline-dot" aria-hidden="true" />
              <b className="mono">{String(i + 1).padStart(2, '0')}</b>
              <span>{v}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="about-group about-facts">
        <div>
          <h3>{tr('Free, aur tumhara data tumhara', 'Free, and your data stays yours')}</h3>
          <p className="muted">
            {tr(
              'Site free hai. AI features tumhari apni free Gemini key se chalte hain, jo sirf tumhare browser me rehti hai. Login karoge to progress, notes, lists aur answers har device pe sync hote hain.',
              'The site is free. AI features run on your own free Gemini key, which stays in your browser. Log in and your progress, notes, lists and answers sync across devices.',
            )}
          </p>
        </div>
        <div>
          <h3>{tr('Hinglish ya English', 'English or Hinglish')}</h3>
          <p className="muted">{tr('Har page, quiz aur AI jawab dono bhashaon me. Upar ke switch se badlo.', 'Every page, quiz and AI answer in both. Switch any time from the top bar.')}</p>
        </div>
      </section>
    </div>
  )
}
