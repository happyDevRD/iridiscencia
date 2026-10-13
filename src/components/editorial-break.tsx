import siteConfig from "@/content/site.json";

// TODO: reemplazar por una foto real del estudio cuando esté disponible.
const EDITORIAL_IMAGE =
  "https://images.unsplash.com/photo-1604017011826-d3b4c23f8914?w=1920&q=80&auto=format&fit=crop";

export function EditorialBreak() {
  return (
    <section className="relative h-[55vh] min-h-[380px] w-full overflow-hidden">
      <img src={EDITORIAL_IMAGE} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-background/50" />
      <div className="relative z-10 flex h-full items-center justify-center px-6 text-center">
        <p className="max-w-xl font-display text-3xl italic text-white [text-shadow:0_2px_20px_rgb(0_0_0_/_0.5)] sm:text-4xl">
          {siteConfig.eslogan}
        </p>
      </div>
    </section>
  );
}
