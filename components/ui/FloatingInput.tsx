"use client";

import { useState, useId } from "react";
import { motion } from "framer-motion";

interface FloatingInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "number" | "password";
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export function FloatingInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  error,
  disabled = false,
  required,
}: FloatingInputProps) {
  const id = useId();
  const [focused, setFocused] = useState(false);
  const floating = focused || value.length > 0;

  return (
    <div className="relative">
      <motion.input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        className="w-full px-4 pt-6 pb-3 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <motion.label
        htmlFor={id}
        initial={false}
        animate={{
          y: floating ? -28 : 0,
          scale: floating ? 0.85 : 1,
        }}
        transition={{ duration: 0.2 }}
        className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50 origin-left"
      >
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </motion.label>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-red-400"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
