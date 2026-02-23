"use client";

import { useState, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface FloatingSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

export function FloatingSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Tanlang",
  error,
  disabled = false,
  required,
}: FloatingSelectProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const selectedLabel = options.find((o) => o.value === value)?.label;
  const hasValue = value.length > 0;

  return (
    <div className="relative">
      <button
        type="button"
        id={id}
        onClick={() => !disabled && setOpen((o) => !o)}
        disabled={disabled}
        className="w-full px-4 pt-5 pb-3 rounded-2xl bg-white/5 border border-white/10 text-left text-white focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between"
      >
        <span className={hasValue ? "text-white" : "text-white/30"}>
          {hasValue ? selectedLabel : placeholder}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-white/50" />
        </motion.span>
      </button>
      <motion.label
        initial={false}
        animate={{
          y: hasValue || open ? -28 : 0,
          scale: hasValue || open ? 0.85 : 1,
        }}
        transition={{ duration: 0.2 }}
        className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50 origin-left"
      >
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </motion.label>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-10"
              aria-hidden
              onClick={() => setOpen(false)}
            />
            <motion.ul
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="absolute z-20 left-0 right-0 mt-2 py-2 rounded-2xl bg-navy-800/95 backdrop-blur-xl border border-white/10 shadow-glass overflow-hidden"
            >
              {options.map((opt) => (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors ${
                      opt.value === value ? "text-blue-400 bg-white/5" : "text-white"
                    }`}
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
            </motion.ul>
          </>
        )}
      </AnimatePresence>

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
