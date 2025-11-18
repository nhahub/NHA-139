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

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <MapPin className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">WhereToGo</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Discover and connect with great places around the world. Your
              ultimate directory for local businesses.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/listings"
                  className="text-muted-foreground hover:text-primary"
                >
                  Browse Listings
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-muted-foreground hover:text-primary"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-muted-foreground hover:text-primary"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-muted-foreground hover:text-primary"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/listings?category=restaurant"
                  className="text-muted-foreground hover:text-primary"
                >
                  Restaurants
                </Link>
              </li>
              <li>
                <Link
                  to="/listings?category=cafe"
                  className="text-muted-foreground hover:text-primary"
                >
                  Cafes
                </Link>
              </li>
              <li>
                <Link
                  to="/listings?category=coffee shops"
                  className="text-muted-foreground hover:text-primary"
                >
                  Coffee Shops
                </Link>
              </li>
              <li>
                <Link
                  to="/listings?category=Seafood Restaurant"
                  className="text-muted-foreground hover:text-primary"
                >
                  Seafood
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Contact</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
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
            <div className="mt-4 flex space-x-3">
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} WhereToGo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
