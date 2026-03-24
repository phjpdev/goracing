"use client";

import Image from "next/image";
import { type InputHTMLAttributes, useState } from "react";

const EYE_ICON = "/assets/eye.png";
const INPUT_BASE_CLASS =
  "w-full bg-transparent border-0 border-b border-[#3B3B3B] px-0 py-3 pr-10 text-white placeholder:text-[#707687] font-inter text-[16px] focus:outline-none focus:border-[#28E88E] transition-colors";
const LABEL_CLASS = "block font-inter text-[14px] font-medium text-[#B3B3B3] mb-2";

type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  id: string;
  label: string;
  placeholder?: string;
  error?: string;
};

export function PasswordField({
  id,
  label,
  placeholder = "Password",
  error,
  value,
  onChange,
  ...props
}: PasswordFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label htmlFor={id} className={LABEL_CLASS}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${INPUT_BASE_CLASS} ${error ? "border-red-400" : ""}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-0 top-1/2 -translate-y-1/2 p-2 transition-colors"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          <Image src={EYE_ICON} alt="" width={20} height={20} className="invert opacity-100" />
        </button>
      </div>
      {error && (
        <p className="font-inter text-[12px] text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
}
