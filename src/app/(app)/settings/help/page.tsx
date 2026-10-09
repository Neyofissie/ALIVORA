import { SubHeader } from "@/components/layout/TopBar";

const FAQ = [
  { q: "What is Tomorrow Ready?", a: "Every evening Alivora gathers your family's confirmed events and tasks for the next day into one briefing, so everyone knows what's coming." },
  { q: "Does Alivora AI save things automatically?", a: "Never. It proposes tasks and events, and nothing is created until you review and confirm." },
  { q: "Can my children have accounts?", a: "Children are added as profiles so they appear in plans. They can't sign in during V1.0." },
  { q: "How do I invite my partner?", a: "Go to Family and tap Invite an adult. They'll receive an email link that expires after 7 days." },
];

export default function HelpPage() {
  return (
    <main className="mx-auto w-full max-w-[480px] px-5">
      <SubHeader title="Help & support" />
      <div className="flex flex-col gap-2">
        {FAQ.map((f) => (
          <details key={f.q} className="group rounded-card bg-surface p-4 shadow-soft">
            <summary className="flex min-h-8 cursor-pointer list-none items-center justify-between text-body font-semibold">
              {f.q}
              <span className="text-text-secondary transition-transform group-open:rotate-45" aria-hidden>+</span>
            </summary>
            <p className="mt-2 text-body text-text-secondary">{f.a}</p>
          </details>
        ))}
      </div>
      <p className="mt-6 text-body text-text-secondary">
        Still need help? In-app support and feedback arrive with the private beta.
      </p>
    </main>
  );
}
