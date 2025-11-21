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
  place: string;
  title: string;
  description: string;
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

  const onSubmit = async (data: AddListingFormData) => {
    setIsLoading(true);

    if (!token) {
      toast({
        title: t("toast.error.title"), // Translated
        description: t("toast.addListingError.login"), // Translated
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${LISTINGS_API_URL}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          place: data.place,
          title: data.title,
          description: data.description,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t("toast.addListingError.failed")); // Translated error
      }

      toast({
        title: t("common.success"), // Translated
        description: t("toast.addListingSuccess.desc"), // Translated
      });
      navigate("/owner/my-listings");
    } catch (error: any) {
      toast({
        title: t("toast.error.title"), // Translated
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
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold dark:text-white">{t("owner.addNew")}</h1>
            <p className="text-muted-foreground dark:text-gray-400">
              {t("owner.addListingSubtitle")} {/* Translated */}
            </p>
          </div>

          {/* Form Card */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">{t("owner.form.cardTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Place ID Input */}
                <div className="space-y-2">
                  <Label htmlFor="place" className="dark:text-gray-300">
                    {t("owner.form.label.placeId")}
                  </Label>
                  <Input
                    id="place"
                    placeholder={t("owner.form.placeholder.placeId")}
                    {...register("place", {
                      required: t("owner.validation.requiredPlaceId"),
                    })}
                    className="dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                  />
                  {errors.place && (
                    <p className="text-sm text-destructive">
                      {errors.place.message}
                    </p>
                  )}
                </div>

                {/* Title Input */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="dark:text-gray-300">
                    {t("owner.form.label.title")}
                  </Label>
                  <Input
                    id="title"
                    placeholder={t("owner.form.placeholder.title")}
                    {...register("title", { required: t("owner.validation.requiredTitle") })}
                    className="dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                {/* Description Textarea */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="dark:text-gray-300">
                    {t("owner.form.label.description")}
                  </Label>
                  <Textarea
                    id="description"
                    rows={4}
                    placeholder={t("owner.form.placeholder.description")}
                    {...register("description", {
                      required: t("owner.validation.requiredDescription"),
                    })}
                    className="dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-4">
                  <Button type="submit" disabled={isLoading} className="bg-[#ef4343] hover:bg-[#ff7e7e]">
                    {isLoading ? t("common.loading") : t("common.submit")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/owner/my-listings")}
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