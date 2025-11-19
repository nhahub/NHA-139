import { User } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, User as UserIcon, Heart, LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";

interface UserAvatarProps {
  user: User;
}

export function UserAvatar({ user }: UserAvatarProps) {
  const { isAdmin, isOwner, signOut } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const getInitials = (name: string) => {
    if (!name) return "??";
    const parts = name.split(" ");
    if (parts.length >= 2 && parts[0] && parts[1]) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getDashboardPath = () => {
    if (isAdmin) return "/dashboard";
    if (isOwner) return "/owner/my-listings";
    return "/profile";
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/signin");
  };

  const fullName = user.name || user.email?.split("@")[0] || "User";
  const avatarUrl = user.profilePicture;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-full"
        aria-label={`User menu for ${fullName}`}
        aria-haspopup="true"
      >
        <Avatar className="h-10 w-10 cursor-pointer ring-2 ring-border hover:ring-primary transition-all">
          {avatarUrl ? (
            <AvatarImage
              src={avatarUrl}
              alt={fullName}
              className="object-cover h-full w-full"
            />
          ) : null}
          <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
            {getInitials(fullName)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-popover z-50">
        <DropdownMenuLabel className="flex flex-col items-center py-4">
          <Avatar className="h-16 w-16 mb-3">
            {avatarUrl ? (
              <AvatarImage
                src={avatarUrl}
                alt={fullName}
                className="object-cover h-full w-full"
              />
            ) : null}
            <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
              {getInitials(fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <p className="font-semibold text-foreground">{fullName}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {(isAdmin || isOwner) && (
          <DropdownMenuItem
            onClick={() => navigate(getDashboardPath())}
            className="cursor-pointer"
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            {t("nav.dashboard")}
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onClick={() => navigate("/profile")}
          className="cursor-pointer"
        >
          <UserIcon className="mr-2 h-4 w-4" />
          {t("nav.profile")}
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleSignOut}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          {t("nav.signout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
