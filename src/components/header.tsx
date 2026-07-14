import Link from "next/link";
import siteConfig from "@/content/site.json";

const links = [
  { href: "/", label: "Inicio" },
  { href: "/portafolio", label: "Portafolio" },
  { href: "/paquetes", label: "Paquetes" },
  { href: "/contacto", label: "Contacto" },
];

export function Header() {
  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/70 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-serif text-lg tracking-wide text-white">
          {siteConfig.nombre}
        </Link>
        <nav className="hidden gap-8 text-sm text-white/70 sm:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-white">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
