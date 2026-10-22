import { FormEvent, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function LoginPage() {
  const { session, signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (session) return <Navigate to="/admin" replace />;

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setPending(true);
    setError(null);
    try {
      await signIn(String(form.get("email")), String(form.get("password")));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-cream px-4">
      <form onSubmit={onSubmit} className="card w-full max-w-md space-y-4 rounded-3xl p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-gold-deep">Staff</p>
        <h1 className="font-serif text-4xl">Mielle L'Amour</h1>
        <div>
          <label htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required autoComplete="username" />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required autoComplete="current-password" />
        </div>
        {error && <p className="text-sm text-[var(--error)]">{error}</p>}
        <button type="submit" className="btn-gold w-full" disabled={pending}>
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
