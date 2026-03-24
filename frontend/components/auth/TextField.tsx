import { type InputHTMLAttributes } from "react";

const INPUT_CLASS =
  "w-full bg-transparent border-0 border-b border-[#3B3B3B] px-0 py-3 text-white placeholder:text-[#707687] font-inter text-[16px] focus:outline-none focus:border-[#28E88E] transition-colors";
const LABEL_CLASS = "block font-inter text-[14px] font-medium text-[#B3B3B3] mb-2";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string;
};

export function TextField({ id, label, error, className = "", ...props }: TextFieldProps) {
  return (
    <div>
      <label htmlFor={id} className={LABEL_CLASS}>
        {label}
      </label>
      <input
        id={id}
        className={`${INPUT_CLASS} ${error ? "border-red-400" : ""} ${className}`}
        {...props}
      />
      {error && (
        <p className="font-inter text-[12px] text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
}
