"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import companyLogo from "../data/images/mtn_logo_large.png";
import {
  Target,
  Calendar,
  BarChart3,
  CloudRain,
  Info,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
} from "lucide-react";

const Sidebar = ({ className }) => {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isOpen, setIsOpen] = useState(true); // Desktop: default open, Mobile: will be set based on screen size
  const [isMobile, setIsMobile] = useState(false);

  // Navigation items with icons
  const navItems = [
    { name: "Objective", path: "/objective", icon: Target },
    {
      name: "State Level Crop Calendar",
      path: "/state-comparisons",
      icon: Calendar,
    },
    { name: "Crop Data", path: "/crop-data", icon: BarChart3 },
    {
      name: "Monsoon Predictions",
      path: "/monsoon-predictions",
      icon: CloudRain,
    },
    { name: "About MTN", path: "/about", icon: Info },
  ];

  const isActive = (itemPath) => {
    if (itemPath === pathname) return true;
    if (itemPath === "/crop-calendar" && pathname.startsWith("/crop-calendar/"))
      return true;
    return false;
  };

  // Toggle sidebar open/close state
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Handle resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (mobile) {
        // Mobile: closed by default
        setIsOpen(false);
      } else {
        // Desktop: open by default
        setIsOpen(true);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Mobile toggle button - outside the sidebar */}
      <button
        onClick={toggleSidebar}
        className="md:hidden fixed z-20 top-4 left-4 bg-transparent text-mtn-green-900"
        aria-label="Toggle menu"
        title={isOpen ? "Close" : "Menu"}
      >
        {isOpen ? (
          <X size={24} className="text-white fixed top-4 left-4" />
        ) : (
          <Menu size={24} />
        )}
      </button>

      {/* Overlay for mobile - closes sidebar when clicking outside */}
      {isOpen && isMobile && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`transition-all duration-300 ease-in-out bg-mtn-green-800 text-white fixed md:sticky z-10
          ${isMobile ? "w-64" : isOpen ? "w-1/6" : "w-20"}
          ${isMobile ? (isOpen ? "translate-x-0" : "-translate-x-full") : "translate-x-0"}
          h-full min-h-svh top-0 left-0
          ${className || ""}`}
      >
        {/* Desktop collapse/expand toggle button */}
        <button
          onClick={toggleSidebar}
          className="hidden md:flex absolute right-0 top-4 bg-transparent text-mtn-green-700 p-2 rounded-l-lg transform translate-x-full items-center justify-center"
          title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>

        <div
          className={`flex justify-center transition-all duration-300
            ${isMobile ? "p-4" : isOpen ? "p-4" : "p-2"}`}
        >
          <Link href="/">
            <div
              className={`relative transition-all duration-300
                ${isOpen ? "h-24 w-24 sm:h-32 sm:w-32" : "h-14 w-14"}`}
            >
              <Image
                src={companyLogo}
                alt="MTN Earth Logo"
                fill
                style={{ objectFit: "contain" }}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={!isMobile}
              />
            </div>
          </Link>
        </div>

        <nav className="mt-6">
          <ul>
            {navItems.map((item) => {
              const active = isActive(item.path);
              const isHovered = hoveredItem === item.name;
              const Icon = item.icon;

              return (
                <li key={item.name}>
                  <div
                    className="relative"
                    onMouseEnter={() => setHoveredItem(item.name)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {/* Orange indicator bar */}
                    {(active || isHovered) && (
                      <div className="absolute left-0 top-0 w-2 h-full bg-orange-500 rounded-l-sm transition-opacity duration-200" />
                    )}

                    <Link
                      href={item.path}
                      className={`flex items-center py-4 pl-8
                        ${
                          active
                            ? "bg-mtn-green-900 rounded-r-sm"
                            : isHovered
                              ? "bg-mtn-green-700 rounded-r-sm"
                              : ""
                        }
                        transition-all duration-200`}
                      onClick={() => {
                        // Close sidebar on mobile after clicking a link
                        if (isMobile) {
                          setIsOpen(false);
                        }
                      }}
                    >
                      <Icon size={20} className="mr-3 flex-shrink-0" />
                      {/* Always show text on mobile, otherwise only when open on desktop */}
                      {(isMobile || isOpen) && <span>{item.name}</span>}
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
