import { X } from "lucide-react";
import type { ReactNode } from "react";
import { IconButton } from "./ui";

interface MobileDrawerProps {
  side: "left" | "right";
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function MobileDrawer({ side, open, onClose, children }: MobileDrawerProps) {
  return (
    <div className={`fixed inset-0 z-50 lg:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
      <button
        type="button"
        aria-label="Close drawer backdrop"
        onClick={onClose}
        className={`absolute inset-0 bg-zinc-950/35 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />
      <aside
        className={`absolute top-0 h-full w-[min(88vw,360px)] border-zinc-200 bg-white shadow-2xl transition-transform duration-300 dark:border-[#3F3F46] dark:bg-[#202024] ${
          side === "left" ? "left-0 border-r" : "right-0 border-l"
        } ${open ? "translate-x-0" : side === "left" ? "-translate-x-full" : "translate-x-full"}`}
      >
        <div className="absolute right-2 top-2 z-10">
          <IconButton label="Close drawer" onClick={onClose} className="size-8!">
            <X size={16} />
          </IconButton>
        </div>
        {children}
      </aside>
    </div>
  );
}
