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

const REFERRAL_OPTIONS = ["FACEBOOK", "INSTAGRAM", "THREADS"] as const;

type FieldErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
  referralSource?: string;
};

export default function SignUpPage() {
  const router = useRouter();
  const { refreshAuth } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [referralSource, setReferralSource] = useState("");
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [privacyError, setPrivacyError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errors: FieldErrors = {};
    const trimmed = email.trim();

    if (!trimmed) {
      errors.email = t.validation.emailRequired;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      errors.email = t.validation.emailInvalid;
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

    if (!confirmPassword) {
      errors.confirmPassword = t.validation.confirmRequired;
    } else if (password !== confirmPassword) {
      errors.confirmPassword = t.validation.confirmMismatch;
    }

    if (!referralSource) {
      errors.referralSource = t.validation.referralRequired;
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
    const result = await apiSignup(
      email.trim(),
      password,
      confirmPassword,
      privacyAccepted,
      referralSource || undefined
    );
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
        {t.auth.signupTitle}
      </h2>
      <p className="font-inter text-[14px] sm:text-[16px] font-light text-[#B3B3B3] mb-6 sm:mb-8">
        {t.auth.signupWelcome}
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
            clearField("email");
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
            clearField("password");
          }}
          error={fieldErrors.password}
          disabled={loading}
        />
        <PasswordField
          id="confirmPassword"
          label={t.auth.confirmPassword}
          placeholder={t.auth.confirmPassword}
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            clearField("confirmPassword");
          }}
          error={fieldErrors.confirmPassword}
          disabled={loading}
        />

        {/* Referral Source Select */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="referralSource"
            className="font-inter text-[13px] sm:text-[14px] font-medium text-[#B3B3B3]"
          >
            {t.auth.referralSource}
          </label>
          <select
            id="referralSource"
            value={referralSource}
            onChange={(e) => {
              setReferralSource(e.target.value);
              clearField("referralSource");
            }}
            disabled={loading}
            className={`w-full bg-[#1A1F2E] border rounded-lg px-4 py-3 text-white text-[14px] outline-none transition-colors focus:border-[#28E88E]/50 appearance-none ${
              fieldErrors.referralSource ? "border-red-400" : "border-white/10"
            }`}
          >
            <option value="" disabled className="text-[#B3B3B3]">
              {t.auth.referralSource}
            </option>
            {REFERRAL_OPTIONS.map((opt) => (
              <option key={opt} value={opt} className="bg-[#1A1F2E] text-white">
                {opt}
              </option>
            ))}
          </select>
          {fieldErrors.referralSource && (
            <p className="font-inter text-[12px] text-red-400 mt-0.5">
              {fieldErrors.referralSource}
            </p>
          )}
        </div>

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
