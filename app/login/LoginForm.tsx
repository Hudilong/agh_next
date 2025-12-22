'use client';

import { useActionState } from "react";
import type { Locale } from "@/app/i18n";
import { loginAction, type LoginState } from "@/app/actions/auth";

type LoginCopy = {
  loginError: string;
  username: string;
  password: string;
  loginCta: string;
};

export function LoginForm({ lang, copy }: { lang: Locale; copy: LoginCopy }) {
  const [state, formAction] = useActionState<LoginState, FormData>(
    loginAction,
    {},
  );

  return (
    <form
      action={formAction}
      className="space-y-4 bg-white/85 p-6 rounded-2xl border border-white/70 shadow-card backdrop-blur"
    >
      <input type="hidden" name="lang" value={lang} />
      {state?.error && (
        <div className="text-sm text-red-600 font-semibold">{copy.loginError}</div>
      )}
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold text-haiti-ink/80">{copy.username}</span>
        <input
          name="username"
          autoComplete="username"
          required
          className="border border-haiti-ink/15 rounded-lg px-3 py-2 bg-haiti-foam/70 focus:outline-none focus:border-haiti-coral focus:ring-2 focus:ring-haiti-coral/30"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-semibold text-haiti-ink/80">{copy.password}</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="border border-haiti-ink/15 rounded-lg px-3 py-2 bg-haiti-foam/70 focus:outline-none focus:border-haiti-coral focus:ring-2 focus:ring-haiti-coral/30"
        />
      </label>
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-haiti-coral to-haiti-sky text-white px-4 py-3 rounded-full font-semibold shadow-lg shadow-haiti-coral/30 hover:translate-y-[1px] transition"
      >
        {copy.loginCta}
      </button>
    </form>
  );
}
