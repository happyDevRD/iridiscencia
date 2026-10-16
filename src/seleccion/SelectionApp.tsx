import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Heart, X, ZoomIn } from "lucide-react";

/**
 * Portal privado donde el cliente elige sus fotos (iridiscencia.com/seleccion/<token>).
 * Habla con ProStock a través del nginx del sitio: /api/seleccion/<token> → backend.
 * Lo marcado se guarda solo; al confirmar, el estudio recibe la selección.
 */

type Selection = {
  studio: string;
  title: string;
  customerFirstName?: string | null;
  quota: number;
  extraUnitPrice?: number | null;
  photos: string[];
  selected: string[];
  submitted: boolean;
  expiresAt: string;
};

const token = decodeURIComponent(window.location.pathname.replace(/^\/seleccion\/?/, "").split("/")[0] ?? "");
const api = `/api/seleccion/${encodeURIComponent(token)}`;
const photoUrl = (name: string, size: "thumb" | "view") =>
  `${api}/photos/${encodeURIComponent(name)}?size=${size}`;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${api}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) {
    let message = "No se pudo conectar con el estudio. Revisa tu conexión e intenta de nuevo.";
    try {
      const body = await res.json();
      if (res.status === 404) message = "Este enlace no existe. Revisa que esté completo o pide uno nuevo al estudio.";
      else if (body?.message) message = body.message;
    } catch {
      /* respuesta sin cuerpo */
    }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

const money = (n: number) => `RD$${n.toLocaleString("es-DO", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

export default function SelectionApp() {
  const [data, setData] = useState<Selection | null>(null);
  const [loadError, setLoadError] = useState("");
  const [chosen, setChosen] = useState<string[]>([]);
  const [filter, setFilter] = useState<"all" | "chosen">("all");
  const [viewer, setViewer] = useState<number | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [confirming, setConfirming] = useState(false);
  const dirty = useRef(false);

  useEffect(() => {
    document.title = "Elige tus fotos";
    request<Selection>("")
      .then((d) => {
        setData(d);
        setChosen(d.selected);
      })
      .catch((e: Error) => setLoadError(e.message));
  }, []);

  // Guardado automático del borrador, 800 ms después del último cambio.
  useEffect(() => {
    if (!dirty.current || !data || data.submitted) return;
    setSaveState("saving");
    const t = window.setTimeout(() => {
      request<Selection>("/selected", { method: "PUT", body: JSON.stringify({ selected: chosen }) })
        .then(() => setSaveState("saved"))
        .catch(() => setSaveState("error"));
    }, 800);
    return () => window.clearTimeout(t);
  }, [chosen, data]);

  const chosenSet = useMemo(() => new Set(chosen), [chosen]);
  const visible = useMemo(
    () => (data ? (filter === "chosen" ? data.photos.filter((p) => chosenSet.has(p)) : data.photos) : []),
    [data, filter, chosenSet]
  );

  const toggle = useCallback(
    (name: string) => {
      if (!data || data.submitted) return;
      dirty.current = true;
      setChosen((prev) => (prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]));
    },
    [data]
  );

  if (loadError) {
    return (
      <Shell>
        <div className="mx-auto max-w-md py-24 text-center">
          <h1 className="font-display text-4xl">No pudimos abrir tu selección</h1>
          <p className="mt-4 text-muted-foreground">{loadError}</p>
        </div>
      </Shell>
    );
  }
  if (!data) {
    return (
      <Shell>
        <p className="py-24 text-center text-muted-foreground">Cargando tus fotos…</p>
      </Shell>
    );
  }

  const extra = Math.max(0, chosen.length - data.quota);
  const canAddExtra = data.extraUnitPrice != null;
  const overLimit = extra > 0 && !canAddExtra;

  return (
    <Shell studio={data.studio}>
      <header className="mx-auto max-w-6xl px-5 pb-6 pt-10 sm:px-8">
        <p className="text-muted-foreground">
          {data.customerFirstName ? `Hola, ${data.customerFirstName}.` : "Hola."} {data.title}
        </p>
        <h1 className="mt-2 font-display text-5xl leading-none sm:text-6xl">
          {data.submitted ? "Tu selección" : "Elige tus fotos"}
        </h1>
        {!data.submitted && (
          <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
            Tu paquete incluye <strong className="text-foreground">{data.quota} fotos</strong>. Toca una foto para elegirla y
            usa la lupa para verla en grande. Lo que marques se guarda solo: puedes volver a este enlace hasta el{" "}
            {new Date(data.expiresAt).toLocaleDateString("es-DO", { day: "numeric", month: "long" })}.
            {canAddExtra && ` Si quieres más, cada foto extra cuesta ${money(data.extraUnitPrice!)}.`}
          </p>
        )}
        {data.submitted && (
          <p className="mt-4 max-w-xl text-muted-foreground">
            Recibimos tu selección de {chosen.length} fotos. El estudio ya está trabajando en ellas; te avisaremos cuando
            estén listas.
          </p>
        )}

        <div className="mt-6 flex gap-2" role="group" aria-label="Mostrar">
          {(
            [
              ["all", `Todas (${data.photos.length})`],
              ["chosen", `Elegidas (${chosen.length})`],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              aria-pressed={filter === key}
              onClick={() => setFilter(key)}
              className="h-10 rounded-full border border-border px-4 text-sm transition-colors aria-pressed:border-foreground aria-pressed:bg-foreground aria-pressed:text-background"
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-3 pb-40 sm:px-8">
        {visible.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">
            {filter === "chosen" ? "Todavía no has elegido fotos." : "Aún no hay fotos en esta selección."}
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {visible.map((name) => {
              const on = chosenSet.has(name);
              return (
                <li key={name} className="relative">
                  <button
                    type="button"
                    onClick={() => toggle(name)}
                    aria-pressed={on}
                    aria-label={`${on ? "Quitar" : "Elegir"} ${name}`}
                    disabled={data.submitted}
                    className={`group block w-full overflow-hidden rounded-[6px] bg-card outline-offset-2 transition ${
                      on ? "ring-[3px] ring-foreground" : ""
                    }`}
                  >
                    <img
                      src={photoUrl(name, "thumb")}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className={`aspect-[4/5] w-full object-cover transition ${on ? "opacity-90" : "group-hover:opacity-90"}`}
                    />
                    <span
                      className={`absolute left-2 top-2 flex size-8 items-center justify-center rounded-full transition ${
                        on ? "bg-foreground text-background" : "bg-background/80 text-foreground"
                      }`}
                      aria-hidden
                    >
                      {on ? <Check size={17} strokeWidth={3} /> : <Heart size={16} />}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewer(data.photos.indexOf(name))}
                    aria-label={`Ver ${name} en grande`}
                    className="absolute bottom-2 right-2 flex size-9 items-center justify-center rounded-full bg-background/85 text-foreground"
                  >
                    <ZoomIn size={17} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {!data.submitted && (
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-8">
            <div>
              <p className="font-medium tabular-nums">
                {chosen.length} de {data.quota} elegidas
                {extra > 0 && canAddExtra && (
                  <span className="text-muted-foreground"> · {extra} extra ({money(extra * data.extraUnitPrice!)})</span>
                )}
              </p>
              <p className="text-xs text-muted-foreground" aria-live="polite">
                {overLimit
                  ? `Puedes elegir hasta ${data.quota} fotos.`
                  : saveState === "saving"
                    ? "Guardando…"
                    : saveState === "saved"
                      ? "Guardado"
                      : saveState === "error"
                        ? "No se pudo guardar. Revisa tu conexión."
                        : "Tus cambios se guardan solos."}
              </p>
            </div>
            <button
              type="button"
              disabled={chosen.length === 0 || overLimit}
              onClick={() => setConfirming(true)}
              className="h-12 rounded-full bg-foreground px-6 font-medium text-background transition-opacity disabled:opacity-40"
            >
              Confirmar selección
            </button>
          </div>
        </div>
      )}

      {viewer !== null && (
        <Viewer
          photos={data.photos}
          index={viewer}
          chosen={chosenSet}
          readOnly={data.submitted}
          onChange={setViewer}
          onToggle={toggle}
          onClose={() => setViewer(null)}
        />
      )}

      {confirming && (
        <ConfirmDialog
          count={chosen.length}
          quota={data.quota}
          extra={extra}
          extraUnitPrice={data.extraUnitPrice ?? null}
          onCancel={() => setConfirming(false)}
          onConfirm={async (acceptExtra) => {
            const next = await request<Selection>("/submit", {
              method: "POST",
              body: JSON.stringify({ selected: chosen, acceptExtra }),
            });
            setData(next);
            setChosen(next.selected);
            setFilter("chosen");
            setConfirming(false);
            window.scrollTo({ top: 0 });
          }}
        />
      )}
    </Shell>
  );
}

function Shell({ studio, children }: { studio?: string; children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-6xl items-center px-5 sm:px-8">
          <a href="/" className="font-display text-xl">
            {studio ?? "Iridiscencia"}
          </a>
        </div>
      </div>
      {children}
    </div>
  );
}

function Viewer({
  photos,
  index,
  chosen,
  readOnly,
  onChange,
  onToggle,
  onClose,
}: {
  photos: string[];
  index: number;
  chosen: Set<string>;
  readOnly: boolean;
  onChange: (i: number) => void;
  onToggle: (name: string) => void;
  onClose: () => void;
}) {
  const name = photos[index];
  const on = chosen.has(name);
  const touchX = useRef<number | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const prev = useCallback(() => onChange((index - 1 + photos.length) % photos.length), [index, photos.length, onChange]);
  const next = useCallback(() => onChange((index + 1) % photos.length), [index, photos.length, onChange]);

  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      before?.focus();
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === " " && !readOnly) {
        e.preventDefault();
        onToggle(name);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [name, next, prev, onClose, onToggle, readOnly]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Foto en grande"
      className="fixed inset-0 z-30 flex flex-col bg-tinta text-blanco"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
        touchX.current = null;
      }}
    >
      <div className="flex h-14 shrink-0 items-center justify-between px-4 text-sm text-blanco/70">
        <span className="tabular-nums">
          {index + 1} / {photos.length}
        </span>
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Cerrar" className="-mr-2 p-2 text-blanco">
          <X size={24} />
        </button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2">
        <img key={name} src={photoUrl(name, "view")} alt="" className="max-h-full max-w-full object-contain" />
        <button type="button" onClick={prev} aria-label="Anterior" className="absolute left-1 hidden p-3 sm:block">
          <ChevronLeft size={32} />
        </button>
        <button type="button" onClick={next} aria-label="Siguiente" className="absolute right-1 hidden p-3 sm:block">
          <ChevronRight size={32} />
        </button>
      </div>
      {!readOnly && (
        <div className="flex shrink-0 justify-center p-4">
          <button
            type="button"
            onClick={() => onToggle(name)}
            aria-pressed={on}
            className={`flex h-12 items-center gap-2 rounded-full px-6 font-medium ${
              on ? "bg-blanco text-tinta" : "border border-blanco/40 text-blanco"
            }`}
          >
            {on ? <Check size={18} strokeWidth={3} /> : <Heart size={18} />}
            {on ? "Elegida" : "Elegir esta foto"}
          </button>
        </div>
      )}
    </div>
  );
}

function ConfirmDialog({
  count,
  quota,
  extra,
  extraUnitPrice,
  onCancel,
  onConfirm,
}: {
  count: number;
  quota: number;
  extra: number;
  extraUnitPrice: number | null;
  onCancel: () => void;
  onConfirm: (acceptExtra: boolean) => Promise<void>;
}) {
  const [accept, setAccept] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-tinta/50 p-4 sm:items-center" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className="w-full max-w-md rounded-[14px] bg-background p-6 shadow-xl">
        <h2 id="confirm-title" className="font-display text-3xl">
          ¿Confirmas tus {count} fotos?
        </h2>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Después de confirmar ya no podrás cambiarla desde aquí; el estudio empezará a editarlas.
        </p>
        {extra > 0 && extraUnitPrice != null && (
          <label className="mt-4 flex items-start gap-3 rounded-[6px] border border-border p-3 text-sm">
            <input type="checkbox" checked={accept} onChange={(e) => setAccept(e.target.checked)} className="mt-0.5 size-4" />
            <span>
              Elegiste {extra} foto{extra === 1 ? "" : "s"} más de las {quota} incluidas. Acepto el costo adicional de{" "}
              <strong>{money(extra * extraUnitPrice)}</strong>.
            </span>
          </label>
        )}
        {error && (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onCancel} disabled={sending} className="h-11 rounded-full px-5">
            Seguir eligiendo
          </button>
          <button
            type="button"
            disabled={sending || (extra > 0 && !accept)}
            onClick={async () => {
              setSending(true);
              setError("");
              try {
                await onConfirm(extra > 0);
              } catch (e) {
                setError(e instanceof Error ? e.message : "No se pudo confirmar.");
                setSending(false);
              }
            }}
            className="h-11 rounded-full bg-foreground px-5 font-medium text-background disabled:opacity-40"
          >
            {sending ? "Enviando…" : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}
