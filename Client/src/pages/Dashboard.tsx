/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Edit,
  Trash2,
  MapPin,
  Users,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth, User as AuthUser } from "@/contexts/AuthContext";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const LISTINGS_API_URL = "http://127.0.0.1:5000/api/listings";
const USERS_API_URL = "http://127.0.0.1:5000/api/users";

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

interface UsersResponse {
  data: AuthUser[];
  count: number;
}

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const { user, token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isArabic = i18n.language === "ar";
  const isAdmin = user?.role === "admin";
  const isOwner = user?.role === "owner";

  const [rejectNote, setRejectNote] = useState("");
  const [selectedListingId, setSelectedListingId] = useState<string | null>(
    null
  );
  const [editingUser, setEditingUser] = useState<AuthUser | null>(null);

  const { data: listings = [], isLoading: isLoadingListings } = useQuery<
    Listing[]
  >({
    queryKey: ["dashboardListings", user?.role, token],
    queryFn: async () => {
      if (!token || !user) return [];
      // Admin gets all, Owner gets 'my'
      const endpoint =
        user.role === "admin"
          ? `${LISTINGS_API_URL}/`
          : `${LISTINGS_API_URL}/my`;

      const response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(t("toast.deleteError.fetch"));

      const data = await response.json();
      return data.data || data.listings || [];
    },
    enabled: !!token && !!user,
  });

  // Fetching Users (Admin Only)
  const { data: usersData, isLoading: isLoadingUsers } =
    useQuery<UsersResponse>({
      queryKey: ["dashboardUsers", token],
      queryFn: async () => {
        if (!token || user?.role !== "admin") return { data: [], count: 0 };

        const response = await fetch(USERS_API_URL, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error(t("toast.fetchError.user"));

        const data = await response.json();
        return {
          data: data.data?.users || data.data || [],
          count: data.results || data.count || 0,
        };
      },
      enabled: !!token && user?.role === "admin",
    });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      note,
    }: {
      id: string;
      status: "accepted" | "rejected";
      note?: string;
    }) => {
      // PATCH /api/listings/:id/status
      const response = await fetch(`${LISTINGS_API_URL}/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status, adminNote: note }),
      });

      if (!response.ok) throw new Error("Failed to update status");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboardListings"] });
      toast({
        title: t("common.success"),
        description: "Listing status updated successfully",
      });
      setRejectNote("");
      setSelectedListingId(null);
    },
    onError: (error: any) => {
      toast({
        title: t("toast.error.title"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete Listing (Owner & Admin)
  const deleteListingMutation = useMutation({
    mutationFn: async (listingId: string) => {
      // Admin: DELETE /:id, Owner: DELETE /:id/own
      const endpoint =
        user?.role === "admin"
          ? `${LISTINGS_API_URL}/${listingId}`
          : `${LISTINGS_API_URL}/${listingId}/own`;

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(t("toast.deleteError.delete"));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboardListings"] });
      toast({
        title: t("common.success"),
        description: t("toast.deleteSuccess.desc"),
      });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      // PUT /api/users/:id
      const response = await fetch(`${USERS_API_URL}/${userData._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          role: userData.role,
        }),
      });

      if (!response.ok) throw new Error("Failed to update user");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboardUsers"] });
      setEditingUser(null);
      toast({
        title: t("common.success"),
        description: "User updated successfully",
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

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      // DELETE /api/users/:id
      const endpoint = `${USERS_API_URL}/${userId}`;
      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(t("toast.deleteError.userDelete"));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dashboardUsers"] });
      toast({
        title: t("common.success"),
        description: t("toast.deleteSuccess.user"),
      });
    },
  });

  // Helpers
  const renderPriceLevel = (level?: number) =>
    level ? "$".repeat(level) : t("common.na");

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-500 hover:bg-green-600 text-white";
      case "rejected":
        return "bg-red-500 hover:bg-red-600 text-white";
      default:
        return "bg-yellow-500 hover:bg-yellow-600 text-white";
    }
  };

  const renderListingsTable = () => (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="dark:text-white rtl:text-right">
          {t("dashboard.listingsTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoadingListings ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#ef4343]" />
          </div>
        ) : listings.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground dark:text-gray-400">
            {t("dashboard.noListings")}
          </div>
        ) : (
          <Table className="dark:text-gray-300" dir={isArabic ? "rtl" : "ltr"}>
            <TableHeader>
              <TableRow className="dark:border-gray-700">
                <TableHead className="rtl:text-right">
                  {t("dashboard.table.name")}
                </TableHead>
                <TableHead className="rtl:text-right">
                  {t("dashboard.table.category")}
                </TableHead>
                <TableHead className="rtl:text-right">
                  {t("dashboard.table.city")}
                </TableHead>
                <TableHead className="rtl:text-right">
                  {t("dashboard.table.price")}
                </TableHead>
                <TableHead className="rtl:text-right">
                  {t("dashboard.table.status")}
                </TableHead>
                <TableHead className="rtl:text-right">
                  {t("dashboard.table.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listings.map((listing) => (
                <TableRow key={listing._id} className="dark:border-gray-700">
                  <TableCell className="font-medium rtl:text-right">
                    {listing.place?.name || t("dashboard.unknown")}
                  </TableCell>
                  <TableCell className="rtl:text-right">
                    {listing.place?.category?.join(", ") || t("common.na")}
                  </TableCell>
                  <TableCell className="rtl:text-right">
                    {listing.place?.city}
                  </TableCell>
                  <TableCell className="rtl:text-right">
                    {renderPriceLevel(listing.place?.priceLevel)}
                  </TableCell>
                  <TableCell className="rtl:text-right">
                    <Badge
                      className={`capitalize ${getStatusBadgeClass(
                        listing.status
                      )}`}
                    >
                      {t(`dashboard.status.${listing.status}`)}
                    </Badge>
                    {/* Display Admin Note for Rejected Listings */}
                    {listing.status === "rejected" && listing.adminNote && (
                      <div className="flex items-start gap-1 text-xs text-red-500 mt-2 font-medium">
                        <AlertCircle className="h-3 w-3 mt-0.5" />
                        <span>
                          {t("dashboard.rejectionReason")}: {listing.adminNote}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="rtl:text-right">
                    <div className="flex items-center gap-2 rtl:justify-end">
                      {/* === ADMIN ACTIONS: Hide buttons if Accepted === */}
                      {isAdmin && listing.status !== "accepted" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-100"
                            onClick={() =>
                              updateStatusMutation.mutate({
                                id: listing._id,
                                status: "accepted",
                              })
                            }
                            title="Approve"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-100"
                                title="Reject"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Reject Listing</DialogTitle>
                                <DialogDescription>
                                  Reason for rejection (this will be visible to
                                  the owner).
                                </DialogDescription>
                              </DialogHeader>
                              <div className="py-4">
                                <Label>Admin Note</Label>
                                <Textarea
                                  placeholder="Missing information, etc..."
                                  value={rejectNote}
                                  onChange={(e) =>
                                    setRejectNote(e.target.value)
                                  }
                                />
                              </div>
                              <DialogFooter>
                                <Button
                                  variant="destructive"
                                  onClick={() =>
                                    updateStatusMutation.mutate({
                                      id: listing._id,
                                      status: "rejected",
                                      note: rejectNote,
                                    })
                                  }
                                >
                                  Reject
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </>
                      )}

                      {/* === OWNER/SHARED ACTIONS: Edit visible for Accepted OR Rejected === */}
                      {(isAdmin ||
                        (isOwner &&
                          (listing.status === "accepted" ||
                            listing.status === "rejected"))) && (
                        <>
                          <Link to={`/owner/edit-listing/${listing._id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              title={
                                listing.status === "rejected"
                                  ? "Fix & Resubmit"
                                  : "Edit"
                              }
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>

                          {/* Delete is always allowed for own listings */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  {t("dashboard.deleteListingTitle")}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t("dashboard.deleteListingDesc")}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>
                                  {t("common.cancel")}
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-white"
                                  onClick={() =>
                                    deleteListingMutation.mutate(listing._id)
                                  }
                                >
                                  {t("common.delete")}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );

  // --- USERS TABLE RENDER ---
  const renderUsersTable = () => (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="dark:text-white rtl:text-right">
          {t("dashboard.management.users")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoadingUsers ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#ef4343]" />
          </div>
        ) : (usersData?.data || []).length === 0 ? (
          <div className="py-8 text-center text-muted-foreground dark:text-gray-400">
            {t("dashboard.noUsers")}
          </div>
        ) : (
          <Table className="dark:text-gray-300" dir={isArabic ? "rtl" : "ltr"}>
            <TableHeader>
              <TableRow>
                <TableHead className="rtl:text-right">
                  {t("dashboard.table.name")}
                </TableHead>
                <TableHead className="rtl:text-right">
                  {t("dashboard.table.email")}
                </TableHead>
                <TableHead className="rtl:text-right">
                  {t("dashboard.table.role")}
                </TableHead>
                <TableHead className="rtl:text-right">
                  {t("dashboard.table.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(usersData?.data || []).map((userItem) => (
                <TableRow key={userItem._id}>
                  <TableCell className="font-medium rtl:text-right">
                    {userItem.name || userItem.email?.split("@")[0]}
                  </TableCell>
                  <TableCell className="rtl:text-right">
                    {userItem.email}
                  </TableCell>
                  <TableCell className="rtl:text-right">
                    <Badge
                      variant={
                        userItem.role === "admin" ? "default" : "secondary"
                      }
                      className="capitalize"
                    >
                      {userItem.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="rtl:text-right">
                    <div className="flex items-center gap-2 rtl:justify-end">
                      {/* Edit User Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingUser(userItem)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      {/* Delete User Button */}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500"
                            disabled={userItem._id === user?._id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              {t("dashboard.deleteUserTitle")}
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              {t("dashboard.deleteUserDesc", {
                                name: userItem.name,
                              })}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>
                              {t("common.cancel")}
                            </AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-white"
                              onClick={() =>
                                deleteUserMutation.mutate(userItem._id)
                              }
                              disabled={userItem._id === user?._id}
                            >
                              {t("common.delete")}
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

      {/* Edit User Dialog */}
      <Dialog
        open={!!editingUser}
        onOpenChange={(open) => !open && setEditingUser(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={editingUser.name}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  value={editingUser.email}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, email: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Role</Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(val: any) =>
                    setEditingUser({ ...editingUser, role: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button onClick={() => updateUserMutation.mutate(editingUser)}>
                  Save Changes
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1 bg-muted/30 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* HEADER */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold dark:text-white">
                {t("dashboard.title")}
              </h1>
              <p className="text-muted-foreground dark:text-gray-400">
                {isAdmin
                  ? t("dashboard.subtitle.admin")
                  : t("dashboard.subtitle.owner")}
              </p>
            </div>
            {(isAdmin || isOwner) && (
              <Link to="/owner/add-listing">
                <Button className="bg-[#ef4343] hover:bg-[#ff7e7e]">
                  <Plus className="mr-2 h-4 w-4 rtl:ml-2 rtl:mr-0" />
                  {t("dashboard.addNewPlace")}
                </Button>
              </Link>
            )}
          </div>

          {/* ADMIN STATS */}
          {isAdmin && (
            <div className="grid gap-6 md:grid-cols-3 mb-8">
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium dark:text-gray-300">
                    {t("dashboard.card.totalListings")}
                  </CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold dark:text-white">
                    {isLoadingListings ? "..." : listings.length}
                  </div>
                </CardContent>
              </Card>
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium dark:text-gray-300">
                    {t("dashboard.card.users")}
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold dark:text-white">
                    {isLoadingUsers ? "..." : usersData?.count || 0}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* MAIN CONTENT */}
          {isAdmin ? (
            <Tabs defaultValue="listings" className="space-y-4">
              <TabsList>
                <TabsTrigger value="listings">
                  {t("dashboard.listings")}
                </TabsTrigger>
                <TabsTrigger value="users">{t("dashboard.users")}</TabsTrigger>
              </TabsList>
              <TabsContent value="listings">
                {renderListingsTable()}
              </TabsContent>
              <TabsContent value="users">{renderUsersTable()}</TabsContent>
            </Tabs>
          ) : (
            renderListingsTable()
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
