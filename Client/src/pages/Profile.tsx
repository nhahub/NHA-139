/* eslint-disable @typescript-eslint/no-explicit-any */

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Heart, History, MapPin, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
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
import img from "../assets/Cardimg.png";

const USERS_API_URL = "http://127.0.0.1:5000/api/users";

interface FavoritePlace {
  _id: string;
  name: string;
}

interface HistoryItem {
  _id: string;
  name: string;
}

export default function Profile() {
  const { user, isAdmin, isOwner, token } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: favorites = [], isLoading: isLoadingFavorites } = useQuery<
    FavoritePlace[]
  >({
    queryKey: ["profileFavorites", token],
    queryFn: async () => {
      if (!token) return [];

      const favListResponse = await fetch(`${USERS_API_URL}/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!favListResponse.ok)
        throw new Error("Failed to fetch favorites list");

      const favListData = await favListResponse.json();
      return favListData.data;
    },
    enabled: !!token,
  });

  const deleteFavoriteMutation = useMutation({
    mutationFn: async (placeId: string) => {
      if (!token) throw new Error("Not authenticated");
      const response = await fetch(`${USERS_API_URL}/favorites/${placeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        let errorMessage = "Failed to remove favorite";
        try {
          const errData = await response.json();
          if (errData.message) errorMessage = errData.message;
        } catch (e) {
          // Use default error message if JSON parse fails
        }
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profileFavorites"] });
      queryClient.invalidateQueries({ queryKey: ["me", token] });
      toast({
        title: "Success",
        description: "Removed from favorites",
        variant: "default",
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

  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      if (!token) throw new Error("Not authenticated");
      const response = await fetch(`${USERS_API_URL}/history`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        let errorMessage = "Failed to clear history";
        try {
          const errData = await response.json();
          if (errData.message) errorMessage = errData.message;
        } catch (e) {
          // Use default error message
        }
        throw new Error(errorMessage);
      }
    },
    onSuccess: () => {
      // Invalidate both queries to refresh data from server
      queryClient.invalidateQueries({ queryKey: ["me", token] });
      queryClient.invalidateQueries({ queryKey: ["profileFavorites"] });

      toast({
        title: "Success",
        description: "History cleared successfully",
        variant: "default",
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

  const getInitials = (name: string) => {
    if (!name) return "??";
    const parts = name.split(" ");
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const fullName = user?.name || user?.email?.split("@")[0] || "User";
  const avatarUrl = user?.profilePicture;

  // Use user.history directly from AuthContext - this ensures multi-device sync
  const displayHistory = user?.history || [];

  // Enhanced image component with error handling
  const PlaceImage = ({
    src,
    alt,
    className,
    onClick,
  }: {
    src: string;
    alt: string;
    className?: string;
    onClick?: () => void;
  }) => {
    const [imgError, setImgError] = useState(false);

    return (
      <div className={className} onClick={onClick}>
        {!imgError ? (
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover cursor-pointer"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="h-full w-full bg-muted flex items-center justify-center">
            <MapPin className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
      </div>
    );
  };

  // Loading component
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-8">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      <span className="ml-2 text-muted-foreground">Loading...</span>
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <div className="flex-1 bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center md:flex-row md:items-start gap-6">
                <Avatar className="h-24 w-24 border-2 border-border">
                  {avatarUrl ? (
                    <AvatarImage
                      src={avatarUrl}
                      alt={fullName}
                      className="object-cover h-full w-full"
                    />
                  ) : null}
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
                    {getInitials(fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold mb-2">{fullName}</h1>
                  <p className="text-muted-foreground mb-3">{user?.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="favorites" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="favorites"
                className="flex items-center gap-2"
              >
                <Heart className="h-4 w-4" />
                {t("nav.favorites")}
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                {t("profile.history")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="favorites">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    {t("profile.myFavorites")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoadingFavorites ? (
                    <LoadingSpinner />
                  ) : favorites.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {favorites.map((item) => (
                        <Card key={item._id} className="overflow-hidden">
                          <div className="h-40 w-full overflow-hidden">
                            <img
                              src={img}
                              alt={item.name}
                              className="h-full w-full object-cover cursor-pointer transition-transform hover:scale-105"
                              onClick={() => navigate(`/listing/${item._id}`)}
                            />
                          </div>

                          <CardContent className="p-4">
                            <h3 className="font-semibold mb-2 truncate">
                              {item.name}
                            </h3>
                            <div className="mt-3 flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1"
                                onClick={() => navigate(`/listing/${item._id}`)}
                              >
                                <MapPin className="mr-1 h-3 w-3" />
                                {t("common.view")}
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-destructive hover:text-destructive"
                                    disabled={deleteFavoriteMutation.isPending}
                                  >
                                    {deleteFavoriteMutation.isPending ? (
                                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Remove Favorite?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to remove "
                                      {item.name}" from your favorites?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>
                                      Cancel
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      className="bg-destructive hover:bg-destructive/90"
                                      onClick={() =>
                                        deleteFavoriteMutation.mutate(item._id)
                                      }
                                      disabled={
                                        deleteFavoriteMutation.isPending
                                      }
                                    >
                                      {deleteFavoriteMutation.isPending
                                        ? "Removing..."
                                        : "Remove"}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      {t("profile.noFavorites")}
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader className="flex flex-row justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5" />
                    {t("profile.visitedHistory")}
                  </CardTitle>
                  {displayHistory.length > 0 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={clearHistoryMutation.isPending}
                        >
                          {clearHistoryMutation.isPending ? (
                            <div className="flex items-center gap-2">
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              Clearing...
                            </div>
                          ) : (
                            <>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Clear History
                            </>
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Clear All History?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete your entire visited history from all devices.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive hover:bg-destructive/90"
                            onClick={() => clearHistoryMutation.mutate()}
                            disabled={clearHistoryMutation.isPending}
                          >
                            {clearHistoryMutation.isPending
                              ? "Clearing..."
                              : "Yes, Clear History"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {displayHistory.map((item) => (
                      <Card key={item._id} className="overflow-hidden">
                        <div className="flex items-center p-4">
                          <div className="h-12 w-12 rounded-full overflow-hidden mr-4 flex-shrink-0">
                            <img
                              src={img}
                              alt={item.name}
                              className="h-full w-full object-cover"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">
                              {item.name}
                            </h3>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/listing/${item._id}`)}
                          >
                            View
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                  {displayHistory.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      {t("profile.noHistory")}
                    </p>
                  )}
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
