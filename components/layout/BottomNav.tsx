"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, TrendingUp, Award, User } from "lucide-react";

const navItems = [
  { href: "/home", icon: Home, label: "Asosiy" },
  { href: "/leaderboard", icon: TrendingUp, label: "Reyting" },
  { href: "/achievements", icon: Award, label: "Mukofotlar" },
  { href: "/profile", icon: User, label: "Profil" },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 p-4 max-w-md mx-auto">
      <div className="glass-card flex items-center justify-around py-2 px-4">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href === "/home" && pathname === "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 py-2 px-3 rounded-full transition ${
                isActive ? "text-blue-400 bg-blue-500/20" : "text-white/50 hover:text-white/80 hover:bg-white/5"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
