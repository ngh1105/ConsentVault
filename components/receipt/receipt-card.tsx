import { FileStack, Gavel, Quote, ShieldAlert } from "lucide-react";
import type { ConsentCase, ConsentPolicy, VerdictReceipt } from "@/lib/domain";
import { collectCitedEvidence, formatConfidence } from "@/lib/verdict";

type ReceiptCardProps = {
  consentCase: ConsentCase;
  policy: ConsentPolicy;
  receipt: VerdictReceipt;
};

export function ReceiptCard({ consentCase, policy, receipt }: ReceiptCardProps) {
  const citedEvidence = collectCitedEvidence(receipt.judgments, consentCase.evidenceItems);

  return (
    <section className="evidence-card overflow-hidden p-6 sm:p-8" aria-labelledby="receipt-card-title">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="metadata-label">Verdict receipt</p>
          <h1 id="receipt-card-title" className="mt-4 font-display text-4xl font-semibold text-balance sm:text-5xl">
            {consentCase.title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
            Final archived ruling for {policy.creatorName}, prepared for moderation handoff, creator follow-up,
            and future policy review.
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-border/80 bg-background/70 px-5 py-4 text-right">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
            Confidence score
          </p>
          <p className="mt-3 font-display text-4xl">{receipt.score}</p>
          <p className="text-sm text-muted-foreground">Standardized 0-100 scale</p>
        </div>
      </div>

      <section className="verdict-banner mt-8 p-6 text-accent-foreground" aria-label="Final verdict banner">
        <p className="font-mono text-[0.68rem] uppercase tracking-[0.28em] text-accent-foreground/80">
          Final verdict
        </p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-display text-4xl font-semibold sm:text-5xl">{receipt.finalVerdict}</p>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-accent-foreground/85">{receipt.summary}</p>
          </div>
          <p className="rounded-full border border-white/20 px-4 py-2 font-mono text-xs uppercase tracking-[0.22em] text-accent-foreground">
            {formatConfidence(receipt.score)}
          </p>
        </div>
      </section>

      <div className="mt-8 grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.95fr)]">
        <article className="rounded-[1.7rem] border border-border/80 bg-background/70 p-5">
          <div className="flex items-center gap-3">
            <Gavel className="h-5 w-5 text-accent" aria-hidden="true" />
            <h3 className="font-display text-3xl font-semibold">Validator summary</h3>
          </div>
          <div className="mt-5 space-y-4">
            {receipt.judgments.map((judgment) => (
              <div key={judgment.id} className="rounded-[1.3rem] border border-border/75 bg-card/80 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-display text-xl">{judgment.validatorName}</p>
                    <p className="text-sm text-muted-foreground">{judgment.verdict}</p>
                  </div>
                  <p className="font-mono text-[0.72rem] uppercase tracking-[0.22em] text-accent">
                    {Math.round(judgment.confidence * 100)} / 100 support
                  </p>
                </div>
                <p className="mt-3 text-sm leading-6 text-foreground">{judgment.reasoning}</p>
              </div>
            ))}
          </div>
        </article>

        <aside className="space-y-4">
          <section className="rounded-[1.7rem] border border-border/80 bg-background/70 p-5">
            <div className="flex items-center gap-3">
              <FileStack className="h-5 w-5 text-accent" aria-hidden="true" />
              <h3 className="font-display text-3xl font-semibold">Cited evidence</h3>
            </div>
            {citedEvidence.length > 0 ? (
              <ul className="mt-5 space-y-3">
                {citedEvidence.map((item) => (
                  <li key={item.id} className="rounded-[1.2rem] border border-border/75 bg-card/80 px-4 py-3">
                    <p className="font-display text-xl">{item.title}</p>
                    <p className="mt-1 font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
                      {item.type} record
                    </p>
                    <p className="mt-2 text-sm leading-6 text-foreground">{item.description}</p>
                    <p className="mt-2 break-all text-xs leading-5 text-muted-foreground">{item.url}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-5 text-sm leading-6 text-muted-foreground">
                No cited evidence items were attached to this receipt.
              </p>
            )}
          </section>

          <section className="rounded-[1.7rem] border border-border/80 bg-background/70 p-5">
            <div className="flex items-center gap-3">
              <Quote className="h-5 w-5 text-accent" aria-hidden="true" />
              <h3 className="font-display text-3xl font-semibold">Next action</h3>
            </div>
            <p className="mt-5 text-sm leading-7 text-foreground">{receipt.recommendedAction}</p>
          </section>

          <section className="rounded-[1.7rem] border border-border/80 bg-background/70 p-5">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-5 w-5 text-accent" aria-hidden="true" />
              <h3 className="font-display text-3xl font-semibold">Receipt ledger</h3>
            </div>
            <dl className="mt-5 space-y-4 text-sm leading-6">
              <div>
                <dt className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
                  Case id
                </dt>
                <dd className="mt-1 text-foreground">{receipt.caseId}</dd>
              </div>
              <div>
                <dt className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
                  Creator policy
                </dt>
                <dd className="mt-1 text-foreground">
                  {policy.creatorName} ({policy.creatorHandle})
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
                  GenLayer issuer
                </dt>
                <dd className="archive-overflow-wrap mt-1 text-foreground">
                  {receipt.wallet?.issuerAddress ?? "No wallet attached"}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
                  Network
                </dt>
                <dd className="mt-1 text-foreground">
                  {receipt.wallet
                    ? `${receipt.wallet.networkName} (${receipt.wallet.chainId})`
                    : "Mock archive only"}
                </dd>
              </div>
              <div>
                <dt className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-muted-foreground">
                  Issued
                </dt>
                <dd className="mt-1 text-foreground">{new Date(receipt.createdAt).toLocaleString()}</dd>
              </div>
            </dl>
          </section>
        </aside>
      </div>
    </section>
  );
}
