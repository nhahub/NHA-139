import { Link } from "react-router-dom";
import { Listing } from "@/types/listing";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Phone, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useTranslation } from "react-i18next"; // Import useTranslation

interface ListingCardProps {
  listing: Listing;
  userLocation?: { lat: number; lng: number };
}

export function ListingCard({ listing, userLocation }: ListingCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const { t } = useTranslation(); // Initialize translation hook

  // Helper to format currency (assuming listing.price is a number)
  const formattedPrice = new Intl.NumberFormat(t('i18n.language'), {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(listing.price);

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg dark:bg-gray-800 dark:border-gray-700">
      <Link to={`/listing/${listing.slug}`}>
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={listing.image}
            alt={listing.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-110"
            loading="lazy"
          />
          {listing.isOpen && (
            <Badge className="absolute left-3 top-3 bg-success">
              {t("listing.status.open")} {/* Translated */}
            </Badge>
          )}
          {listing.isFeatured && (
            <Badge className="absolute right-3 top-3 bg-accent">
              {t("listing.status.featured")} {/* Translated */}
            </Badge>
          )}
          <Button
            size="icon"
            variant="secondary"
            className="absolute bottom-3 right-3 h-9 w-9 rounded-full opacity-0 transition-opacity group-hover:opacity-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            onClick={(e) => {
              e.preventDefault();
              setIsFavorite(!isFavorite);
            }}
          >
            <Heart
              className={`h-4 w-4 ${isFavorite ? "fill-[#ef4343] text-[#ef4343]" : "fill-none text-white"}`}
            />
          </Button>
        </div>
      </Link>

      <CardContent className="p-4">
        <div className="mb-2 flex items-start justify-between">
          <div className="flex-1">
            <Link to={`/listing/${listing.slug}`}>
              <h3 className="line-clamp-1 text-lg font-semibold transition-colors hover:text-[#ef4343] dark:text-white dark:hover:text-[#ff7e7e]">
                {listing.title}
              </h3>
            </Link>
            <div className="mt-1 flex items-center space-x-1 text-sm text-muted-foreground dark:text-gray-400">
              <MapPin className="h-3 w-3" />
              <span className="line-clamp-1">
                {/* Translated Location Display */}
                {t('listing.locationDisplay', { city: listing.location.city, state: listing.location.state })}
              </span>
            </div>
          </div>
          <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
            {listing.category}
          </Badge>
        </div>

        <p className="mb-3 line-clamp-2 text-sm text-muted-foreground dark:text-gray-400">
          {listing.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 fill-[#ef4343] text-[#ef4343]" />
            <span className="font-semibold dark:text-white">{listing.rating}</span>
            <span className="text-sm text-muted-foreground dark:text-gray-400">
              {/* Translated Review Count Display */}
              {t("listing.ratingDisplay", { reviewCount: listing.reviewCount })}
            </span>
          </div>
          <div className="text-lg font-bold text-[#ef4343]">
            {formattedPrice} {/* Using formatted price */}
          </div>
        </div>

        {listing.phone && (
          <div className="mt-3 flex items-center space-x-2 text-sm text-muted-foreground dark:text-gray-400">
            <Phone className="h-3 w-3" />
            <span>{listing.phone}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}