import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, MapPin, Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next"; // Import useTranslation

const LISTINGS_API_URL = "http://127.0.0.1:5000/api/listings";
const USERS_API_URL = "http://127.0.0.1:5000/api/users";

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

interface ListingsResponse {
  count: number;
  listings: Listing[];
}

interface UsersResponse {
  count: number;
  users: User[];
}

export default function Dashboard() {
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
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

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
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium dark:text-gray-300">
                  {t("dashboard.card.totalListings")}
                </CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          </div>

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
        </div>
      </div>

      <Footer />
    </div>
  );
}