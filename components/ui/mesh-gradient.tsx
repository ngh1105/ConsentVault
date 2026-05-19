type Tone = "neutral" | "allowed" | "warning" | "danger";

const toneStops: Record<Tone, { from: string; to: string }> = {
  neutral: { from: "hsl(var(--accent) / 0.45)", to: "hsl(var(--accent) / 0)" },
  allowed: { from: "hsl(var(--success) / 0.5)", to: "hsl(var(--success) / 0)" },
  warning: { from: "hsl(var(--warning) / 0.5)", to: "hsl(var(--warning) / 0)" },
  danger: { from: "hsl(var(--danger) / 0.55)", to: "hsl(var(--danger) / 0)" },
};

export function MeshGradient({
  tone = "neutral",
  className = "",
}: {
  tone?: Tone;
  className?: string;
}) {
  const { from, to } = toneStops[tone];
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
      preserveAspectRatio="none"
    >
      <defs>
        <radialGradient id={`mg-${tone}`} cx="30%" cy="0%" r="80%">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill={`url(#mg-${tone})`} />
    </svg>
  );
}
