import clsx from "clsx";
import { ReactElement } from "react";

export default function Input({
  label,
  subtitle,
  className,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  subtitle?: string;
  className?: string;
}): ReactElement {
  return (
    <div className={clsx(className, "form-control")}>
      <div className="label">
        <span className="label-text">{label}</span>
      </div>
      <input {...rest} className="input" />
      {subtitle && (
        <div className="label">
          <span className="label-text-alt">{subtitle}</span>
        </div>
      )}
    </div>
  );
}
