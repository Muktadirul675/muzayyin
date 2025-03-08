"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const ScrollToTop: React.FC = () => {
  const pathname = usePathname();

  useEffect(() => {
    // Apply only for `/products/[slug]` pages
    if (pathname.startsWith("/products/")) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null; // No visible UI
};

export default ScrollToTop;