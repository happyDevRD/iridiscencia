import Link from "next/link";
import { Button } from "@/components/ui/button";
import siteConfig from "@/content/site.json";
import { IrisBackground } from "@/components/iris-background";

export default function HomePage() {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 text-center">
      <IrisBackground />
      <h1 className="font-serif text-4xl tracking-tight sm:text-6xl">{siteConfig.nombre}</h1>
      <p className="mt-4 max-w-xl text-lg text-white/70">{siteConfig.eslogan}</p>
      <div className="mt-8 flex gap-4">
        <Link href="/portafolio">
          <Button size="lg">Ver portafolio</Button>
        </Link>
        <Link href="/contacto">
          <Button size="lg" variant="outline">
            Contactar
          </Button>
        </Link>
      </div>
    </div>
  );
}
