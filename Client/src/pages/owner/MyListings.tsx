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

interface Place {
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

interface Listing {
  _id: string;
  place: Place;
  status: "pending" | "accepted" | "rejected";
  adminNote?: string;
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
        throw new Error("Failed to fetch listings");
      }

      const data = await response.json();
      return data.data;
    },
    enabled: !!token,
  });

  const deleteMutation = useMutation({
    mutationFn: async (listingId: string) => {
      if (!token) throw new Error("Not authenticated");

      const response = await fetch(`${LISTINGS_API_URL}/${listingId}/own`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete listing");
      }
    },
    onSuccess: () => {
      // Dynamic updates
      queryClient.invalidateQueries({ queryKey: ["myListings"] });
      toast({
        title: "Success",
        description: "Listing deleted successfully",
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

  const renderPriceLevel = (level?: number) => {
    if (!level || level === 0) return "N/A";
    return "$".repeat(level);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <div className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold">
                {t("owner.myListings")}
              </h1>
              <p className="text-muted-foreground">
                Manage your business listings
              </p>
            </div>
            <Link to="/owner/add-listing">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t("owner.addNew")}
              </Button>
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Your Listings</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : listings.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <p>You haven't created any listings yet.</p>
                  <Link to="/owner/add-listing">
                    <Button className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Your First Listing
                    </Button>
                  </Link>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Price Level</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listings.map((listing) => (
                      <TableRow key={listing._id}>
                        <TableCell className="font-medium">
                          {listing.place?.name || "Unnamed Place"}
                        </TableCell>
                        <TableCell>
                          {listing.place?.category?.join(", ") || "N/A"}
                        </TableCell>
                        <TableCell>{listing.place?.city || "N/A"}</TableCell>
                        <TableCell>
                          {renderPriceLevel(listing.place?.priceLevel)}
                        </TableCell>
                        <TableCell>
                          {listing.place?.ratingsAverage
                            ? `${listing.place.ratingsAverage} ★`
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium border ${getStatusBadge(
                              listing.status
                            )}`}
                          >
                            {listing.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {listing.status === "accepted" && (
                              <Link to={`/owner/edit-listing/${listing._id}`}>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>
                            )}
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Listing
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this
                                    listing? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      deleteMutation.mutate(listing._id)
                                    }
                                  >
                                    Delete
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
