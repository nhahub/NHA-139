/* eslint-disable @typescript-eslint/no-explicit-any */

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
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
import { Badge } from "@/components/ui/badge";
<<<<<<< HEAD
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
=======
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next"; // Import useTranslation
>>>>>>> 2a1bea2 (Update: translated UI + fixes)

const LISTINGS_API_URL = "http://127.0.0.1:5000/api/listings";

interface Place {
  _id: string;
  name: string;
  city: string;
  category: string[];
  priceLevel?: number;
  ratingsAverage?: number;
}

interface Listing {
  _id: string;
  place: Place;
  status: "pending" | "accepted" | "rejected";
  adminNote?: string;
}

export default function Dashboard() {
<<<<<<< HEAD
  const { user, token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: listings = [], isLoading } = useQuery<Listing[]>({
    queryKey: ["dashboardListings", user?.role, token],
    queryFn: async () => {
      if (!token || !user) return [];

      const endpoint =
        user.role === "admin"
          ? `${LISTINGS_API_URL}/`
          : `${LISTINGS_API_URL}/my`;

      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch listings");

      const data = await response.json();
      return data.data || [];
    },
    enabled: !!token && !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (listingId: string) => {
      const endpoint =
        user?.role === "admin"
          ? `${LISTINGS_API_URL}/${listingId}`
          : `${LISTINGS_API_URL}/${listingId}/own`;

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete listing");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboardListings"] });
      toast({ title: "Success", description: "Listing deleted successfully" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Helpers
  const renderPriceLevel = (level?: number) =>
    level ? "$".repeat(level) : "N/A";

  const getStatusBadgeVariant = (status: string) => {
    if (status === "accepted") return "default";
    if (status === "rejected") return "destructive";
    return "secondary"; // pending
=======
  const { token, isAdmin } = useAuth();
  const { t } = useTranslation(); // Initialize translation hook

  const { data: listingsData, isLoading: isLoadingListings } =
    useQuery<ListingsResponse>({
      queryKey: ["allListings", token],
      queryFn: async () => {
        if (!token) throw new Error("No token");
        const response = await fetch(LISTINGS_API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error(t("common.failedLoad"));
        return response.json();
      },
      enabled: !!token && !!isAdmin,
    });

  const { data: usersData, isLoading: isLoadingUsers } =
    useQuery<UsersResponse>({
      queryKey: ["allUsers", token],
      queryFn: async () => {
        if (!token) throw new Error("No token");
        const response = await fetch(USERS_API_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) throw new Error(t("common.failedLoad"));
        const users = await response.json();
        return { users: users, count: users.length };
      },
      enabled: !!token && !!isAdmin,
    });

  const renderPriceLevel = (level?: number) => {
    if (!level || level === 0) return t("common.na");
    return "$".repeat(level);
>>>>>>> 2a1bea2 (Update: translated UI + fixes)
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
<<<<<<< HEAD
      <div className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold">Dashboard</h1>
              <p className="text-muted-foreground">
                {user?.role === "admin"
                  ? "System Overview & Management"
                  : "Manage your business listings"}
              </p>
            </div>
            <Link to="/owner/add-listing">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add New Place
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card>
=======

      <div className="flex-1 bg-muted/30 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold dark:text-white">
              {t("dashboard.title")}
            </h1>
            <p className="text-muted-foreground dark:text-gray-400">
              {t("dashboard.subtitle")}
            </p>
          </div>

          <div className="mb-8 grid gap-6 md:grid-cols-2">
            <Card className="dark:bg-gray-800">
>>>>>>> 2a1bea2 (Update: translated UI + fixes)
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium dark:text-gray-300">
                  {t("dashboard.card.totalListings")}
                </CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
<<<<<<< HEAD
                <div className="text-2xl font-bold">{listings.length}</div>
=======
                <div className="text-2xl font-bold dark:text-white">
                  {isLoadingListings
                    ? t("common.loading") // Translated
                    : listingsData?.count ?? listingsData?.listings.length ?? 0}
                </div>
                <p className="text-xs text-muted-foreground dark:text-gray-400">
                  {t("dashboard.card.totalListingsDesc")}
                </p>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium dark:text-gray-300">
                  {t("dashboard.card.users")}
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold dark:text-white">
                  {isLoadingUsers
                    ? t("common.loading") // Translated
                    : usersData?.count ?? usersData?.users.length ?? 0}
                </div>
                <p className="text-xs text-muted-foreground dark:text-gray-400">
                  {isLoadingUsers
                    ? t("common.loading") // Translated
                    : usersData?.users?.filter((u) => u.role === "admin")
                        .length ?? 0}{" "}
                  {t("dashboard.card.admins")}
                </p>
>>>>>>> 2a1bea2 (Update: translated UI + fixes)
              </CardContent>
            </Card>
          </div>

<<<<<<< HEAD
          <Card>
            <CardHeader>
              <CardTitle>Listings</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                </div>
              ) : listings.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <p>No listings found.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listings.map((listing) => (
                      <TableRow key={listing._id}>
                        <TableCell className="font-medium">
                          {listing.place?.name || "Unknown"}
                        </TableCell>
                        <TableCell>
                          {listing.place?.category?.join(", ") || "N/A"}
                        </TableCell>
                        <TableCell>{listing.place?.city}</TableCell>
                        <TableCell>
                          {renderPriceLevel(listing.place?.priceLevel)}
                        </TableCell>
                        <TableCell>
                          {listing.place?.ratingsAverage
                            ? `${listing.place.ratingsAverage} ★`
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusBadgeVariant(listing.status)}
                            className="capitalize"
                          >
                            {listing.status}
                          </Badge>
                          {listing.status === "rejected" &&
                            listing.adminNote && (
                              <div className="text-xs text-red-500 mt-1">
                                Reason: {listing.adminNote}
                              </div>
                            )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Link to={`/owner/edit-listing/${listing._id}`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
=======
          <Tabs defaultValue="listings" className="space-y-4">
            <TabsList className="dark:bg-gray-800">
              <TabsTrigger value="listings">{t("dashboard.listings")}</TabsTrigger>
              <TabsTrigger value="users">{t("dashboard.users")}</TabsTrigger>
            </TabsList>

            <TabsContent value="listings">
              <Card className="dark:bg-gray-800">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="dark:text-white">
                    {t("dashboard.management.listings")}
                  </CardTitle>
                  <Button className="bg-[#ef4343] hover:bg-[#ff7e7e]">
                    <Plus className="mr-2 h-4 w-4" />
                    {t("dashboard.addListing")}
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table className="dark:text-white">
                    <TableHeader>
                      <TableRow className="dark:border-gray-700">
                        <TableHead>{t("dashboard.table.name")}</TableHead>
                        <TableHead>{t("dashboard.table.category")}</TableHead>
                        <TableHead>{t("dashboard.table.location")}</TableHead>
                        <TableHead>{t("dashboard.table.priceLevel")}</TableHead>
                        <TableHead>{t("dashboard.table.rating")}</TableHead>
                        <TableHead>{t("dashboard.table.status")}</TableHead>
                        <TableHead>{t("dashboard.table.actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingListings ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center">
                            {t("common.loading")}
                          </TableCell>
                        </TableRow>
                      ) : (
                        listingsData?.listings.map((listing) => (
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
                              <Badge
                                className="capitalize"
                                variant={
                                  listing.status === "accepted"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {listing.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                {t("common.edit")}
>>>>>>> 2a1bea2 (Update: translated UI + fixes)
                              </Button>
                            </Link>

<<<<<<< HEAD
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Listing
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure? This action cannot be undone.
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
=======
            <TabsContent value="users">
              <Card className="dark:bg-gray-800">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="dark:text-white">
                    {t("dashboard.management.users")}
                  </CardTitle>
                  <Button className="bg-[#ef4343] hover:bg-[#ff7e7e]">
                    <Plus className="mr-2 h-4 w-4" />
                    {t("dashboard.management.addUser")}
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table className="dark:text-white">
                    <TableHeader>
                      <TableRow className="dark:border-gray-700">
                        <TableHead>{t("dashboard.table.name")}</TableHead>
                        <TableHead>{t("dashboard.table.email")}</TableHead>
                        <TableHead>{t("dashboard.table.role")}</TableHead>
                        <TableHead>{t("dashboard.table.actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoadingUsers ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center">
                            {t("common.loading")}
                          </TableCell>
                        </TableRow>
                      ) : (
                        usersData?.users.map((user) => (
                          <TableRow key={user._id} className="dark:border-gray-700">
                            <TableCell className="font-medium">
                              {user.name}
                            </TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  user.role === "admin"
                                    ? "default"
                                    : "secondary"
                                }
                                className="capitalize"
                              >
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                {t("common.edit")}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
>>>>>>> 2a1bea2 (Update: translated UI + fixes)
        </div>
      </div>
      <Footer />
    </div>
  );
}