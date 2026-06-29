"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthFormLayout, CheckboxField, PasswordField, TextField } from "@/components/auth";
import { PrimaryButton } from "@/components/ui";
import { apiSignup } from "@/lib/api";
import { useAuth } from "@/lib/context/AuthContext";
import { useLanguage } from "@/lib/context/LanguageContext";
import { ROUTES } from "@/lib/constants";

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,30}$/;

type FieldErrors = {
  username?: string;
  password?: string;
};

export default function SignUpPage() {
  const router = useRouter();
  const { refreshAuth } = useAuth();
  const { t } = useLanguage();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [privacyError, setPrivacyError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errors: FieldErrors = {};
    const trimmed = username.trim();

    if (!trimmed) {
      errors.username = t.validation.usernameRequired;
    } else if (!USERNAME_PATTERN.test(trimmed)) {
      errors.username = t.validation.usernameInvalid;
    }

    if (!password) {
      errors.password = t.validation.passwordRequired;
    } else if (password.length < 8) {
      errors.password = t.validation.passwordMin;
    } else if (!/[A-Z]/.test(password)) {
      errors.password = t.validation.passwordUppercase;
    } else if (!/[0-9]/.test(password)) {
      errors.password = t.validation.passwordNumber;
    }

    if (!privacyAccepted) {
      setPrivacyError(t.validation.privacyRequired);
    } else {
      setPrivacyError("");
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0 && privacyAccepted;
  };

  const clearField = (field: keyof FieldErrors) => {
    if (fieldErrors[field]) setFieldErrors((p) => ({ ...p, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    setLoading(true);
    const result = await apiSignup(username.trim(), password, privacyAccepted);
    setLoading(false);

    if ("error" in result) {
      setError(result.error);
      return;
    }

    await refreshAuth();
    router.push(ROUTES.WELCOME);
  };

  return (
    <AuthFormLayout>
      <h2 className="font-inter text-[24px] sm:text-[28px] lg:text-[32px] font-semibold text-white mb-2">
        {t.auth.signupTitle}
      </h2>
      <p className="font-inter text-[14px] sm:text-[16px] font-light text-[#B3B3B3] mb-6 sm:mb-8">
        {t.auth.signupWelcome}
      </p>

      <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
        <TextField
          id="username"
          label={t.auth.username}
          type="text"
          placeholder={t.auth.username}
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            clearField("username");
          }}
          error={fieldErrors.username}
          disabled={loading}
          autoComplete="username"
        />
        <PasswordField
          id="password"
          label={t.auth.password}
          placeholder={t.auth.password}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            clearField("password");
          }}
          error={fieldErrors.password}
          disabled={loading}
        />

        <CheckboxField
          id="privacyPolicy"
          label={
            <span>
              {t.auth.privacyPrefix}{" "}
              <Link
                href={ROUTES.PRIVACY_POLICY}
                className="text-[#28E88E] underline underline-offset-2 hover:opacity-80"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t.auth.privacyPolicy}
              </Link>
            </span>
          }
          checked={privacyAccepted}
          onChange={(v) => {
            setPrivacyAccepted(v);
            if (v) setPrivacyError("");
          }}
          error={privacyError}
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
              {t.auth.creatingAccount}
            </span>
          ) : (
            t.auth.signupCta
          )}
        </PrimaryButton>
      </form>

      <p className="mt-6 sm:mt-8 text-center font-inter text-[13px] sm:text-[14px] text-[#B3B3B3]">
        {t.auth.haveAccount}{" "}
        <Link href={ROUTES.LOGIN} className="text-[#28E88E] font-medium no-underline hover:underline">
          {t.auth.logIn}
        </Link>
      </p>
    </AuthFormLayout>
  );
}
