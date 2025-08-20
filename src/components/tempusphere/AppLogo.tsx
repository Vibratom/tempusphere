import { cn } from "@/lib/utils";
import Image from "next/image";

export function AppLogo({ className }: { className?: string }) {
  return (
    <Image 
        src="/logo.webp" 
        alt="Tempusphere Logo" 
        width={100} 
        height={100} 
        className={cn(className)}
        unoptimized
    />
  );
}
