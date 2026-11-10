"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import NavLink from "./NavLink";
import UserMenu from "./UserMenu";
import { usePathname } from "next/navigation";
import Cart from "./Cart";
import { Menu, ShoppingBag, X, LogIn } from "lucide-react";
import { useAuthContext } from "../context/AuthContext";
import { useNavbarContext } from "../context/NavContext";
import ActionPillButton from "./ui/ActionPillButton";
import { cn } from "@/lib/utils";
import BrandLogo from "./ui/BrandLogo";

const navItems = [
  { href: "/", text: "Home" },
  { href: "/schools", text: "Schools" },
  { href: "/products", text: "Products" },
  { href: "/contact", text: "Contact" },
];

export const Navbar = () => {
  const { data, loading } = useAuthContext();
  const {
    isOpen,
    setIsOpen,
    isCartOpen,
    setIsCartOpen,
    isScrolling,
    setIsScrolling,
    distinctProductCount,
    setDistinctProductCount,
  } = useNavbarContext();
  const pathname = usePathname();

  useEffect(() => {
    function handleScroll() {
      setIsScrolling(window.scrollY > 30);
    }
    handleScroll();

    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      try {
        const cartItems = JSON.parse(storedCart);
        setDistinctProductCount(Object.keys(cartItems).length);
      } catch (e) {
        // Ignore JSON parse error
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [setIsScrolling, setDistinctProductCount]);

  useEffect(() => {
    if (isCartOpen || isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "visible";
    }
  }, [isCartOpen, isOpen]);

  useEffect(() => {
    setIsOpen(false);
    const frameId = requestAnimationFrame(() => {
      setIsScrolling(window.scrollY > 30);
    });
    return () => cancelAnimationFrame(frameId);
  }, [pathname, setIsOpen, setIsScrolling]);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-[100] w-full transition-all duration-300",
          isScrolling
            ? "border-b border-white/10 bg-surface-forest/95 backdrop-blur-md shadow-lg py-3"
            : "border-b border-transparent bg-surface-forest py-4"
        )}
      >
        <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-6 px-5 sm:px-8">
          {/* Brand Logo */}
          <Link
            href="/"
            aria-label="EduDrop Foundation Home"
            className="flex items-center gap-3 transition-opacity hover:opacity-90"
          >
            <BrandLogo variant="on-dark" size="sm" />
          </Link>

          {/* Desktop Primary Navigation Links */}
          <nav aria-label="Main Navigation" className="hidden lg:block">
            <ul className="flex items-center gap-8">
              {navItems.map((item, index) => (
                <NavLink key={index} href={item.href} text={item.text} />
              ))}
            </ul>
          </nav>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-3">
            {/* Cart Trigger */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              aria-label={`Open shopping cart (${distinctProductCount} items)`}
              className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition-all hover:bg-white/20 hover:border-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime cursor-pointer"
            >
              <ShoppingBag className="h-5 w-5" />
              {distinctProductCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-lime text-xs font-bold text-surface-forest shadow-sm animate-in zoom-in-50 duration-200">
                  {distinctProductCount}
                </span>
              )}
            </button>

            {/* User Account / Profile Menu or Sign In */}
            {loading ? (
              <div
                aria-hidden="true"
                className="hidden sm:block h-9 w-24 rounded-full bg-white/15 animate-pulse motion-reduce:animate-none"
              />
            ) : data ? (
              <UserMenu />
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-white/90 hover:text-white px-3 py-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <LogIn className="h-3.5 w-3.5" />
                Sign In
              </Link>
            )}

            {/* Header Primary CTA Pill */}
            <div className="hidden sm:block">
              <ActionPillButton
                variant="outline-glass"
                size="sm"
                href="/schools"
              >
                Sponsor Now
              </ActionPillButton>
            </div>

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime lg:hidden cursor-pointer"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Slide-over Cart Drawer */}
      {isCartOpen && <Cart setIsCartOpen={setIsCartOpen} />}

      {/* Mobile Slide-over Drawer */}
      {isOpen && (
        <div
          className="drawer-backdrop fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="mobile-drawer-panel absolute right-0 top-0 flex h-full w-full max-w-xs flex-col bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-border-subtle pb-4">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                aria-label="EduDrop Foundation Home"
              >
                <BrandLogo variant="on-light" size="sm" showTagline />
              </Link>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close menu"
                className="flex h-8 w-8 items-center justify-center rounded-full text-text-ink hover:bg-surface-bento"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile Navigation List */}
            <nav aria-label="Mobile Navigation" className="mt-6 flex-1">
              <ul className="space-y-1">
                {navItems.map((item, index) => (
                  <NavLink
                    key={index}
                    href={item.href}
                    text={item.text}
                    mobile
                    onNavigate={() => setIsOpen(false)}
                  />
                ))}
              </ul>
            </nav>

            {/* Drawer Footer Actions */}
            <div className="border-t border-border-subtle pt-5 space-y-3">
              {data ? (
                <UserMenu mobile onNavigate={() => setIsOpen(false)} />
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-full border border-border-subtle bg-surface-bento/60 py-2.5 text-xs font-semibold text-text-ink hover:bg-surface-bento transition-colors"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In to Donor Portal
                </Link>
              )}

              <ActionPillButton
                variant="lime"
                href="/schools"
                className="w-full justify-center"
                onClick={() => setIsOpen(false)}
              >
                Sponsor a School
              </ActionPillButton>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
