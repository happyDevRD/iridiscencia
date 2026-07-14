import siteConfig from "@/content/site.json";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black py-10 text-center text-sm text-white/50">
      <p>
        © {new Date().getFullYear()} {siteConfig.nombre}. Todos los derechos reservados.
      </p>
      {siteConfig.contacto.email && (
        <p className="mt-1">
          <a href={`mailto:${siteConfig.contacto.email}`} className="hover:text-white">
            {siteConfig.contacto.email}
          </a>
        </p>
      )}
    </footer>
  );
}
