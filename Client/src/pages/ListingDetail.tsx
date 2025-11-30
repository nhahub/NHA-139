/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Star,
  MapPin,
  Phone,
  Globe,
  Heart,
  Loader2,
  ArrowLeft,
  Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import img from "../assets/Cardimg.png";

import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

interface Location {
  type: string;
  coordinates: [number, number]; // [longitude, latitude]
}

interface Restaurant {
  _id: string;
  name: string;
  city: string;
  category: string[];
  phone?: string;
  priceLevel?: number;
  ratingsAverage?: number;
  ratingsQuantity?: number;
  address?: string;
  website?: string;
  location?: Location;
  createdAt?: string;
  updatedAt?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL;
const USERS_API_URL = API_BASE_URL + "/api/users";
const PLACES_API_URL = API_BASE_URL + "/api/places";

const ListingDetails: React.FC = () => {
  const { t } = useTranslation();

  // Get restaurant ID from URL
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // State management
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const { user, token } = useAuth(); // Token is here
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch restaurant details when component loads
  useEffect(() => {
    const fetchRestaurant = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${PLACES_API_URL}/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`, //
          },
        });

        // Response format: { message: "success", data: { place: {...} } }
        setRestaurant(response.data.data.place);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching restaurant:", err);
        setError(t("listing.errorLoad"));
        setLoading(false);
      }
    };

    if (id && token) {
      fetchRestaurant();
    } else if (!token) {
      setLoading(false);
      setError(t("listing.loginRequired"));
    }
  }, [id, token, t]);

  useEffect(() => {
    if (user && user.favorites && id) {
      const isFav = user.favorites.some((fav) => fav._id === id);
      setIsFavorite(isFav);
    }
  }, [user, id]);

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({
      placeId,
      isCurrentlyFavorite,
    }: {
      placeId: string;
      isCurrentlyFavorite: boolean;
    }) => {
      if (!token) throw new Error(t("listing.loginRequired"));

      const url = `${USERS_API_URL}/favorites${
        isCurrentlyFavorite ? `/${placeId}` : ""
      }`;
      const method = isCurrentlyFavorite ? "DELETE" : "POST";

      const options: RequestInit = {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      };

      if (method === "POST") {
        options.body = JSON.stringify({ placeId });
      }

      const response = await fetch(url, options);
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || t("listing.errorFavorite"));
      }
    },
    onSuccess: (data, variables) => {
      const { isCurrentlyFavorite } = variables;

      setIsFavorite(!isCurrentlyFavorite);

      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({ queryKey: ["profileFavorites"] });

      toast({
        title: t("listing.success"),
        description: isCurrentlyFavorite
          ? t("listing.removedFavorite")
          : t("listing.addedFavorite"),
      });
    },
    onError: (error: any) => {
      toast({
        title: t("listing.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleFavorite = () => {
    if (!id) return;
    if (!token) {
      toast({
        title: t("listing.loginRequired"),
        description: t("listing.loginToFavorite"),
        variant: "destructive",
      });
      return;
    }
    toggleFavoriteMutation.mutate({
      placeId: id,
      isCurrentlyFavorite: isFavorite,
    });
  };

  const goBack = () => {
    navigate("/listings");
  };

  const openInMaps = () => {
    if (restaurant?.location?.coordinates) {
      const [lng, lat] = restaurant.location.coordinates;
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
    }
  };

  const renderPriceLevel = (level?: number) => {
    if (!level) return t("listing.nA");
    return "£".repeat(level) + "£".repeat(4 - level).replace(/£/g, "·");
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 text-[#ef4343] animate-spin" />
            <p className="text-gray-600 dark:text-gray-400">
              {t("listing.loading")}
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !restaurant) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8">
              <p className="text-red-600 text-lg mb-4">
                {error || t("listing.notFound")}
              </p>
              <Button
                onClick={goBack}
                className="bg-[#ef4343] hover:bg-[#ff7e7e] text-white"
              >
                {t("listing.backToListings")}
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <div className="container mx-auto px-6 py-4">
        <Button
          onClick={goBack}
          variant="outline"
          className="flex items-center gap-2 hover:bg-[#ff7e7e] dark:hover:bg-[#ff7e7e]"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("listing.backToListings")}
        </Button>
      </div>

      <div className="container mx-auto px-6 py-8 mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="relative rounded-lg overflow-hidden shadow-lg">
              <img
                src={img}
                alt={restaurant.name}
                className="w-full h-[400px] object-cover"
              />

              <Button
                size="icon"
                onClick={toggleFavorite}
                disabled={toggleFavoriteMutation.isPending}
                className={`absolute top-4 right-4 h-12 w-12 rounded-full shadow-lg ${
                  isFavorite
                    ? "bg-[#ef4343] hover:bg-[#ff7e7e]"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                <Heart
                  className={`h-6 w-6 ${
                    isFavorite
                      ? "fill-white text-white"
                      : "fill-none text-[#ef4343]"
                  }`}
                />
              </Button>

              <div className="absolute top-4 left-4">
                <span className="px-4 py-2 bg-[#ef4343] text-white text-sm font-semibold rounded-full shadow-lg">
                  {restaurant.category?.[0] || t("listing.restaurant")}
                </span>
              </div>
            </div>

            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {restaurant.name}
              </h1>

              <div className="flex items-center gap-6 mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 bg-[#ef4343] px-3 py-1 rounded-lg">
                    <Star className="h-5 w-5 text-white fill-white" />
                    <span className="text-xl font-bold text-white">
                      {restaurant.ratingsAverage?.toFixed(1) || "N/A"}
                    </span>
                  </div>
                </div>
                <span className="text-gray-600 dark:text-gray-400">
                  {restaurant.ratingsQuantity?.toLocaleString() || 0}{" "}
                  {t("listing.reviews")}
                </span>
                <span className="text-[#ef4343] dark:text-[#ef4343] text-lg">
                  <span className="text-gray-500">£:</span>
                  {restaurant.priceLevel}
                </span>
              </div>

              <div className="flex items-center gap-2 text-lg text-gray-700 dark:text-gray-300">
                <MapPin className="h-5 w-5 text-[#ef4343]" />
                <span className="font-medium">{restaurant.city}</span>
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                  <span className="text-[#ef4343]">●</span>
                  {t("listing.about")}
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                  {t("listing.aboutText", {
                    name: restaurant.name,
                    city: restaurant.city,
                    category: restaurant.category?.[0] || "",
                  })}
                </p>
              </CardContent>
            </Card>

            {restaurant.category && restaurant.category.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="text-[#ef4343]">●</span>
                    {t("listing.categories")}
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {restaurant.category.map((cat, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium border border-gray-300 dark:border-gray-700"
                      >
                        {cat}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-6 shadow-xl border-2 border-gray-200 dark:border-gray-700">
              <CardContent className="p-6 space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white border-b-2 border-[#ef4343] pb-3">
                  {t("listing.contactInfo")}
                </h2>

                {restaurant.address && (
                  <div className="space-y-2 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-[#ef4343] mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white mb-1">
                          {t("listing.address")}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                          {restaurant.address}
                        </p>
                        {restaurant.location?.coordinates && (
                          <Button
                            onClick={openInMaps}
                            variant="outline"
                            size="sm"
                            className="mt-3 w-full text-[#ef4343] border-[#ef4343] hover:bg-[#ef4343] hover:text-white"
                          >
                            <Navigation className="h-4 w-4 mr-2" />
                            {t("listing.openInMaps")}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="space-y-2 pb-4 border-b border-gray-200 dark:border-gray-700">
                    {/* الحاوية الرئيسية - نستخدم 'flex' ونثبت الأيقونة في أقصى اليمين في وضع RTL */}
                    <div className="flex items-start gap-3">
                      {/* أيقونة الهاتف - تثبيت الأيقونة في موقعها */}
                      <Phone
                        className="h-5 w-5 text-[#ef4343] mt-1 flex-shrink-0"
                        // نستخدم فئات RTL لتغيير الهامش (margin) لتبتعد عن النص
                        style={{ marginInlineEnd: "0.75rem" }}
                      />

                      {/* حاوية النص - تشغل المساحة المتبقية وتكون محاذية لليمين في RTL */}
                      <div className="flex-1 rtl:text-right">
                        <p className="font-semibold text-gray-900 dark:text-white mb-1">
                          {t("listing.phone")}
                        </p>
                        {restaurant.phone ? (
                          <a
                            href={`tel:${restaurant.phone}`}
                            className="text-[#ef4343] hover:underline font-medium block"
                            // نستخدم CSS لتثبيت اتجاه الأرقام من LTR للقراءة الصحيحة
                            style={{ direction: "ltr" }}
                          >
                            {restaurant.phone}
                          </a>
                        ) : (
                          <p className="text-gray-500 dark:text-gray-400 italic">
                            {t("listing.phoneComingSoon")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-[#ef4343] mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white mb-1">
                        {t("listing.website")}
                      </p>
                      {restaurant.website ? (
                        <a
                          href={restaurant.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#ef4343] hover:underline font-medium break-all text-sm"
                        >
                          {t("listing.visitWebsite")}
                        </a>
                      ) : (
                        <p className="text-gray-500 dark:text-gray-400 italic">
                          {t("listing.notAvailable")}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pb-4">
                  <div className="flex items-start gap-3">
                    <span className="text-[#ef4343] text-xl mt-0.5">£</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white mb-1">
                        {t("listing.priceLevel")}
                      </p>
                      <div className="text-2xl font-bold text-[#ef4343]">
                        {restaurant.priceLevel}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {restaurant.priceLevel === 1 && t("listing.budget")}
                        {restaurant.priceLevel === 2 && t("listing.moderate")}
                        {restaurant.priceLevel === 3 && t("listing.upscale")}
                        {restaurant.priceLevel === 4 && t("listing.fineDining")}
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  className="w-full bg-[#ef4343] hover:bg-[#ff7e7e] text-white py-6 text-lg font-semibold"
                  onClick={() =>
                    restaurant.phone && window.open(`tel:${restaurant.phone}`)
                  }
                  disabled={!restaurant.phone}
                >
                  {restaurant.phone ? (
                    <>
                      <Phone className="h-5 w-5 mr-2" />
                      {t("listing.callNow")}
                    </>
                  ) : (
                    t("listing.phoneComingSoon")
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default ListingDetails;
