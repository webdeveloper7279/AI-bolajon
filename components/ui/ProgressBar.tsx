"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  className = "",
  showLabel = false,
}: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={className}>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-teal-400"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      {showLabel && (
        <p className="mt-1 text-xs text-white/60">
          {Math.round(percent)}%
        </p>
      )}
    </div>
  );
}
