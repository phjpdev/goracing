"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthFormLayout, PasswordField, TextField } from "@/components/auth";
import { PrimaryButton } from "@/components/ui";
import { apiLogin } from "@/lib/api";
import { useAuth } from "@/lib/context/AuthContext";
import { useLanguage } from "@/lib/context/LanguageContext";
import { ROUTES } from "@/lib/constants";

export default function LoginPage() {
  const router = useRouter();
  const { refreshAuth } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errors: { email?: string; password?: string } = {};
    const trimmed = email.trim();

    if (!trimmed) {
      errors.email = t.validation.emailRequired;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      errors.email = t.validation.emailInvalid;
    }

    if (!password) {
      errors.password = t.validation.passwordRequired;
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    setLoading(true);
    const result = await apiLogin(email.trim(), password);
    setLoading(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    await refreshAuth();
    router.push(ROUTES.HOME);
  };

  return (
    <AuthFormLayout>
      <h2 className="font-inter text-[24px] sm:text-[28px] lg:text-[32px] font-semibold text-white mb-2">
        {t.auth.loginTitle}
      </h2>
      <p className="font-inter text-[14px] sm:text-[16px] font-light text-[#B3B3B3] mb-6 sm:mb-8">
        {t.auth.loginWelcome}
      </p>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <TextField
          id="email"
          label={t.auth.email}
          type="email"
          placeholder={t.auth.email}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
          }}
          error={fieldErrors.email}
          disabled={loading}
        />
        <PasswordField
          id="password"
          label={t.auth.password}
          placeholder={t.auth.password}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
          }}
          error={fieldErrors.password}
          disabled={loading}
        />

        {error && (
          <p className="font-inter text-[13px] text-red-400 -mt-2" role="alert">
            {error}
          </p>
        )}

        <PrimaryButton className="mt-2" disabled={loading}>
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#020308]/30 border-t-[#020308]" />
              {t.auth.loggingIn}
            </span>
          ) : (
            t.auth.loginCta
          )}
        </PrimaryButton>
      </form>

      <p className="mt-6 sm:mt-8 text-center font-inter text-[13px] sm:text-[14px] text-[#B3B3B3]">
        {t.auth.noAccount}{" "}
        <Link href={ROUTES.SIGNUP} className="text-[#28E88E] font-medium no-underline hover:underline">
          {t.auth.signUp}
        </Link>
      </p>
    </AuthFormLayout>
  );
}
