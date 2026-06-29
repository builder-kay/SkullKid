import { cn } from "@/lib/utils";

type CardProps = React.HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/40 bg-[#f3f6ff] p-5 shadow-[10px_10px_24px_#d7dcef,-8px_-8px_18px_#ffffff]",
        className,
      )}
      {...props}
    />
  );
}
