import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = "default", size = "default", isLoading, children, disabled, ...props }, ref) => {
  const variants = {
    default: "bg-gradient-to-r from-[#5865f2] to-[#4752c4] text-white shadow-sm hover:from-[#4752c4] hover:to-[#3c45a5] hover:shadow focus:ring-[#5865f2]",
    destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-red-700 hover:shadow focus:ring-red-500",
    outline: "border border-card-border bg-card text-foreground shadow-sm hover:border-card-border-hover hover:bg-accent focus:ring-primary",
    ghost: "text-foreground hover:bg-accent focus:ring-muted",
    link: "text-primary underline-offset-4 hover:underline",
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 px-3 text-sm",
    lg: "h-11 px-8",
    icon: "h-10 w-10",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-all",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      ref={ref}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
});
Button.displayName = "Button";

export { Button };
