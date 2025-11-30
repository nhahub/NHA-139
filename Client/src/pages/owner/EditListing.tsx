/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next"; // <-- CRITICAL IMPORT
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const LISTINGS_API_URL = API_BASE_URL + "/api/listings";

interface EditListingFormData {
  name: string;
  city: string;
  address: string;
  category: string;
  phone: string;
  website: string;
  priceLevel: number;
  googleMapsLink: string;
}

export default function EditListing() {
  const { id } = useParams();
  const { t } = useTranslation(); // <-- Initialize translation hook
  const { user, token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EditListingFormData>();

  useEffect(() => {
    const fetchListing = async () => {
      if (!token || !id || !user) return;

      try {
        let listingData;
        const headers = { Authorization: `Bearer ${token}` };

        if (user.role === "admin") {
          const response = await fetch(`${LISTINGS_API_URL}/${id}`, {
            headers,
          });
          if (!response.ok) throw new Error(t("toast.fetchError.listing"));
          const json = await response.json();
          listingData = json.data;
        } else {
          const response = await fetch(`${LISTINGS_API_URL}/my`, { headers });
          if (!response.ok) throw new Error(t("toast.fetchError.listing"));
          const json = await response.json();
          listingData = json.data.find((l: any) => l._id === id);
        }

        if (!listingData) throw new Error(t("toast.fetchError.notFound"));

        const place = listingData.place;

        // --- Setting fetched values ---
        setValue("name", place.name);
        setValue("city", place.city);
        setValue("address", place.address || "");
        setValue("category", place.category?.[0] || "");
        setValue("phone", place.phone || "");
        setValue("website", place.website || "");
        setValue("priceLevel", place.priceLevel);
        // Assuming googleMapsLink is not stored in 'place' but is needed for the form
        // If the location coordinates are available, you might reconstruct a basic maps link here
        // For now, we leave it empty.
      } catch (error: any) {
        toast({
          title: t("toast.error.title"),
          description: error.message,
          variant: "destructive",
        });
        navigate(user.role === "admin" ? "/dashboard" : "/owner/my-listings");
      } finally {
        setIsFetching(false);
      }
    };

    fetchListing();
  }, [id, token, user, setValue, navigate, toast, t]); // Added 't' to dependencies

  // Location extraction utility (kept in English as it's backend logic)
  const extractCoordinatesFromGoogleMaps = (
    url: string
  ): [number, number] | null => {
    try {
      const patterns = [
        /[?&]q=([-\d.]+),([-\d.]+)/,
        /@([-\d.]+),([-\d.]+)/,
        /[?&]ll=([-\d.]+),([-\d.]+)/,
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return [parseFloat(match[2]), parseFloat(match[1])];
      }

      if (url.includes("goo.gl") || url.includes("maps.google.com")) {
        return [29.9187, 31.2001];
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const onSubmit = async (data: EditListingFormData) => {
    setIsLoading(true);

    try {
      const payload: any = {
        name: data.name,
        city: data.city,
        address: data.address,
        category: [data.category],
        phone: data.phone,
        website: data.website,
        priceLevel: Number(data.priceLevel),
      };

      if (data.googleMapsLink) {
        const coords = extractCoordinatesFromGoogleMaps(data.googleMapsLink);
        if (coords) {
          payload.location = { type: "Point", coordinates: coords };
        } else {
          toast({
            title: t("toast.error.title"),
            description: t("owner.validation.invalidMapLink"),
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }

      const endpoint =
        user?.role === "admin"
          ? `${LISTINGS_API_URL}/${id}`
          : `${LISTINGS_API_URL}/${id}/own`;

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || t("toast.update.title.failed"));
      }

      if (user?.role === "admin") {
        toast({
          title: t("toast.update.title.admin"),
          description: t("toast.update.desc.admin"),
        });
        navigate("/dashboard");
      } else {
        toast({
          title: t("toast.update.title.owner"),
          description: t("toast.update.desc.owner"),
        });
        navigate("/owner/my-listings");
      }
    } catch (error: any) {
      toast({
        title: t("toast.update.title.failed"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- Loading State ---
  if (isFetching) {
    return (
      <div className="flex min-h-screen items-center justify-center dark:bg-gray-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#ef4343] border-t-transparent"></div>
      </div>
    );
  }

  // Determine navigation target based on role for the Cancel button
  const navigateBackPath =
    user?.role === "admin" ? "/dashboard" : "/owner/my-listings";

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1 bg-muted/30 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold dark:text-white">
              {t("owner.edit.title")}
            </h1>
            <p className="text-muted-foreground dark:text-gray-400">
              {user?.role === "admin"
                ? t("owner.edit.subtitle.admin")
                : t("owner.edit.subtitle.owner")}
            </p>
          </div>

          {/* Form Card */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white rtl:text-right">
                {t("owner.edit.cardTitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Place Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name" className="dark:text-gray-300">
                      {t("owner.form.label.placeName")}
                    </Label>
                    <Input
                      id="name"
                      {...register("name", { required: t("common.required") })}
                      className="dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* City */}
                  <div className="space-y-2">
                    <Label htmlFor="city" className="dark:text-gray-300">
                      {t("owner.form.label.city")}
                    </Label>
                    <Input
                      id="city"
                      {...register("city", { required: t("common.required") })}
                      className="dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                    />
                    {errors.city && (
                      <p className="text-sm text-destructive">
                        {errors.city.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address" className="dark:text-gray-300">
                    {t("owner.form.label.address")}
                  </Label>
                  <Textarea
                    id="address"
                    {...register("address", { required: t("common.required") })}
                    className="dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                  />
                  {errors.address && (
                    <p className="text-sm text-destructive">
                      {errors.address.message}
                    </p>
                  )}
                </div>

                {/* Google Maps Link */}
                <div className="space-y-2">
                  <Label
                    htmlFor="googleMapsLink"
                    className="dark:text-gray-300"
                  >
                    {t("owner.form.label.mapsLink")}
                  </Label>
                  <Input
                    id="googleMapsLink"
                    placeholder={t("owner.form.placeholder.maps")}
                    {...register("googleMapsLink")}
                    className="dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category */}
                  <div className="space-y-2">
                    <Label htmlFor="category" className="dark:text-gray-300">
                      {t("owner.form.label.category")}
                    </Label>
                    <Input
                      id="category"
                      {...register("category", {
                        required: t("common.required"),
                      })}
                      className="dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                    />
                    {errors.category && (
                      <p className="text-sm text-destructive">
                        {errors.category.message}
                      </p>
                    )}
                  </div>

                  {/* Price Level */}
                  <div className="space-y-2">
                    <Label htmlFor="priceLevel" className="dark:text-gray-300">
                      {t("owner.form.label.priceLevel")}
                    </Label>
                    <Input
                      id="priceLevel"
                      type="number"
                      min="1"
                      max="4"
                      {...register("priceLevel", {
                        required: t("common.required"),
                        min: {
                          value: 1,
                          message: t("owner.validation.priceLevelMin"),
                        },
                        max: {
                          value: 4,
                          message: t("owner.validation.priceLevelMax"),
                        },
                      })}
                      className="dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                    />
                    {errors.priceLevel && (
                      <p className="text-sm text-destructive">
                        {errors.priceLevel.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="dark:text-gray-300">
                      {t("owner.form.label.phone")}
                    </Label>
                    <Input
                      id="phone"
                      {...register("phone")}
                      className="dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                    />
                  </div>

                  {/* Website */}
                  <div className="space-y-2">
                    <Label htmlFor="website" className="dark:text-gray-300">
                      {t("owner.form.label.website")}
                    </Label>
                    <Input
                      id="website"
                      {...register("website")}
                      className="dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                    />
                  </div>
                </div>

                {/* Submit and Cancel Buttons */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-[#ef4343] hover:bg-[#ff7e7e]"
                  >
                    {isLoading ? t("common.saving") : t("common.saveChanges")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(navigateBackPath)}
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    {t("common.cancel")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
