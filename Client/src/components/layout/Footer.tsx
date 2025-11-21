import { Link } from "react-router-dom";
import {
  MapPin,
  Mail,
  Phone,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";
import { useTranslation } from "react-i18next"; // <-- CRITICAL LINE 1

export function Footer() {
  const { t } = useTranslation(); // <-- CRITICAL LINE 2

  return (
    <footer className="border-t bg-muted/30 dark:bg-gray-800 dark:border-gray-700">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand & Slogan */}
          <div>
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ef4343]">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold dark:text-white">WhereToGo</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground dark:text-gray-400">
              {t("footer.slogan")} {/* <-- Using t() */}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold dark:text-white">
              {t("footer.quickLinksTitle")} {/* <-- Using t() */}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/listings"
                  className="text-muted-foreground hover:text-[#ef4343] dark:hover:text-[#ff7e7e] dark:text-gray-400"
                >
                  {t("footer.browseListings")}
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-muted-foreground hover:text-[#ef4343] dark:hover:text-[#ff7e7e] dark:text-gray-400"
                >
                  {t("nav.contact")} 
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-muted-foreground hover:text-[#ef4343] dark:hover:text-[#ff7e7e] dark:text-gray-400"
                >
                  {t("footer.aboutUs")}
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-muted-foreground hover:text-[#ef4343] dark:hover:text-[#ff7e7e] dark:text-gray-400"
                >
                  {t("footer.terms")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="mb-4 text-sm font-semibold dark:text-white">
              {t("footer.categoriesTitle")}
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/listings?category=restaurant"
                  className="text-muted-foreground hover:text-[#ef4343] dark:hover:text-[#ff7e7e] dark:text-gray-400"
                >
                  {t("footer.category.restaurants")}
                </Link>
              </li>
              <li>
                <Link
                  to="/listings?category=cafe"
                  className="text-muted-foreground hover:text-[#ef4343] dark:hover:text-[#ff7e7e] dark:text-gray-400"
                >
                  {t("footer.category.cafes")}
                </Link>
              </li>
              <li>
                <Link
                  to="/listings?category=coffee shops"
                  className="text-muted-foreground hover:text-[#ef4343] dark:hover:text-[#ff7e7e] dark:text-gray-400"
                >
                  {t("footer.category.coffeeShops")}
                </Link>
              </li>
              <li>
                <Link
                  to="/listings?category=Seafood Restaurant"
                  className="text-muted-foreground hover:text-[#ef4343] dark:hover:text-[#ff7e7e] dark:text-gray-400"
                >
                  {t("footer.category.seafood")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-semibold dark:text-white">
              {t("footer.contactTitle")} {/* <-- Using t() */}
            </h3>
            {/* Contact details are hardcoded data, but the labels are gone now */}
            <ul className="space-y-3 text-sm text-muted-foreground dark:text-gray-400">
              <li className="flex items-start space-x-2">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>4517 Washington Ave. Chester, Kentucky 39495</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>(603) 555-0123</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>whereto@go.com</span>
              </li>
            </ul>
            {/* Social links block remains */}
            <div className="mt-4 flex space-x-3">
              <a href="#" className="text-muted-foreground hover:text-[#ef4343] dark:text-gray-500 dark:hover:text-[#ff7e7e]">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-[#ef4343] dark:text-gray-500 dark:hover:text-[#ff7e7e]">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-[#ef4343] dark:text-gray-500 dark:hover:text-[#ff7e7e]">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-[#ef4343] dark:text-gray-500 dark:hover:text-[#ff7e7e]">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground dark:text-gray-500 dark:border-gray-700">
          <p>
            {/* Using interpolation for dynamic year */}
            {t("footer.copyright", { year: new Date().getFullYear() })}
          </p>
        </div>
      </div>
    </footer>
  );
}