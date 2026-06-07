interface PageHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
}

export function PageHeading({ eyebrow, title, description }: PageHeadingProps) {
  return (
    <section className="flex max-w-4xl flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
        {eyebrow}
      </p>
      <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
        {title}
      </h1>
      {description ? (
        <p className="max-w-3xl text-base leading-7 text-muted-foreground">
          {description}
        </p>
      ) : null}
    </section>
  );
}
