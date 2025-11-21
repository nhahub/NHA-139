import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MapPin, Menu, X, Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserAvatar } from "@/components/UserAvatar";
import { SignOutButton } from "@/components/SignOutButton"; // Assuming this component exists

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isOwner } = useAuth(); // Removed unnecessary signOut here
  const { t } = useTranslation();

  // Navigation setup
  const navigation = [
    { name: t("nav.home"), href: "/" },
    { name: t("nav.listings"), href: "/listings" },
    { name: t("nav.contact"), href: "/contact" },
  ];

  if (isOwner) {
    // Note: Use push for array modification outside of rendering logic
    navigation.push({ name: t("nav.myListings"), href: "/owner/my-listings" });
  }

  // Determine user display name for mobile menu
  const displayName = user?.user_metadata?.full_name || user?.email?.split("@")[0] || t("common.user");

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:bg-gray-900/90 dark:border-gray-700">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ef4343]">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold dark:text-white">WhereToGo</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:space-x-8 rtl:space-x-reverse rtl:md:space-x-reverse rtl:md:space-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-[#ef4343] dark:hover:text-[#ff7e7e]",
                location.pathname === item.href
                  ? "text-[#ef4343] dark:text-[#ff7e7e]"
                  : "text-foreground/60 dark:text-gray-400"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Desktop Controls (Left/RTL or Right/LTR) */}
        <div className="hidden md:flex md:items-center md:space-x-2 rtl:space-x-reverse">
          <LanguageSwitcher />
          <ThemeToggle />

          {user ? (
            <>
              {isOwner && (
                <Link to="/owner/add-listing">
                  <Button size="sm" className="bg-[#ef4343] hover:bg-[#ff7e7e]">
                    <Plus className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                    {t("owner.addNew")}
                  </Button>
                </Link>
              )}
              <UserAvatar user={user} />
              {/* Assuming SignOutButton handles the onClick logic */}
              <SignOutButton /> 
            </>
          ) : (
            <>
              <Link to="/signin">
                <Button variant="outline" size="sm" className="dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 dark:text-gray-300 dark:hover:text-white">
                  {t("nav.signin")}
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="bg-[#ef4343] hover:bg-[#ff7e7e]">
                  {t("nav.signup")}
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden dark:text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </nav>

      {/* Mobile Menu Content */}
      {mobileMenuOpen && (
        <div className="border-t md:hidden bg-background/95 dark:bg-gray-900 dark:border-gray-700">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "block rounded-md px-3 py-2 text-base font-medium transition-colors",
                  location.pathname === item.href
                    ? "bg-[#ef4343] text-white"
                    : "text-foreground/80 hover:bg-muted dark:text-gray-300 dark:hover:bg-gray-800"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Language & Theme Switchers */}
            <div className="flex items-center justify-between py-2 border-b dark:border-gray-700">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>

            {/* Mobile Auth/User Actions */}
            <div className="mt-4 space-y-2 pt-2">
              {user ? (
                <>
                  {/* Mobile User Info Card */}
                  <div className="flex flex-col items-start gap-3 p-3 border rounded-md dark:border-gray-700 dark:bg-gray-800">
                    <div className="flex items-center gap-3 w-full">
                        <UserAvatar user={user} />
                        <div className="flex-1 text-sm">
                          <p className="font-medium dark:text-white">{displayName}</p>
                          <p className="text-muted-foreground text-xs dark:text-gray-400">{user.email}</p>
                        </div>
                        <SignOutButton /> {/* Sign out button moved to the info card for clarity */}
                    </div>
                  </div>

                  {/* Owner Button (if owner) */}
                  {isOwner && (
                    <Link to="/owner/add-listing">
                      <Button
                        className="w-full bg-[#ef4343] hover:bg-[#ff7e7e]"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Plus className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                        {t("owner.addNew")}
                      </Button>
                    </Link>
                  )}
                  
                </>
              ) : (
                <>
                  <Link to="/signin">
                    <Button
                      variant="outline"
                      className="w-full dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 dark:text-gray-300 dark:hover:text-white"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t("nav.signin")}
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button
                      className="w-full bg-[#ef4343] hover:bg-[#ff7e7e]"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t("nav.signup")}
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}