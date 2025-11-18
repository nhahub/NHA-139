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
import { SignOutButton } from "@/components/SignOutButton";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isOwner, signOut } = useAuth();
  const { t } = useTranslation();

  const navigation = [
    { name: t("nav.home"), href: "/" },
    { name: t("nav.listings"), href: "/listings" },
    { name: t("nav.contact"), href: "/contact" },
  ];

  if (isOwner) {
    navigation.push({ name: t("nav.myListings"), href: "/owner/my-listings" });
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center space-x-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <MapPin className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">WhereToGo</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:space-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                location.pathname === item.href
                  ? "text-primary"
                  : "text-foreground/60"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex md:items-center md:space-x-2 rtl:space-x-reverse">
          <LanguageSwitcher />
          <ThemeToggle />

          {user ? (
            <>
              {isOwner && (
                <Link to="/owner/add-listing">
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                    {t("owner.addNew")}
                  </Button>
                </Link>
              )}
              <UserAvatar user={user} />
              <SignOutButton />
            </>
          ) : (
            <>
              <Link to="/signin">
                <Button variant="outline" size="sm">
                  {t("nav.signin")}
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">{t("nav.signup")}</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t md:hidden">
          <div className="space-y-1 px-4 pb-3 pt-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "block rounded-md px-3 py-2 text-base font-medium",
                  location.pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/60 hover:bg-muted"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="flex items-center justify-between py-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
            <div className="mt-4 space-y-2">
              {user ? (
                <>
                  {isOwner && (
                    <Link to="/owner/add-listing">
                      <Button
                        className="w-full"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Plus className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                        {t("owner.addNew")}
                      </Button>
                    </Link>
                  )}
                  <div className="flex items-center gap-3 p-3 border rounded-md">
                    <UserAvatar user={user} />
                    <div className="flex-1 text-sm">
                      <p className="font-medium">
                        {user.user_metadata?.full_name ||
                          user.email?.split("@")[0]}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {user.email}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <Link to="/signin">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t("nav.signin")}
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button
                      className="w-full"
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
