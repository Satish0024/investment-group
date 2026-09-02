import { useEffect } from "react";

export type NoticeKind = "success" | "critical" | "warning";

export type Notice = {
  id: number;
  kind: NoticeKind;
  title: string;
  description?: string;
};

const ICONS: Record<NoticeKind, string> = {
  success: "/assets/icons/toast-check.png",
  critical: "/assets/icons/toast-critical.png",
  warning: "/assets/icons/toast-warning.png",
};

export function ToastStack({
  notices,
  onDismiss,
}: {
  notices: Notice[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div className="toast-stack" aria-live="polite">
      {notices.map((n) => (
        <Toast key={n.id} notice={n} onDismiss={() => onDismiss(n.id)} />
      ))}
    </div>
  );
}

function Toast({ notice, onDismiss }: { notice: Notice; onDismiss: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onDismiss, 6000);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dismiss once per toast id
  }, [notice.id]);

  return (
    <div className={`sg-toast sg-toast-${notice.kind}`} role="status">
      <span className="fig-icon icon-24">
        <img src={ICONS[notice.kind]} alt="" />
      </span>
      <div className="sg-toast-copy">
        <p className="sg-toast-title">{notice.title}</p>
        {notice.description ? <p className="sg-toast-desc">{notice.description}</p> : null}
      </div>
      <button type="button" className="sg-toast-close" onClick={onDismiss} aria-label="Dismiss">
        <span className="fig-icon icon-16">
          <img src="/assets/icons/times.svg" alt="" />
        </span>
      </button>
    </div>
  );
}

export function FieldError({ message }: { message: string }) {
  return (
    <div className="field-error" role="alert">
      <span className="fig-icon icon-12">
        <img src="/assets/icons/field-error.png" alt="" />
      </span>
      <span>{message}</span>
    </div>
  );
}
