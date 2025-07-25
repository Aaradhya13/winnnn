"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { name: "Dashboard", href: "/dashboard", badge: null },
  { name: "Compliance Alerts", href: "/compliance-alerts", badge: null },
  { name: "Carbon Analysis", href: "/carbon-analysis", badge: null },
  { name: "Regulatory Scanner", href: "/regulatory-scanner", badge: null },
  { name: "Compliance Risk Calculator", href: "/compliance-risk-calculator", badge: null },
  { name: "Cost-Benefit Analysis", href: "/cost-benefit-analysis", badge: null },
  { name: "What-If Calculator", href: "/what-if-calculator", badge: null },
];

export default function Sidebar({ sidebarOpen, setSidebarOpen }: { sidebarOpen: boolean; setSidebarOpen: (open: boolean) => void }) {
  const pathname = usePathname();
  return (
    <aside
      className={`
        bg-[#151c27] text-white min-h-screen flex flex-col py-6 px-4 shadow-lg
        fixed md:relative z-50
        transition-transform duration-300 ease-in-out
        w-64 md:w-64
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}
    >
      <Link href="/">
        <div className="text-2xl font-bold mb-10 tracking-tight cursor-pointer">CarbonGuard <span className="text-xs font-normal text-gray-400 ml-1"></span></div>
      </Link>
      <nav className="flex-1">
        <ul className="space-y-2">
          {navLinks.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <li key={link.name}>
                <Link
                  href={link.href}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors font-medium text-base ${
                    isActive
                      ? "bg-[#22304a] text-blue-400"
                      : "hover:bg-[#22304a] text-gray-200"
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {link.name}
                  {link.badge && (
                    <span className="ml-auto bg-blue-600 text-xs px-2 py-0.5 rounded-full font-semibold">{link.badge}</span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-auto text-xs text-gray-500 pt-8">© 2025 CarbonGuard Inc.</div>
    </aside>
  );
}
