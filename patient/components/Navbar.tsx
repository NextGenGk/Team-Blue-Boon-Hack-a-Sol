"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useEnhancedSupabase } from "@/components/EnhancedSupabaseProvider";
import { ArrowLeft, MapPin } from "lucide-react";

interface NavbarProps {
  showBackButton?: boolean;
  backButtonText?: string;
  onBackClick?: () => void;
}

export default function Navbar({
  showBackButton = false,
  backButtonText = "Home",
  onBackClick,
}: NavbarProps) {
  const { user, loading } = useEnhancedSupabase();
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Handle back button click
  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      router.push("/");
    }
  };

  // Close menu when clicking outside or on menu item
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Open menu
  const openMenu = () => {
    setIsMenuOpen(true);
  };

  // Handle navigation
  const handleNavigation = (path: string) => {
    router.push(path);
    closeMenu();
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        isMenuOpen &&
        !target.closest("#menu") &&
        !target.closest("#openMenu")
      ) {
        closeMenu();
      }
    };

    if (isMenuOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <>
      {/* Add Poppins Font */}
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap");
        * {
          font-family: "Poppins", sans-serif;
        }
      `}</style>

      <div className="w-full bg-background">
        <header
          className="flex items-center px-6 py-3 md:py-4 max-w-7xl mx-auto w-full"
        >
          {/* Logo Section */}
          <div className="flex items-center space-x-4">
            <div
              className="flex items-center space-x-3 cursor-pointer group"
              onClick={() => router.push("/")}
            >
              <img
                src="/logo.png"
                alt="HealthPWA Logo"
                className="h-14 w-64 object-contain"
              />
            </div>

            {/* Back Button */}
            {showBackButton && (
              <button
                onClick={handleBackClick}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-foreground hover:text-muted-foreground rounded-lg hover:bg-muted transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">{backButtonText}</span>
              </button>
            )}
          </div>

          {/* Navigation Menu - Centered (Empty for now) */}
          <div className="flex-1"></div>

          {/* Right Section - Controls & Auth */}
          <div className="flex items-center space-x-4">
            {/* Location Icon */}
            <button className="flex items-center space-x-1 text-muted-foreground hover:text-primary transition-colors duration-200 cursor-pointer">
              <MapPin className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Location</span>
            </button>

            {/* Authentication Section */}
            {loading ? (
              <div className="w-8 h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse"></div>
            ) : user ? (
              <div className="flex items-center space-x-2">
                {/* User Avatar/Profile Button */}
                <button
                  onClick={() => router.push("/patient-dashboard")}
                  className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold hover:shadow-lg hover:shadow-primary/20 transform hover:scale-110 transition-all duration-300"
                  title="View Dashboard"
                >
                  {user.user_metadata?.first_name?.[0]?.toUpperCase() ||
                    user.email?.[0]?.toUpperCase() ||
                    "U"}
                </button>
              </div>
            ) : (
              <>
                {/* Sign Up Button */}
                <a
                  className="hidden md:flex bg-green-400 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-green-500 transition cursor-pointer"
                  onClick={() => router.push("/sign-up")}
                >
                  Sign up
                </a>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <button
              id="openMenu"
              className="md:hidden text-muted-foreground"
              onClick={openMenu}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </header>
      </div>
    </>
  );
}