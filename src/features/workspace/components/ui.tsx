import type { ButtonHTMLAttributes, ReactNode } from "react";

export function IconButton({
  label,
  className = "",
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={`interactive grid size-9 place-items-center rounded-md border border-zinc-200 bg-white text-zinc-700 transition dark:border-[#3F3F46] dark:bg-[#27272A] dark:text-zinc-200 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function PanelTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{children}</h2>;
}
