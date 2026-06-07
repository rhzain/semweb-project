export function HomeHero() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
      <h1 className="font-heading text-4xl leading-[1.08] font-bold tracking-[-0.05em] text-primary text-balance sm:text-6xl lg:text-7xl">
        Leksikon Semantik
        <br />
        Flora &amp; Fauna Indonesia
      </h1>
      <p className="max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
        Pencarian spesies berbasis knowledge graph dan RDF ontologi untuk
        menjelajahi nama lokal, nama ilmiah, serta relasi taksonomi flora dan
        fauna Indonesia.
      </p>
    </div>
  );
}
