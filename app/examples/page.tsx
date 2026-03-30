import type { Metadata } from "next";
import Link from "next/link";
import TermCard from "@/components/TermCard";

export const metadata: Metadata = {
  title: "Examples — Situations & Their Perfect Terms | Comedic Term Generator",
  description:
    "Browse 24 hand-picked comedic terms across 8 hilarious situations. See what the Comedic Term Generator can do.",
};

const examples = [
  {
    situation: "When someone chases one goal above everything else",
    terms: [
      {
        term: "North Star",
        definition:
          "The singular goal someone has locked onto that everything else orbits around.",
        example:
          "That startup is his North Star — he turned down two job offers this month.",
      },
      {
        term: "Solo Queue",
        definition:
          "When someone cuts out the noise, drops the team, and goes at their one goal completely alone.",
        example:
          "He's been in full solo queue mode since January — no distractions, no explanations, just locked in.",
      },
      {
        term: "Tunnel Vision Maxxing",
        definition:
          "Taking single-minded focus to its absolute extreme — everything outside the goal is basically unrendered.",
        example:
          "She hasn't been out in three months, she is tunnel vision maxxing for that bar exam.",
      },
    ],
  },
  {
    situation: "When a reference only certain people will understand",
    terms: [
      {
        term: "Dog Whistle",
        definition:
          "A signal, joke, or reference coded just enough that only the right people will catch it.",
        example:
          "Half the room had no idea, but that line was a total dog whistle for anyone who grew up watching that show.",
      },
      {
        term: "No-Scope Callout",
        definition:
          "Calling out or acknowledging someone in a way so specific that only they will know it was aimed at them.",
        example:
          "He posted that caption as a no-scope callout — everyone else scrolled past but she knew exactly what it meant.",
      },
      {
        term: "Frequency Check",
        definition:
          "A subtle acknowledgment between people who share the same reference point.",
        example:
          "It was a total frequency check when I initiated that niche joke.",
      },
    ],
  },
  {
    situation: "When you walk in and instantly shift the energy of a room",
    terms: [
      {
        term: "Takeover",
        definition:
          "When someone walks in and the whole room's momentum shifts in their direction without them saying a word.",
        example:
          "She wasn't even there five minutes and everyone was facing her — actual takeover.",
      },
      {
        term: "Climate Control",
        definition:
          "The rare ability to set the emotional temperature of a room the second you enter it.",
        example:
          "Coach has climate control — the whole locker room was tense until he walked in and laughed.",
      },
      {
        term: "Patch Drop",
        definition:
          "When someone enters and the whole vibe updates instantly, like the room just got a new version of itself.",
        example:
          "Marcus walked in and it was a straight patch drop — energy went from a 4 to a 9.",
      },
    ],
  },
  {
    situation:
      "When something is obviously going to go wrong but everyone ignores it",
    terms: [
      {
        term: "Fog of Cope",
        definition:
          "The collective delusion a group enters when acknowledging reality would mean admitting they already lost.",
        example:
          "Nobody wanted to pull the plug on the project — pure fog of cope, everyone knew the numbers were cooked.",
      },
      {
        term: "Dead Sprint Into a Wall",
        definition:
          "When everyone can see the crash coming but nobody slows down — and somehow acts surprised when it hits.",
        example:
          "That whole product launch was a dead sprint into a wall, anyone paying attention knew it three months out.",
      },
      {
        term: "Crowd-Blindsided",
        definition:
          "When a group collectively agrees not to see something obvious so the illusion of momentum can survive a little longer.",
        example:
          "The whole team was crowd-blindsided — investors, management, everyone. Only the interns were asking the real questions.",
      },
    ],
  },
  {
    situation: "When you catch someone in a lie with undeniable proof",
    terms: [
      {
        term: "Checkmate",
        definition:
          "The moment someone's lie is cornered with no escape route left.",
        example:
          "He said he was home all night — then she showed the Instagram story. Checkmate.",
      },
      {
        term: "Hard Evidence",
        definition:
          "When the proof you drop is so airtight there's no angle left to spin it from.",
        example:
          "She said she was home all night — bro I had the Instagram story with the location tag, that was hard evidence.",
      },
      {
        term: "The Killcam",
        definition:
          "Showing someone the undeniable replay of exactly what they did, frame by frame, no room to argue.",
        example:
          "She tried to deny the whole thing and I just pulled up the texts — full killcam, she saw everything.",
      },
    ],
  },
  {
    situation: "When someone talks a lot but says absolutely nothing",
    terms: [
      {
        term: "Word Salad",
        definition:
          "A dense tangle of language that sounds substantive but communicates nothing.",
        example:
          "His whole answer was word salad — I still don't know what the plan is.",
      },
      {
        term: "Verbal Fog",
        definition:
          "When someone uses volume of words to obscure the absence of meaning.",
        example:
          "She verbal fogged the entire meeting. Forty minutes, zero decisions.",
      },
      {
        term: "Hot Air",
        definition:
          "Confident-sounding speech with zero substance behind it.",
        example:
          "That pitch was pure hot air. No numbers, no plan, just vibes.",
      },
    ],
  },
  {
    situation: "When someone acts completely different around certain people",
    terms: [
      {
        term: "Away Kit",
        definition:
          "The alternate version of yourself you put on when the home crowd isn't watching.",
        example:
          "Soon as his coworkers showed up he switched to full away kit — barely recognized him.",
      },
      {
        term: "Lobby Diff",
        definition:
          "When someone plays like a completely different person depending on who's in the room, same way your whole strategy changes based on who dropped into your lobby.",
        example:
          "He's super confident at home but put him around her friends? Lobby diff is real.",
      },
      {
        term: "Code-Switching Speedrun",
        definition:
          "When someone flips their entire personality the second a new person walks in — no transition, no warning, just a full instant swap.",
        example:
          "His boss walked in and he went full code-switching speedrun, I've never seen a human change that fast.",
      },
    ],
  },
];

const CTA = () => (
  <Link
    href="/"
    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm transition-all duration-200"
    style={{
      background: "rgba(94,106,210,0.15)",
      border: "1px solid rgba(94,106,210,0.3)",
      color: "#9BA3F5",
    }}
  >
    Generate Your Own Terms →
  </Link>
);

export default function ExamplesPage() {
  return (
    <main className="min-h-dvh">
      {/* Ambient blob */}
      <div aria-hidden="true" className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[700px] h-[480px] rounded-full opacity-[0.07]"
          style={{ background: "radial-gradient(ellipse, #5E6AD2 0%, transparent 70%)" }}
        />
      </div>

      <div className="relative max-w-[680px] mx-auto px-5 pt-[72px] pb-28">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium tracking-[0.08em] uppercase mb-10"
          style={{ color: "var(--foreground-muted)" }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M7.5 2L3 6l4.5 4" />
          </svg>
          Back
        </Link>

        {/* Header */}
        <header className="mb-10">
          <h1
            className="font-archivo font-black tracking-[-0.03em] text-[40px] sm:text-[52px] leading-[0.95] mb-4"
            style={{ color: "var(--foreground)" }}
          >
            Examples
          </h1>
          <p
            className="font-grotesk text-base leading-relaxed mb-8"
            style={{ color: "rgba(237,237,239,0.65)" }}
          >
            Here are some of our favorite situations and the terms that nail
            them perfectly. Try the generator to find terms for your own
            situations.
          </p>
          <CTA />
        </header>

        {/* Situations */}
        <div className="flex flex-col gap-16">
          {examples.map((group, gi) => (
            <section key={gi} aria-labelledby={`situation-${gi}`}>
              <h2
                id={`situation-${gi}`}
                className="font-grotesk text-xs font-semibold tracking-[0.12em] uppercase mb-5"
                style={{ color: "var(--foreground-muted)" }}
              >
                {group.situation}
              </h2>
              <div className="flex flex-col gap-3">
                {group.terms.map((term, ti) => (
                  <TermCard key={ti} term={term} index={ti} situation={null} />
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 flex justify-center">
          <CTA />
        </div>
      </div>
    </main>
  );
}
