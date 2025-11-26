/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
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

        if (user.role === "admin") {
          const response = await fetch(`${LISTINGS_API_URL}/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!response.ok) throw new Error("Failed to fetch listing");
          const json = await response.json();
          listingData = json.data;
        } else {
          const response = await fetch(`${LISTINGS_API_URL}/my`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!response.ok) throw new Error("Failed to fetch listings");
          const json = await response.json();
          listingData = json.data.find((l: any) => l._id === id);
        }

        if (!listingData) throw new Error("Listing not found");

        // Allow rejected listings to load so they can be edited.

        const place = listingData.place;
        setValue("name", place.name);
        setValue("city", place.city);
        setValue("address", place.address || "");
        setValue("category", place.category?.[0] || "");
        setValue("phone", place.phone || "");
        setValue("website", place.website || "");
        setValue("priceLevel", place.priceLevel);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        navigate(user.role === "admin" ? "/dashboard" : "/dashboard");
      } finally {
        setIsFetching(false);
      }
    };

    fetchListing();
  }, [id, token, user, setValue, navigate, toast]);

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
        throw new Error(result.message || "Failed to update listing");
      }

      if (user?.role === "admin") {
        toast({
          title: "Updated",
          description: "Listing updated successfully.",
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Resubmitted",
          description: "Your listing has been updated and is pending approval.",
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold">Edit Listing</h1>
            <p className="text-muted-foreground">
              {user?.role === "admin"
                ? "Update listing details"
                : "Edit place details (Requires Re-approval)"}
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
                      {...register("name", { required: "Required" })}
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
                      {...register("city", { required: "Required" })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    {...register("address", { required: "Required" })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="googleMapsLink">
                    Update Location (Optional)
                  </Label>
                  <Input
                    id="googleMapsLink"
                    placeholder="Paste new Google Maps link to change location..."
                    {...register("googleMapsLink")}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Input
                      id="category"
                      {...register("category", { required: "Required" })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priceLevel">Price Level (1-4) *</Label>
                    <Input
                      id="priceLevel"
                      type="number"
                      min="1"
                      max="4"
                      {...register("priceLevel", {
                        required: "Required",
                        min: 1,
                        max: 4,
                      })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" {...register("phone")} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" {...register("website")} />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/dashboard")}
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
