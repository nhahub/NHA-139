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
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AddListingFormData>();

  // Helper: Extract coordinates from Google Maps URL
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
          // Return [lng, lat] for GeoJSON
          return [parseFloat(match[2]), parseFloat(match[1])];
        }
      }

      if (url.includes("goo.gl") || url.includes("maps.app.goo.gl")) {
        return [29.9187, 31.2001];
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
        title: "Authentication Error",
        description: "You must be logged in to submit a listing.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      // 1. Prepare Coordinates (Default to Alexandria if extraction fails)
      let coordinates: [number, number] = [29.9187, 31.2001];

      if (data.googleMapsLink) {
        const extracted = extractCoordinatesFromGoogleMaps(data.googleMapsLink);
        if (extracted) coordinates = extracted;
      }

      const payload = {
        name: data.name,
        city: data.city,
        address: data.address,
        category: [data.category],
        phone: data.phone || undefined,
        website: data.website || undefined,
        priceLevel: Number(data.priceLevel),
        location: {
          type: "Point",
          coordinates: coordinates, // [longitude, latitude]
        },
      };

      // Admin -> POST / (adminCreateListing)
      // Owner -> POST /submit (createListing)
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

      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch (e) {
        console.error("Non-JSON response received:", responseText);
        throw new Error(
          `Server error (${response.status}): The server returned an invalid response.`
        );
      }

      if (!response.ok) {
        throw new Error(
          result.message || result.error || "Failed to create listing"
        );
      }

      toast({
        title: user?.role === "admin" ? "Listing Created" : "Listing Submitted",
        description:
          user?.role === "admin"
            ? "The listing has been created and approved."
            : "Your listing is now pending admin approval.",
      });

      navigate("/owner/my-listings");
    } catch (error: any) {
      console.error("Submission error:", error);
      toast({
        title: "Submission Failed",
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
      <div className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold">{t("owner.addNew")}</h1>
            <p className="text-muted-foreground">
              {user?.role === "admin"
                ? "Add a new verified place"
                : "Submit a new place for review"}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Place Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Place Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Santos Cafe"
                      {...register("name", {
                        required: "Place name is required",
                      })}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input
                      id="city"
                      defaultValue="Alexandria"
                      {...register("city", { required: "City is required" })}
                    />
                    {errors.city && (
                      <p className="text-sm text-destructive">
                        {errors.city.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    placeholder="Full street address"
                    {...register("address", {
                      required: "Address is required",
                    })}
                  />
                  {errors.address && (
                    <p className="text-sm text-destructive">
                      {errors.address.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="googleMapsLink">Google Maps Link *</Label>
                  <Input
                    id="googleMapsLink"
                    type="url"
                    placeholder="https://maps.google.com/..."
                    {...register("googleMapsLink", {
                      required: "Google Maps link is required",
                    })}
                  />
                  <p className="text-xs text-muted-foreground">
                    Paste a link from Google Maps to automatically set the
                    location coordinates.
                  </p>
                  {errors.googleMapsLink && (
                    <p className="text-sm text-destructive">
                      {errors.googleMapsLink.message}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Input
                      id="category"
                      placeholder="e.g., Cafe"
                      {...register("category", {
                        required: "Category is required",
                      })}
                    />
                    {errors.category && (
                      <p className="text-sm text-destructive">
                        {errors.category.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priceLevel">Price Level (1-4) *</Label>
                    <Input
                      id="priceLevel"
                      type="number"
                      min="1"
                      max="4"
                      {...register("priceLevel", {
                        required: "Price level is required",
                        min: { value: 1, message: "Min 1" },
                        max: { value: 4, message: "Max 4" },
                      })}
                    />
                    {errors.priceLevel && (
                      <p className="text-sm text-destructive">
                        {errors.priceLevel.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone (Optional)</Label>
                    <Input
                      id="phone"
                      placeholder="+20..."
                      {...register("phone")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website (Optional)</Label>
                    <Input
                      id="website"
                      type="url"
                      placeholder="https://..."
                      {...register("website")}
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading
                      ? "Processing..."
                      : user?.role === "admin"
                      ? "Create Listing"
                      : "Submit for Approval"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/owner/my-listings")}
                  >
                    Cancel
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
