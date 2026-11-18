import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Heart, X, ZoomIn } from "lucide-react";
import LoginScreen from "./LoginScreen";
import {
  ApiError,
  clearAuth,
  loadAuth,
  money,
  saveAuth,
  selectionApi,
  usernameFromPath,
  type Auth,
  type Selection,
} from "./api";

/**
 * Portal privado donde el cliente elige sus fotos (iridiscencia.com/seleccion/<usuario>).
 * Entra con usuario + contraseña; lo marcado se guarda solo y al confirmar el estudio lo recibe.
 *
 * El orden de marcado importa: las primeras `quota` fotos de la lista son del paquete y las
 * siguientes son adicionales (se cobran aparte). Es posicional: si desmarca una del paquete,
 * la primera adicional pasa a ser del paquete.
 */

const EXPIRED = "Tu sesión terminó. Vuelve a entrar con tu contraseña.";

function initialAuth(): Auth | null {
  const stored = loadAuth();
  const fromPath = usernameFromPath();
  if (!stored) return null;
  // Si el enlace es de otro usuario, no reutilizar la sesión guardada.
  if (fromPath && fromPath.toLowerCase() !== stored.username.toLowerCase()) return null;
  return stored;
}

export default function SelectionApp() {
  const [auth, setAuth] = useState<Auth | null>(initialAuth);
  const [username, setUsername] = useState(() => auth?.username ?? usernameFromPath());
  const [notice, setNotice] = useState("");

  useEffect(() => {
    document.title = "Elige tus fotos · Iridiscencia";
  }, []);

  const signOut = useCallback((message = "") => {
    clearAuth();
    setAuth(null);
    setNotice(message);
  }, []);

  if (!auth) {
    return (
      <Shell>
        <LoginScreen
          initialUsername={username}
          notice={notice}
          onLogin={(session, user) => {
            const next = { session, username: user };
            saveAuth(next);
            setUsername(user);
            setNotice("");
            setAuth(next);
            const path = `/seleccion/${encodeURIComponent(user)}`;
            if (window.location.pathname !== path) window.history.replaceState(null, "", path);
          }}
        />
      </Shell>
    );
  }

  return (
    <Gallery
      key={auth.session}
      session={auth.session}
      onExpired={() => signOut(EXPIRED)}
      onLogout={() => signOut()}
    />
  );
}

function Gallery({ session, onExpired, onLogout }: { session: string; onExpired: () => void; onLogout: () => void }) {
  const api = useMemo(() => selectionApi(session), [session]);
  const [data, setData] = useState<Selection | null>(null);
  const [loadError, setLoadError] = useState("");
  const [chosen, setChosen] = useState<string[]>([]);
  const [filter, setFilter] = useState<"all" | "chosen">("all");
  const [viewer, setViewer] = useState<number | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [hint, setHint] = useState("");
  const [confirming, setConfirming] = useState(false);
  const dirty = useRef(false);
  const pending = useRef(false);

  const fail = useCallback(
    (e: unknown) => {
      if (e instanceof ApiError && e.status === 401) {
        onExpired();
        return true;
      }
      return false;
    },
    [onExpired]
  );

  useEffect(() => {
    api
      .get()
      .then((d) => {
        setData(d);
        setChosen(d.selected);
        if (d.submitted) setFilter("chosen");
      })
      .catch((e: unknown) => {
        if (!fail(e)) setLoadError(e instanceof Error ? e.message : "No se pudo abrir tu selección.");
      });
  }, [api, fail]);

  // Guardado automático del borrador (en orden de marcado), 800 ms después del último cambio.
  useEffect(() => {
    if (!dirty.current || !data || data.submitted) return;
    setSaveState("saving");
    pending.current = true;
    const t = window.setTimeout(() => {
      pending.current = false;
      api
        .save(chosen)
        .then(() => setSaveState("saved"))
        .catch((e: unknown) => {
          if (!fail(e)) setSaveState("error");
        });
    }, 800);
    return () => window.clearTimeout(t);
  }, [chosen, data, api, fail]);

  // El aviso de «cupo lleno» se va solo.
  useEffect(() => {
    if (!hint) return;
    const t = window.setTimeout(() => setHint(""), 3500);
    return () => window.clearTimeout(t);
  }, [hint]);

  const logout = () => {
    if (pending.current && data && !data.submitted) api.save(chosen, true).catch(() => {});
    onLogout();
  };

  const order = useMemo(() => new Map(chosen.map((n, i) => [n, i])), [chosen]);
  const extraSet = useMemo(() => new Set(data?.extraFiles ?? []), [data]);
  const visible = useMemo(
    () => (data ? (filter === "chosen" ? chosen.filter((p) => data.photos.includes(p)) : data.photos) : []),
    [data, filter, chosen]
  );

  const toggle = useCallback(
    (name: string) => {
      if (!data || data.submitted) return;
      if (chosen.includes(name)) {
        dirty.current = true;
        setChosen(chosen.filter((n) => n !== name));
        return;
      }
      if (data.extraUnitPrice == null && chosen.length >= data.quota) {
        setHint(`Tu paquete incluye ${data.quota} fotos. Quita una para elegir otra.`);
        return;
      }
      dirty.current = true;
      setChosen([...chosen, name]);
    },
    [data, chosen]
  );

  if (loadError) {
    return (
      <Shell onLogout={logout}>
        <div className="mx-auto max-w-md px-5 py-24 text-center">
          <h1 className="font-display text-4xl">No pudimos abrir tu selección</h1>
          <p className="mt-4 text-muted-foreground">{loadError}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-8 h-11 rounded-full border border-border px-6"
          >
            Intentar de nuevo
          </button>
        </div>
      </Shell>
    );
  }
  if (!data) {
    return (
      <Shell onLogout={logout}>
        <p className="py-24 text-center text-muted-foreground">Cargando tus fotos…</p>
      </Shell>
    );
  }

  const price = data.extraUnitPrice ?? null;
  const inPackage = Math.min(chosen.length, data.quota);
  const extra = Math.max(0, chosen.length - data.quota);
  const isExtra = (name: string) =>
    data.submitted ? extraSet.has(name) : (order.get(name) ?? -1) >= data.quota;

  return (
    <Shell studio={data.studio} onLogout={logout}>
      <header className="mx-auto max-w-6xl px-5 pb-6 pt-10 sm:px-8">
        <p className="text-muted-foreground">
          {data.customerFirstName ? `Hola, ${data.customerFirstName}.` : "Hola."} {data.title}
        </p>
        <h1 className="mt-2 font-display text-5xl leading-none sm:text-6xl">
          {data.submitted ? "Tu selección" : "Elige tus fotos"}
        </h1>
        {data.submitted ? (
          <Summary data={data} />
        ) : (
          <p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">
            Tu paquete incluye <strong className="text-foreground">{data.quota} fotos</strong>. Toca una foto para elegirla y
            usa la lupa para verla en grande. Lo que marques se guarda solo: puedes volver hasta el{" "}
            {new Date(data.expiresAt).toLocaleDateString("es-DO", { day: "numeric", month: "long" })}.
            {price != null &&
              ` Si eliges más, las que pasen de ${data.quota} son adicionales y cuestan ${money(price)} cada una.`}
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

      <main className="mx-auto max-w-6xl px-3 pb-44 sm:px-8">
        {visible.length === 0 ? (
          <p className="py-16 text-center text-muted-foreground">
            {filter === "chosen" ? "Todavía no has elegido fotos." : "Aún no hay fotos en esta selección."}
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {visible.map((name) => {
              const on = order.has(name);
              const additional = on && isExtra(name);
              const rejected = additional && data.submitted && data.extraStatus === "REJECTED";
              return (
                <li key={name} className="relative">
                  <button
                    type="button"
                    onClick={() => toggle(name)}
                    aria-pressed={on}
                    aria-label={`${on ? "Quitar" : "Elegir"} ${name}${additional ? " (adicional)" : ""}`}
                    disabled={data.submitted}
                    className={`group block w-full overflow-hidden rounded-[6px] bg-card outline-offset-2 transition ${
                      on ? "ring-[3px] ring-foreground" : ""
                    }`}
                  >
                    <img
                      src={api.photoUrl(name, "thumb")}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className={`aspect-[4/5] w-full object-cover transition ${
                        rejected ? "opacity-50 grayscale" : on ? "opacity-90" : "group-hover:opacity-90"
                      }`}
                    />
                    <span
                      className={`absolute left-2 top-2 flex size-8 items-center justify-center rounded-full transition ${
                        on ? "bg-foreground text-background" : "bg-background/80 text-foreground"
                      }`}
                      aria-hidden
                    >
                      {on ? <Check size={17} strokeWidth={3} /> : <Heart size={16} />}
                    </span>
                    {additional && (
                      <span
                        className="absolute right-2 top-2 rounded-full bg-background px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-foreground shadow-sm"
                        aria-hidden
                      >
                        {rejected ? "No incluida" : "Adicional"}
                      </span>
                    )}
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
        <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-3 px-5 py-4 sm:px-8">
            <div className="min-w-0">
              <p className="font-medium tabular-nums">
                {inPackage} de {data.quota} del paquete
                {extra > 0 && (
                  <span className="text-muted-foreground">
                    {" "}
                    · {extra} adicional{extra === 1 ? "" : "es"}
                    {price != null && ` (${money(extra * price)})`}
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground" aria-live="polite">
                {hint ||
                  (saveState === "saving"
                    ? "Guardando…"
                    : saveState === "saved"
                      ? "Guardado"
                      : saveState === "error"
                        ? "No se pudo guardar. Revisa tu conexión."
                        : "Tus cambios se guardan solos.")}
              </p>
            </div>
            <button
              type="button"
              disabled={chosen.length === 0}
              onClick={() => setConfirming(true)}
              className="h-12 rounded-full bg-foreground px-6 font-medium text-background transition-opacity disabled:opacity-40 max-sm:w-full"
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
          photoUrl={api.photoUrl}
          order={order}
          isExtra={isExtra}
          hint={hint}
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
          extraUnitPrice={price}
          onCancel={() => setConfirming(false)}
          onConfirm={async (acceptExtra) => {
            try {
              const next = await api.submit(chosen, acceptExtra);
              dirty.current = false;
              setData(next);
              setChosen(next.selected);
              setFilter("chosen");
              setConfirming(false);
              window.scrollTo({ top: 0 });
            } catch (e) {
              if (fail(e)) return;
              throw e;
            }
          }}
        />
      )}
    </Shell>
  );
}

/** Resumen tras confirmar, según lo que pasó con las adicionales. */
function Summary({ data }: { data: Selection }) {
  const extras = data.extraFiles?.length ?? 0;
  const pkg = data.selected.length - extras;
  const cost = data.extraUnitPrice != null && extras > 0 ? ` (${money(extras * data.extraUnitPrice)})` : "";
  const fotos = (n: number) => `${n} foto${n === 1 ? "" : "s"}`;
  const adicionales = (n: number) => `${n === 1 ? "La" : `Las ${n}`} adicional${n === 1 ? "" : "es"}`;
  const status = extras > 0 ? (data.extraStatus ?? "PENDING") : "NONE";

  let text: string;
  if (status === "PENDING") {
    text = `Tus ${fotos(pkg)} del paquete ya están en edición. ${adicionales(extras)}${cost} se ${
      extras === 1 ? "prepara" : "preparan"
    } cuando el estudio registre su pago.`;
  } else if (status === "APPROVED") {
    text = `Tus ${fotos(pkg)} del paquete y ${extras === 1 ? "la adicional" : `las ${extras} adicionales`} ya están en edición. Te avisaremos cuando estén listas.`;
  } else if (status === "REJECTED") {
    text = `Tus ${fotos(pkg)} del paquete ya están en edición. ${adicionales(extras)} no se ${
      extras === 1 ? "incluirá" : "incluirán"
    }; si tienes dudas, escríbenos.`;
  } else {
    text = `Recibimos tus ${fotos(pkg)}. Ya están en edición; te avisaremos cuando estén listas.`;
  }

  return (
    <div className="mt-4 max-w-xl">
      <p className="leading-relaxed text-muted-foreground">{text}</p>
      {status !== "NONE" && (
        <a
          href="https://iridiscencia.com/whatsapp"
          className="mt-3 inline-block text-sm font-medium underline underline-offset-4"
        >
          Escribir al estudio
        </a>
      )}
    </div>
  );
}

function Shell({ studio, onLogout, children }: { studio?: string; onLogout?: () => void; children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-8">
          <a href="/" className="font-display text-xl">
            {studio ?? "Iridiscencia"}
          </a>
          {onLogout && (
            <button type="button" onClick={onLogout} className="-mr-3 h-10 px-3 text-sm text-muted-foreground hover:text-foreground">
              Salir
            </button>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

function Viewer({
  photos,
  index,
  photoUrl,
  order,
  isExtra,
  hint,
  readOnly,
  onChange,
  onToggle,
  onClose,
}: {
  photos: string[];
  index: number;
  photoUrl: (name: string, size: "thumb" | "view") => string;
  order: Map<string, number>;
  isExtra: (name: string) => boolean;
  hint: string;
  readOnly: boolean;
  onChange: (i: number) => void;
  onToggle: (name: string) => void;
  onClose: () => void;
}) {
  const name = photos[index];
  const on = order.has(name);
  const additional = on && isExtra(name);
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
        <div className="flex shrink-0 flex-col items-center gap-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <p className="min-h-5 text-center text-sm text-blanco/75" aria-live="polite">
            {hint || (additional ? "Esta foto es adicional." : "")}
          </p>
          <button
            type="button"
            onClick={() => onToggle(name)}
            aria-pressed={on}
            className={`flex h-12 items-center gap-2 rounded-full px-6 font-medium ${
              on ? "bg-blanco text-tinta" : "border border-blanco/40 text-blanco"
            }`}
          >
            {on ? <Check size={18} strokeWidth={3} /> : <Heart size={18} />}
            {on ? (additional ? "Elegida · adicional" : "Elegida") : "Elegir esta foto"}
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
  const ref = useRef<HTMLDialogElement>(null);
  const [accept, setAccept] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const inPackage = Math.min(count, quota);
  const missing = quota - inPackage;
  const hasExtra = extra > 0 && extraUnitPrice != null;

  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
    return () => d?.close();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby="confirm-title"
      onCancel={(e) => {
        e.preventDefault();
        if (!sending) onCancel();
      }}
      className="mx-auto mb-4 mt-auto max-h-[calc(100svh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-[14px] bg-background p-6 text-foreground shadow-xl backdrop:bg-tinta/50 sm:my-auto"
    >
      <h2 id="confirm-title" className="font-display text-3xl">
        ¿Confirmas tus {count} fotos?
      </h2>

      <dl className="mt-5 divide-y divide-border rounded-[8px] border border-border text-sm">
        <div className="flex items-baseline justify-between gap-4 px-4 py-3">
          <dt>Del paquete</dt>
          <dd className="tabular-nums">
            {inPackage} de {quota} · incluidas
          </dd>
        </div>
        {hasExtra && (
          <>
            <div className="flex items-baseline justify-between gap-4 px-4 py-3">
              <dt>Adicionales</dt>
              <dd className="tabular-nums">
                {extra} × {money(extraUnitPrice)}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 px-4 py-3 font-semibold">
              <dt>Costo adicional</dt>
              <dd className="tabular-nums">{money(extra * extraUnitPrice)}</dd>
            </div>
          </>
        )}
      </dl>

      {missing > 0 && (
        <p className="mt-4 text-sm text-muted-foreground">
          Aún puedes elegir {missing} foto{missing === 1 ? "" : "s"} más sin costo.
        </p>
      )}
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Después de confirmar ya no podrás cambiarla desde aquí. Las fotos del paquete pasan a edición
        {hasExtra ? "; las adicionales se preparan cuando el estudio registre su pago." : "."}
      </p>

      {hasExtra && (
        <label className="mt-4 flex items-start gap-3 rounded-[8px] border border-border p-3 text-sm">
          <input
            type="checkbox"
            checked={accept}
            onChange={(e) => setAccept(e.target.checked)}
            className="mt-0.5 size-5 shrink-0 accent-foreground"
          />
          <span>
            Acepto pagar <strong>{money(extra * extraUnitPrice)}</strong> por {extra === 1 ? "la foto adicional" : `las ${extra} fotos adicionales`}.
          </span>
        </label>
      )}
      {error && (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
        <button type="button" onClick={onCancel} disabled={sending} className="h-11 rounded-full px-5">
          Seguir eligiendo
        </button>
        <button
          type="button"
          disabled={sending || (hasExtra && !accept)}
          onClick={async () => {
            setSending(true);
            setError("");
            try {
              await onConfirm(hasExtra && accept);
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
    </dialog>
  );
}
