import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
export function Modal({
  title,
  className = "",
  children,
  onClose,
}: {
  title: string;
  className?: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = ref.current!;
    dialog.showModal();
    const cancel = (e: Event) => {
      e.preventDefault();
      close.current();
    };
    dialog.addEventListener("cancel", cancel);
    return () => {
      dialog.removeEventListener("cancel", cancel);
      dialog.close();
      if (previous?.isConnected) previous.focus();
      else document.getElementById("library-stage")?.focus();
    };
  }, []);
  return (
    <dialog ref={ref} className={`modal ${className}`} aria-label={title}>
      <button
        className="icon-button modal-close"
        aria-label="Return to Library"
        onClick={onClose}
      >
        <X size={21} />
      </button>
      {children}
    </dialog>
  );
}
