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
        className={`display-title mt-3 max-w-3xl sm:mt-4 ${
          invert ? "text-white" : "text-[var(--ink)]"
        }`}
      >
        {title}
      </h2>
      <p
        className={`mt-4 max-w-2xl text-sm leading-7 sm:mt-5 sm:text-base sm:leading-8 md:text-lg ${
          invert ? "text-white/75" : "text-[var(--muted)]"
        }`}
      >
        {description}
      </p>
    </div>
  );
}
