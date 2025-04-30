"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const [mainNavActive, setMainNavActive] = useState("");

  // Update mainNavActive when pathname changes
  useEffect(() => {
    // Find the matching nav item based on current pathname
    const activeItem = navItems.find((item) => pathname === item.href);
    if (activeItem) {
      setMainNavActive(activeItem.name.toLowerCase());
    } else {
      // Default to home if no match (or another appropriate default)
      setMainNavActive(pathname === "/" ? "home" : "");
    }
  }, [pathname]);

  const navItems = [
    { name: "HOME", href: "/home" },
    { name: "COMMUNITY", href: "/auth/community" },
  ];

  return (
    <header className="container mx-auto px-6 py-4 flex justify-between items-center">
      <Link href="/home" className="text-white text-2xl font-bold tracking-wider">
        JUST GO
      </Link>
      <nav className="hidden md:flex space-x-8">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`text-white uppercase tracking-wider ${
              mainNavActive === item.name.toLowerCase()
                ? "border-b-2 border-white pb-1"
                : ""
            }`}
            onClick={() => setMainNavActive(item.name.toLowerCase())}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </header>
  );
}
