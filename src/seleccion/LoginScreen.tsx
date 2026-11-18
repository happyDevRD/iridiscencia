import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { ApiError, login } from "./api";

/** Entrada al portal: usuario (viene en el enlace de WhatsApp) + contraseña de 6 dígitos. */
export default function LoginScreen({
  initialUsername,
  notice,
  onLogin,
}: {
  initialUsername: string;
  notice?: string;
  onLogin: (session: string, username: string) => void;
}) {
  const [username, setUsername] = useState(initialUsername);
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = username.trim();
    if (!user || !password) {
      setError(!user ? "Escribe tu usuario." : "Escribe tu contraseña.");
      return;
    }
    setSending(true);
    setError("");
    try {
      const { session } = await login(user, password);
      onLogin(session, user);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "No se pudo entrar. Intenta de nuevo.");
      setPassword("");
      setSending(false);
    }
  };

  const field =
    "mt-2 block h-12 w-full rounded-[8px] border border-border bg-background px-4 text-base outline-none transition focus:border-foreground focus-visible:ring-2 focus-visible:ring-foreground/15";

  return (
    <div className="mx-auto w-full max-w-sm px-5 pb-16 pt-12 sm:pt-20">
      <p className="text-muted-foreground">Portal de clientes</p>
      <h1 className="mt-2 font-display text-5xl leading-none">Elige tus fotos</h1>
      <p className="mt-4 leading-relaxed text-muted-foreground">
        Entra con tu usuario y la contraseña de 6 dígitos que te enviamos por WhatsApp.
      </p>

      {notice && (
        <p className="mt-6 rounded-[8px] border border-border bg-card px-4 py-3 text-sm" role="status">
          {notice}
        </p>
      )}

      <form className="mt-8 space-y-5" onSubmit={submit} noValidate>
        <div>
          <label htmlFor="sel-user" className="text-sm font-medium">
            Usuario
          </label>
          <input
            id="sel-user"
            name="username"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="next"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={field}
          />
        </div>
        <div>
          <label htmlFor="sel-pass" className="text-sm font-medium">
            Contraseña
          </label>
          <div className="relative">
            <input
              id="sel-pass"
              name="password"
              type={show ? "text" : "password"}
              inputMode="numeric"
              pattern="[0-9]*"
              autoComplete="current-password"
              enterKeyHint="go"
              autoFocus={!!initialUsername}
              value={password}
              onChange={(e) => setPassword(e.target.value.replace(/\D/g, "").slice(0, 6))}
              aria-describedby="sel-pass-help"
              className={`${field} pr-12 tracking-[0.3em] tabular-nums`}
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}
              aria-pressed={show}
              className="absolute right-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center text-muted-foreground"
            >
              {show ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p id="sel-pass-help" className="mt-2 text-xs text-muted-foreground">
            6 dígitos.
          </p>
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={sending}
          className="h-12 w-full rounded-full bg-foreground font-medium text-background transition-opacity disabled:opacity-50"
        >
          {sending ? "Entrando…" : "Entrar"}
        </button>
      </form>

      <p className="mt-8 text-sm text-muted-foreground">
        ¿No tienes la contraseña?{" "}
        <a href="https://iridiscencia.com/whatsapp" className="font-medium text-foreground underline underline-offset-4">
          Escríbenos
        </a>
      </p>
    </div>
  );
}
