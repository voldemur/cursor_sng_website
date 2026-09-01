"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { adminJson } from "@/components/admin/api";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      await adminJson("/api/admin/login", {
        method: "POST",
        body: JSON.stringify({ login, password }),
      });
      const from = searchParams.get("from");
      router.replace(from && from.startsWith("/admin") ? from : "/admin");
      router.refresh();
    } catch {
      setError("Неверный логин или пароль");
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="card mx-auto w-full max-w-md space-y-4 p-6" onSubmit={(event) => void onSubmit(event)}>
      <div>
        <h1 className="text-xl font-semibold text-white">Вход в админ-панель</h1>
        <p className="mt-1 text-sm text-mist">Доступ только для уполномоченных сотрудников.</p>
      </div>
      <label className="block">
        <span className="mb-1.5 block text-xs tracking-wide text-platinum uppercase">Login</span>
        <input
          className="admin-input"
          name="login"
          autoComplete="username"
          value={login}
          onChange={(event) => setLogin(event.target.value)}
          required
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs tracking-wide text-platinum uppercase">Password</span>
        <input
          className="admin-input"
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
      </label>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? "Проверка…" : "Войти"}
      </button>
    </form>
  );
}
