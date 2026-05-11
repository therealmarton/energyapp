import clsx from "clsx";

import { accentFor, initialsFor } from "../ui/formatting";

interface Props {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "w-7 h-7 text-[10px]",
  md: "w-9 h-9 text-xs",
  lg: "w-12 h-12 text-sm",
};

export function UserAvatar({ name, size = "md", className }: Props) {
  return (
    <div
      className={clsx(
        "rounded-full text-white font-semibold flex items-center justify-center shadow-sm bg-gradient-to-br",
        accentFor(name),
        sizes[size],
        className,
      )}
      aria-hidden
    >
      {initialsFor(name)}
    </div>
  );
}
