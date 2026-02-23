"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit";
}

export function Button({
  children,
  onClick,
  href,
  variant = "primary",
  size = "md",
  icon: Icon,
  className = "",
  disabled = false,
  type = "button",
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50 disabled:pointer-events-none";

  const variants = {
    primary:
      "btn-gradient text-white hover:scale-[1.02] active:scale-[0.98]",
    secondary:
      "bg-white/10 text-white border border-white/20 hover:bg-white/15 hover:border-white/30",
    ghost: "text-white/90 hover:bg-white/10 hover:text-white",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  const combined = `${base} ${variants[variant]} ${sizes[size]} ${className}`;

  const content = (
    <>
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </>
  );

  if (href) {
    return (
      <motion.a
        href={href}
        className={combined}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.98 }}
      >
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={combined}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
    >
      {content}
    </motion.button>
  );
}
