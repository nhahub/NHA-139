/* eslint-disable @typescript-eslint/no-explicit-any */

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const LISTINGS_API_URL = "http://127.0.0.1:5000/api/listings";

interface Listing {
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
  status: "pending" | "accepted" | "rejected";
}

export default function MyListings() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: listings = [], isLoading } = useQuery<Listing[]>({
    queryKey: ["myListings", token],
    queryFn: async () => {
      if (!token) return [];

      const response = await fetch(`${LISTINGS_API_URL}/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(t("toast.deleteError.fetch")); // Translated error
      }

      const data = await response.json();
      return data.listings;
    },
    enabled: !!token,
  });

  const deleteMutation = useMutation({
    mutationFn: async (listingId: string) => {
      if (!token) throw new Error(t("common.notAuthenticated")); // Translated error

      const response = await fetch(`${LISTINGS_API_URL}/${listingId}/own`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(t("toast.deleteError.delete")); // Translated error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myListings"] });
      toast({
        title: t("common.success"), // Translated
        description: t("toast.deleteSuccess.desc"), // Translated
      });
    },
    onError: (error: any) => {
      toast({
        title: t("toast.error.title"), // Translated
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const renderPriceLevel = (level?: number) => {
    if (!level || level === 0) return t("common.na"); // Translated
    return "$".repeat(level);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <div className="flex-1 bg-muted/30 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold dark:text-white">
                {t("owner.myListings")}
              </h1>
              <p className="text-muted-foreground dark:text-gray-400">
                {t("owner.subtitle")} {/* Translated */}
              </p>
            </div>
            <Link to="/owner/add-listing">
              <Button className="bg-[#ef4343] hover:bg-[#ff7e7e]">
                <Plus className="mr-2 h-4 w-4" />
                {t("owner.addNew")}
              </Button>
            </Link>
          </div>

          {/* Listings Card */}
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="dark:text-white">
                {t("owner.cardTitle")} {/* Translated */}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#ef4343] border-t-transparent"></div>
                </div>
              ) : listings.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <p className="dark:text-gray-400">
                    {t("owner.noListings")} {/* Translated */}
                  </p>
                  <Link to="/owner/add-listing">
                    <Button className="mt-4 bg-[#ef4343] hover:bg-[#ff7e7e]">
                      <Plus className="mr-2 h-4 w-4" />
                      {t("owner.createFirst")} {/* Translated */}
                    </Button>
                  </Link>
                </div>
              ) : (
                <Table className="dark:text-white">
                  <TableHeader>
                    <TableRow className="dark:border-gray-700">
                      <TableHead>{t("dashboard.table.name")}</TableHead>
                      <TableHead>{t("table.head.category")}</TableHead> {/* Translated */}
                      <TableHead>{t("table.head.location")}</TableHead> {/* Translated */}
                      <TableHead>{t("table.head.priceLevel")}</TableHead> {/* Translated */}
                      <TableHead>{t("table.head.rating")}</TableHead> {/* Translated */}
                      <TableHead>{t("table.head.status")}</TableHead> {/* Translated */}
                      <TableHead>{t("table.head.actions")}</TableHead> {/* Translated */}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listings.map((listing) => (
                      <TableRow key={listing._id} className="dark:border-gray-700">
                        <TableCell className="font-medium">
                          {listing.name}
                        </TableCell>
                        <TableCell>{listing.category.join(", ")}</TableCell>
                        <TableCell>{listing.city}</TableCell>
                        <TableCell>
                          {renderPriceLevel(listing.priceLevel)}
                        </TableCell>
                        <TableCell>
                          {listing.ratingsAverage
                            ? `${listing.ratingsAverage} ★`
                            : t("common.na")}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs capitalize ${
                              listing.status === "accepted"
                                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                                : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                            }`}
                          >
                            {listing.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {/* Edit Button */}
                            <Link to={`/owner/edit-listing/${listing._id}`}>
                              <Button variant="ghost" size="sm" className="dark:text-gray-300 hover:bg-gray-700">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            {/* Delete Dialog Trigger */}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 dark:hover:bg-red-900/50">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="dark:bg-gray-800 dark:border-gray-700">
                                <AlertDialogHeader>
                                  <AlertDialogTitle className="dark:text-white">
                                    {t("dialog.delete.title")} {/* Translated */}
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="dark:text-gray-400">
                                    {t("dialog.delete.desc")} {/* Translated */}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel className="dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600">
                                    {t("common.cancel")}
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-destructive hover:bg-destructive/90"
                                    onClick={() =>
                                      deleteMutation.mutate(listing._id)
                                    }
                                  >
                                    {t("common.delete")} {/* Translated */}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}