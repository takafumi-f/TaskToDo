"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { signInWithGoogle } from "@/lib/auth";
import type { AuthError } from "firebase/auth";

const ERROR_MESSAGES: Record<string, string> = {
  "auth/popup-blocked":          "ポップアップがブロックされました。ブラウザのポップアップ許可設定を確認してください。",
  "auth/popup-closed-by-user":   "ログインがキャンセルされました。",
  "auth/operation-not-allowed":  "Google ログインが Firebase コンソールで有効化されていません。",
  "auth/invalid-api-key":        "Firebase の API キーが正しくありません。.env.local を確認してください。",
  "auth/unauthorized-domain":    "このドメインは Firebase の承認済みドメインに登録されていません。",
  "auth/network-request-failed": "ネットワークエラーが発生しました。接続を確認してください。",
};

function toMessage(error: unknown): string {
  const code = (error as AuthError)?.code ?? "";
  return ERROR_MESSAGES[code] ?? `ログインに失敗しました (${code || "不明なエラー"})`;
}

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  // 認証済みならタスク一覧へ
  useEffect(() => {
    if (!loading && user) {
      router.replace("/tasks");
    }
  }, [loading, user, router]);

  async function handleLogin() {
    setError(null);
    setSigningIn(true);
    try {
      await signInWithGoogle();
      // signInWithPopup 成功 → onAuthStateChanged が発火し上の useEffect で /tasks へ遷移
    } catch (err) {
      setError(toMessage(err));
      setSigningIn(false);
    }
  }

  if (loading || (!loading && user)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-md">
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
          TaskToDo
        </h1>
        <p className="mb-8 text-center text-sm text-gray-500">
          タスクを管理するためにログインしてください
        </p>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          onClick={handleLogin}
          disabled={signingIn}
          className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <GoogleIcon />
          {signingIn ? "ログイン中..." : "Google でログイン"}
        </button>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 48 48">
      <path
        fill="#EA4335"
        d="M24 9.5c3.14 0 5.95 1.08 8.17 2.85l6.1-6.1C34.35 3.07 29.43 1 24 1 14.82 1 7.04 6.4 3.56 14.09l7.13 5.54C12.4 13.62 17.75 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.58 24.5c0-1.64-.15-3.22-.42-4.73H24v8.96h12.7c-.55 2.96-2.2 5.47-4.68 7.15l7.18 5.58C43.36 37.6 46.58 31.5 46.58 24.5z"
      />
      <path
        fill="#FBBC05"
        d="M10.69 28.37A14.7 14.7 0 0 1 9.5 24c0-1.51.26-2.97.69-4.37L3.06 14.09A23.86 23.86 0 0 0 1 24c0 3.82.92 7.43 2.56 10.59l7.13-6.22z"
      />
      <path
        fill="#34A853"
        d="M24 47c5.43 0 9.99-1.8 13.32-4.88l-7.18-5.58c-1.85 1.24-4.22 1.96-6.14 1.96-6.25 0-11.6-4.12-13.31-9.63l-7.13 5.54C7.04 41.6 14.82 47 24 47z"
      />
    </svg>
  );
}
