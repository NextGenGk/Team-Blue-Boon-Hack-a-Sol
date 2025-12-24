"use client";

import { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import PromotionalBanner from "@/components/PromotionalBanner";
import { usePathname } from "next/navigation";

interface AppLayoutProps {
  children: ReactNode;
  showNavbar?: boolean;
  showPromoBanner?: boolean;
  promoBannerProps?: {
    message?: string;
    backgroundColor?: string;
    textColor?: string;
    dismissible?: boolean;
  };
  navbarProps?: {
    showBackButton?: boolean;
    backButtonText?: string;
    onBackClick?: () => void;
  };
  className?: string;
}

export default function AppLayout({
  children,
  showNavbar = true,
  showPromoBanner = true,
  promoBannerProps = {},
  navbarProps = {},
  className = ""
}: AppLayoutProps) {
  const pathname = usePathname();
  // Hide default navbar on dashboard-related pages
  const shouldHideNavbar = pathname === "/patient-dashboard" ||
    pathname === "/appointments" ||
    pathname === "/receipts" ||
    pathname === "/settings" ||
    pathname === "/profile";

  return (
    <div className={className}>
      {/* Promotional Banner - Always at the top */}
      {showPromoBanner && (
        <div className="sticky top-0 z-50">
          <PromotionalBanner {...promoBannerProps} />
        </div>
      )}

      {/* Navbar - Below the promotional banner */}
      {showNavbar && !shouldHideNavbar && (
        <Navbar {...navbarProps} />
      )}
      {children}
    </div>
  );
}