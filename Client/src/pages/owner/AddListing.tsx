/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const LISTINGS_API_URL = "http://127.0.0.1:5000/api/listings";

interface AddListingFormData {
  name: string;
  city: string;
  address: string;
  category: string;
  phone: string;
  website: string;
  priceLevel: number;
  googleMapsLink: string;
}

export default function AddListing() {
  const { t, i18n } = useTranslation();
  const { user, token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const isArabic = i18n.language === "ar";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddListingFormData>();

  // Helper: Extract coordinates from Google Maps URL (GeoJSON format: [lng, lat])
  const extractCoordinatesFromGoogleMaps = (
    url: string
  ): [number, number] | null => {
    try {
      const patterns = [
        /[?&]q=([-\d.]+),([-\d.]+)/, // q=lat,lng
        /@([-\d.]+),([-\d.]+)/, // @lat,lng
        /[?&]ll=([-\d.]+),([-\d.]+)/, // ll=lat,lng
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          // GeoJSON requires [longitude, latitude]
          return [parseFloat(match[2]), parseFloat(match[1])];
        }
      }

      // التعامل مع روابط الاختصار أو الروابط التي لا تحتوي على إحداثيات واضحة
      if (url.includes("goo.gl") || url.includes("maps.google.com")) {
        console.warn(
          "Could not extract coordinates precisely, defaulting to fallback."
        );
        // استخدام إحداثيات افتراضية (الإسكندرية كمثال)
        return [30.0, 31.0];
      }

      return null;
    } catch (error) {
      console.error("Error extracting coordinates:", error);
      return null;
    }
  };

  const onSubmit = async (data: AddListingFormData) => {
    setIsLoading(true);

    if (!token) {
      toast({
        title: t("toast.loginRequired.title"),
        description: t("toast.addListingError.login"),
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      // 1. Prepare Coordinates
      let coordinates: [number, number] = [30.0, 31.0]; // افتراضي

      // Ensure data.googleMapsLink exists (Validation guarantees this, but logic remains for safety)
      if (data.googleMapsLink) {
        const extracted = extractCoordinatesFromGoogleMaps(data.googleMapsLink);
        if (extracted) {
          coordinates = extracted;
        } else {
          // إذا كان الرابط موجودًا لكن الاستخلاص فشل بشكل مطلق
          throw new Error(
            t("owner.validation.invalidMapLink", "Invalid Google Maps link")
          );
        }
      }

      const payload = {
        name: data.name,
        city: data.city,
        address: data.address,
        category: [data.category], // نرسلها كمصفوفة
        phone: data.phone || undefined,
        website: data.website || undefined,
        priceLevel: Number(data.priceLevel),
        location: {
          type: "Point",
          coordinates: coordinates, // [longitude, latitude]
        },
      };

      // تحديد نقطة النهاية بناءً على دور المستخدم
      // Admin -> POST / (adminCreateListing) | Owner -> POST /submit (createListing)
      const endpoint =
        user?.role === "admin"
          ? `${LISTINGS_API_URL}/`
          : `${LISTINGS_API_URL}/submit`;

      console.log(`Submitting to: ${endpoint}`);

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      let result;

      if (!response.ok) {
        try {
          result = responseText ? JSON.parse(responseText) : {};
        } catch (e) {
          // إذا لم تكن الاستجابة JSON، ارمِ خطأ الخادم العام
          throw new Error(t("toast.error.unexpectedResponse"));
        }

        // ارمِ الخطأ من الـ Backend
        throw new Error(
          result.message || result.error || t("toast.addListingError.failed")
        );
      }

      // إذا نجح الطلب
      toast({
        title: t("common.success"),
        description:
          user?.role === "admin"
            ? t("toast.addListingSuccess.admin")
            : t("toast.addListingSuccess.desc"),
      });

      navigate("/dashboard");
    } catch (error: any) {
      console.error("Submission error:", error);
      toast({
        title: t("toast.error.title"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1 bg-muted/30 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 rtl:text-right">
            <h1 className="mb-2 text-3xl font-bold dark:text-white">
              {t("owner.addNew", "Add New Listing")}
            </h1>
            <p className="text-muted-foreground dark:text-gray-400">
              {user?.role === "admin"
                ? t("dashboard.subtitle.admin")
                : t("owner.addListingSubtitle")}
            </p>
          </div>

          <Card
            className="max-w-4xl mx-auto dark:bg-gray-800 dark:border-gray-700"
            dir={isArabic ? "rtl" : "ltr"}
          >
            <CardHeader>
              <CardTitle className="rtl:text-right dark:text-white">
                {t("owner.form.cardTitle", "Listing Details")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Place Name */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="rtl:text-right block dark:text-gray-300"
                    >
                      {t("owner.form.label.placeName", "Place Name *")}
                    </Label>
                    <Input
                      id="name"
                      placeholder={t("owner.form.placeholder.placeName")}
                      className="rtl:text-right dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      {...register("name", {
                        required: t(
                          "owner.validation.requiredName",
                          "Name is required"
                        ),
                      })}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive rtl:text-right">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* City */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="city"
                      className="rtl:text-right block dark:text-gray-300"
                    >
                      {t("owner.form.label.city", "City *")}
                    </Label>
                    <Input
                      id="city"
                      className="rtl:text-right dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      {...register("city", {
                        required: t(
                          "owner.validation.requiredCity",
                          "City is required"
                        ),
                      })}
                    />
                    {errors.city && (
                      <p className="text-sm text-destructive rtl:text-right">
                        {errors.city.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label
                    htmlFor="address"
                    className="rtl:text-right block dark:text-gray-300"
                  >
                    {t("owner.form.label.address", "Address *")}
                  </Label>
                  <Textarea
                    id="address"
                    placeholder={t("owner.form.placeholder.address")}
                    className="rtl:text-right dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    {...register("address", {
                      required: t(
                        "owner.validation.requiredAddress",
                        "Address is required"
                      ),
                    })}
                  />
                  {errors.address && (
                    <p className="text-sm text-destructive rtl:text-right">
                      {errors.address.message}
                    </p>
                  )}
                </div>

                {/* Google Maps Link (Mandatory) */}
                <div className="space-y-2">
                  <Label
                    htmlFor="googleMapsLink"
                    className="rtl:text-right block dark:text-gray-300"
                  >
                    {t(
                      "owner.form.label.mapsLink.addListing",
                      "Google Maps Link *"
                    )}
                  </Label>

                  <Input
                    id="googleMapsLink"
                    type="url"
                    className="rtl:text-right dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder={t(
                      "owner.form.placeholder.maps.addListing",
                      "Paste Google Maps link..."
                    )}
                    {...register("googleMapsLink", {
                      required: t(
                        "owner.validation.requiredMapLink",
                        "Google Maps link is required"
                      ),
                    })}
                  />

                  <p className="text-xs text-muted-foreground dark:text-gray-400 rtl:text-right">
                    {t(
                      "owner.form.mapsLinkHint",
                      "You can find this link by sharing the location from Google Maps."
                    )}
                  </p>

                  {errors.googleMapsLink && (
                    <p className="text-sm text-destructive rtl:text-right">
                      {errors.googleMapsLink.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Category */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="category"
                      className="rtl:text-right block dark:text-gray-300"
                    >
                      {t("owner.form.label.category", "Category *")}
                    </Label>
                    <Input
                      id="category"
                      placeholder={t("owner.form.placeholder.category")}
                      className="rtl:text-right dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      {...register("category", {
                        required: t(
                          "owner.validation.requiredCategory",
                          "Category is required"
                        ),
                      })}
                    />
                    {errors.category && (
                      <p className="text-sm text-destructive rtl:text-right">
                        {errors.category.message}
                      </p>
                    )}
                  </div>

                  {/* Price Level */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="priceLevel"
                      className="rtl:text-right block dark:text-gray-300"
                    >
                      {t("owner.form.label.priceLevel", "Price Level (1-4) *")}
                    </Label>
                    <Input
                      id="priceLevel"
                      type="number"
                      min="1"
                      max="4"
                      className="rtl:text-right dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      {...register("priceLevel", {
                        required: t(
                          "owner.validation.requiredPriceLevel",
                          "Price Level is required"
                        ),
                        valueAsNumber: true,
                        min: {
                          value: 1,
                          message: t("owner.validation.priceLevelMin", "Min 1"),
                        },
                        max: {
                          value: 4,
                          message: t("owner.validation.priceLevelMax", "Max 4"),
                        },
                      })}
                    />
                    {errors.priceLevel && (
                      <p className="text-sm text-destructive rtl:text-right">
                        {errors.priceLevel.message}
                      </p>
                    )}
                  </div>

                  {/* Phone (Optional) */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="phone"
                      className="rtl:text-right block dark:text-gray-300"
                    >
                      {t("owner.form.label.phone", "Phone")}
                    </Label>
                    <Input
                      id="phone"
                      placeholder={t(
                        "owner.form.placeholder.phone",
                        "Enter phone number"
                      )}
                      className="rtl:text-right dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      {...register("phone")}
                    />
                  </div>
                </div>

                {/* Website (Optional) */}
                <div className="space-y-2">
                  <Label
                    htmlFor="website"
                    className="rtl:text-right block dark:text-gray-300"
                  >
                    {t("owner.form.label.website", "Website")}
                  </Label>
                  <Input
                    id="website"
                    type="url"
                    placeholder={t(
                      "owner.form.placeholder.website",
                      "Enter website URL"
                    )}
                    className="rtl:text-right dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    {...register("website")}
                  />
                </div>

                <div
                  className={`flex gap-4 pt-4 ${
                    isArabic ? "justify-start" : "justify-end"
                  }`}
                >
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/dashboard")}
                    disabled={isLoading}
                    className="dark:text-white dark:hover:bg-gray-700"
                  >
                    {t("common.cancel", "Cancel")}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-[#ef4343] hover:bg-[#ff7e7e]"
                  >
                    {isLoading ? (
                      <Loader2
                        className={`mr-2 h-4 w-4 animate-spin ${
                          isArabic ? "ml-2" : "mr-2"
                        }`}
                      />
                    ) : (
                      <>
                        {user?.role === "admin"
                          ? t("owner.form.submitAdmin")
                          : t("owner.form.submitOwner")}
                      </>
                    )}
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
