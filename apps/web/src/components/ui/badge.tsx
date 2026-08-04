import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium tracking-wide uppercase",
  {
    variants: {
      variant: {
        default: "border-amber-400/20 bg-amber-400/10 text-amber-300",
        muted: "border-white/10 bg-white/5 text-zinc-400",
        success: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
        danger: "border-rose-400/20 bg-rose-400/10 text-rose-300",
        live: "border-sky-400/20 bg-sky-400/10 text-sky-300",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof badgeVariants>) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
