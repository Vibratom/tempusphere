import { cn } from "@/lib/utils";

export function AppLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("fill-current", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M50 0L93.3 25V75L50 100L6.7 75V25L50 0Z"
        className="text-primary"
      />
      <path
        d="M50 12.5L82.45 31.25V68.75L50 87.5L17.55 68.75V31.25L50 12.5Z"
        className="text-background"
      />
      <path
        d="M50 25L71.65 37.5V62.5L50 75L28.35 62.5V37.5L50 25Z"
        className="text-primary"
      />
    </svg>
  );
}
