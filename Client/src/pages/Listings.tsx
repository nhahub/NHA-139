/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import img from "../assets/Cardimg.png";
import axios from "axios";
import { Star, MapPin, Phone, Heart, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

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
}

const USERS_API_URL = "http://127.0.0.1:5000/api/users";
const PLACES_API_URL = "http://127.0.0.1:5000/api/v1/places";

const Listings: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { user, token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isFavorite, setIsFavorite] = useState<Record<string, boolean>>({});
  const [sortOption, setSortOption] = useState<string>("default");
  const [viewType, setViewType] = useState<string>("grid");
  const [visibleCount, setVisibleCount] = useState(20);

  const cityFilter = searchParams.get("city");
  const priceLevelFilter = searchParams.get("priceLevel");

  const { isLoading, error } = useQuery({
    queryKey: ["listings", cityFilter, priceLevelFilter, sortOption],
    queryFn: async () => {
      if (!token) {
        return { data: { places: [] } };
      }

      const params = new URLSearchParams();

      if (cityFilter) params.append("city", cityFilter);
      if (priceLevelFilter) params.append("priceLevel", priceLevelFilter);

      if (sortOption === "nearest") {
        try {
          const { lat, lng } = await getLocation();
          params.append("sortBy", "radius");
          params.append("lat", lat.toString());
          params.append("lng", lng.toString());
        } catch (err) {
          console.error("Could not get location for sorting", err);
          toast({
            title: "Error",
            description: "Could not get your location for sorting.",
            variant: "destructive",
          });
        }
      } else if (sortOption === "highRating") {
        params.append("sortBy", "rating");
      }

      let url = `${PLACES_API_URL}/search`;
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setRestaurants(response.data.data.places);
      return response.data;
    },
    enabled: !!token,
  });

  useEffect(() => {
    if (user && user.favorites) {
      const favMap = user.favorites.reduce((acc, fav) => {
        acc[fav._id] = true;
        return acc;
      }, {} as Record<string, boolean>);
      setIsFavorite(favMap);
    } else {
      setIsFavorite({});
    }
  }, [user]);

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({
      placeId,
      isCurrentlyFavorite,
    }: {
      placeId: string;
      isCurrentlyFavorite: boolean;
    }) => {
      if (!token) throw new Error("Please log in to add favorites.");

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
        throw new Error(err.message || "Failed to update favorite");
      }
    },
    onSuccess: (data, variables) => {
      const { placeId, isCurrentlyFavorite } = variables;

      setIsFavorite((prev) => ({ ...prev, [placeId]: !isCurrentlyFavorite }));

      queryClient.invalidateQueries({ queryKey: ["favorites"] });
      queryClient.invalidateQueries({ queryKey: ["profileFavorites"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });

      toast({
        title: "Success",
        description: isCurrentlyFavorite
          ? "Removed from favorites"
          : "Added to favorites",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleFavorite = (id: string) => {
    if (!token) {
      toast({
        title: "Login Required",
        description: "Please log in to manage your favorites.",
        variant: "destructive",
      });
      return;
    }
    toggleFavoriteMutation.mutate({
      placeId: id,
      isCurrentlyFavorite: !!isFavorite[id],
    });
  };

  const addHistoryMutation = useMutation({
    mutationFn: async (placeId: string) => {
      if (!token) return;
      await fetch(`${USERS_API_URL}/history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ placeId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (error: any) => {
      console.error("Failed to add to history:", error);
    },
  });

  const handleListingClick = (placeId: string) => {
    if (token) {
      addHistoryMutation.mutate(placeId);
    }
  };

  const getLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject("Geolocation not supported");
      } else {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            resolve({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            });
          },
          (err) => reject(err)
        );
      }
    });
  };

  const handleSort = (option: string) => {
    setSortOption(option);
  };

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 8);
  };

  const handleClearFilters = () => {
    navigate("/listings");
    setVisibleCount(20);
    setSortOption("default");
  };

  const hasActiveFilters = cityFilter || priceLevelFilter;

  return (
    <>
      <Header />
      <div className="flex flex-col w-full h-auto bg-gray-100 dark:bg-background py-5">
        <div className="container mx-auto px-4 md:px-20">
          <h2 className="text-black font-bold text-4xl dark:text-white">
            All Listings
          </h2>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-gray-400 text-2xl mt-2">
              {hasActiveFilters
                ? "Showing Filtered Results"
                : "Showing All results"}
            </span>
            {hasActiveFilters && (
              <div className="flex items-center gap-2 mt-2">
                {cityFilter && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {cityFilter}
                  </span>
                )}
                {priceLevelFilter && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {"$".repeat(parseInt(priceLevelFilter))}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 mt-7 flex-wrap px-4">
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-medium"
          >
            <X className="w-4 h-4" />
            Clear Filters
          </button>
        )}

        <select
          className="border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ef4343] dark:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
          value={sortOption}
          onChange={(e) => handleSort(e.target.value)}
          disabled={isLoading}
        >
          <option value="default">Default</option>
          <option value="nearest">Nearest</option>
          <option value="highRating">Highest Rating</option>
        </select>

        <div className="flex gap-2">
          <button
            onClick={() => setViewType("grid")}
            disabled={isLoading}
            className={`p-3 rounded-xl shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
      ${
        viewType === "grid"
          ? "bg-[#ef4343] text-white"
          : "bg-white text-gray-700 border border-gray-300 hover:bg-[#ffe1e1] hover:text-[#ef4343]"
      }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h4V4H4v2zm6 0h4V4h-4v2zm6 0h4V4h-4v2zM4 12h4v-2H4v2zm6 0h4v-2h-4v2zm6 0h4v-2h-4v2zM4 18h4v-2H4v2zm6 0h4v-2h-4v2zm6 0h4v-2h-4v2z"
              />
            </svg>
          </button>
          <button
            onClick={() => setViewType("list")}
            disabled={isLoading}
            className={`p-3 rounded-xl shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
      ${
        viewType === "list"
          ? "bg-[#ef4343] text-white"
          : "bg-white text-gray-700 border border-gray-300 hover:bg-[#ffe1e1] hover:text-[#ef4343]"
      }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {error && (
        <div className="mx-auto max-w-2xl mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-center">{error.toString()}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 text-[#ef4343] animate-spin" />
            <p className="text-gray-600 dark:text-gray-400">
              Loading restaurants...
            </p>
          </div>
        </div>
      ) : restaurants.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] px-4">
          <div className="text-center max-w-md">
            <div className="mb-4">
              <svg
                className="mx-auto h-16 w-16 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No Places Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {hasActiveFilters
                ? "We couldn't find any places matching your filters. Try adjusting your search criteria."
                : "No places are currently available."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="px-6 py-3 bg-[#ef4343] text-white rounded-lg hover:bg-[#ff7e7e] transition font-semibold"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <div
          className={
            viewType === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 p-6"
              : "grid grid-cols-1 gap-6 p-15 md:w-[40%] mr-auto ml-auto mt-4"
          }
        >
          {restaurants.slice(0, visibleCount).map((item) => (
            <Link
              key={item._id}
              to={`/listing/${item._id}`}
              onClick={() => handleListingClick(item._id)}
            >
              <Card className="group relative overflow-visible transition-all hover:shadow-lg h-full bg-card text-foreground border border-border p-0 pb-5">
                <CardContent className="p-0">
                  <div className="relative aspect-4/3 overflow-hidden">
                    <img
                      src={img}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-110"
                    />
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute bottom-3 right-3 h-9 w-9 rounded-full opacity-0 transition-opacity group-hover:opacity-100 disabled:opacity-50"
                      onClick={(e) => {
                        e.preventDefault();
                        toggleFavorite(item._id);
                      }}
                      disabled={toggleFavoriteMutation.isPending}
                    >
                      <Heart
                        className={`h-5 w-5 transition-colors ${
                          isFavorite[item._id]
                            ? "fill-red-600 text-red-600"
                            : "fill-none text-gray-100"
                        }`}
                      />
                    </Button>
                  </div>
                </CardContent>

                <CardHeader>
                  <CardTitle>
                    <div className="flex justify-between items-center ">
                      <div className="hover:text-[#ef4343]">{item.name}</div>
                      <span className="relative group inline-block max-w-[80px] truncate border border-gray-400 text-gray-700 text-sm font-medium px-1 rounded-full dark:text-white">
                        {item.category && item.category.length > 0
                          ? item.category[0]
                          : "Not Found"}
                      </span>
                    </div>
                  </CardTitle>
                  <CardDescription className="text-muted-foreground dark:text-white">
                    {item.city}
                  </CardDescription>
                </CardHeader>

                <CardFooter>
                  <div className="flex flex-col">
                    <h5 className="text-gray-500">{item.address}</h5>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Star
                          className="h-4 w-4  text-[#ef4343]"
                          stroke="currentColor"
                          fill="currentColor"
                        />
                        <span className="font-semibold">
                          {item.ratingsAverage}
                        </span>
                      </div>
                      <div className="text-lg font-bold text-gray-500 ">
                        Price Level {"\u2191"}:
                        <span className="text-[#ef4343]">
                          {item.priceLevel}
                        </span>
                      </div>
                    </div>

                    {item.phone ? (
                      <div className="mt-3 flex items-center space-x-2 text-sm  text-gray-500">
                        <Phone className="h-3 w-3 text-[#ef4343]" />
                        <span>{item.phone}</span>
                      </div>
                    ) : (
                      <div className="mt-3 flex items-center space-x-2 text-sm  text-gray-500">
                        <Phone className="h-3 w-3" />
                        <span>SOON!</span>
                      </div>
                    )}
                  </div>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
      {!isLoading && visibleCount < restaurants.length && (
        <div className="flex justify-center mt-8 mb-10">
          <button
            onClick={handleLoadMore}
            className="px-5 py-2 bg-[#ef4343] text-white rounded-lg hover:bg-[#ff7e7e] transition"
          >
            Load More ({restaurants.length - visibleCount} remaining)
          </button>
        </div>
      )}
      <Footer />
    </>
  );
};

export default Listings;
