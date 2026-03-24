import { type ReactNode } from "react";

type CheckboxFieldProps = {
  id: string;
  label: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
};

export function CheckboxField({ id, label, checked, onChange, error }: CheckboxFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer appearance-none rounded border border-[#3B3B3B] bg-transparent checked:border-[#28E88E] checked:bg-[#28E88E] transition-colors"
          style={{
            backgroundImage: checked
              ? `url("data:image/svg+xml,%3Csvg viewBox='0 0 10 10' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M2 5l2.5 2.5L8 3' stroke='%23020308' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`
              : "none",
            backgroundSize: "10px 10px",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        />
        <label
          htmlFor={id}
          className="font-inter text-[14px] font-light text-[#B3B3B3] leading-[1.5] cursor-pointer"
        >
          {label}
        </label>
      </div>
      {error && (
        <p className="ml-7 font-inter text-[12px] text-red-400">{error}</p>
      )}
    </div>
  );
}
