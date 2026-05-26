type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description: string;
  invert?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  invert = false,
}: SectionHeadingProps) {
  return (
    <div>
      <p className={`eyebrow ${invert ? "text-white/55" : ""}`}>{eyebrow}</p>
      <h2
        className={`display-title mt-4 max-w-3xl ${
          invert ? "text-white" : "text-[var(--ink)]"
        }`}
      >
        {title}
      </h2>
      <p
        className={`mt-5 max-w-2xl text-base leading-8 md:text-lg ${
          invert ? "text-white/75" : "text-[var(--muted)]"
        }`}
      >
        {description}
      </p>
    </div>
  );
}
