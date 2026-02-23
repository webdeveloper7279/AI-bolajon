"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, TrendingUp, Award, User } from "lucide-react";

type NavItem = {
  href: string;
  icon: any;
  label: string;
};

const navItems: NavItem[] = [
  { href: "/home", icon: Home, label: "Asosiy" },
  { href: "/leaderboard", icon: TrendingUp, label: "Reyting" },
  { href: "/achievements", icon: Award, label: "Mukofotlar" },
  { href: "/profile", icon: User, label: "Profil" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md border-t border-white/10 flex justify-around py-3">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive =
            pathname === href ||
            (href === "/home" && pathname === "/");

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 text-xs transition ${
                isActive
                  ? "text-blue-400"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive ? "text-blue-400" : ""
                }`}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}