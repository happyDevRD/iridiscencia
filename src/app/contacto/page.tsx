import { ContactForm } from "@/components/contact-form";
import siteConfig from "@/content/site.json";

export default function ContactoPage() {
  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <h1 className="mb-4 text-center font-serif text-3xl sm:text-4xl">Contacto</h1>
      <p className="mb-10 text-center text-white/60">
        Escríbenos para cotizar tu sesión. También puedes contactarnos directamente en{" "}
        <a href={`mailto:${siteConfig.contacto.email}`} className="underline">
          {siteConfig.contacto.email}
        </a>
        .
      </p>
      <ContactForm />
    </div>
  );
}
