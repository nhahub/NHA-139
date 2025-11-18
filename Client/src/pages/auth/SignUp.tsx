import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";

interface SignUpFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  isOwner: boolean;
}

export default function SignUp() {
  const { t } = useTranslation();
  const { signUp, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpFormData>();
  const password = watch("password");

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  // Clean up object URL when component unmounts
  useEffect(() => {
    return () => {
      if (profilePreview) {
        URL.revokeObjectURL(profilePreview);
      }
    };
  }, [profilePreview]);

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please select a valid image file",
          variant: "destructive",
        });
        return;
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size must be less than 5MB",
          variant: "destructive",
        });
        return;
      }

      setProfilePicture(file);
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setProfilePreview(previewUrl);
    }
  };

  const removeProfilePicture = () => {
    setProfilePicture(null);
    if (profilePreview) {
      URL.revokeObjectURL(profilePreview);
      setProfilePreview(null);
    }
  };

  // Helper function to upload profile picture to your backend
  const uploadProfilePicture = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    
    const response = await fetch('http://127.0.0.1:5000/api/upload-profile-picture', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload profile picture');
    }
    
    const data = await response.json();
    return data.imageUrl; // Assuming your backend returns { imageUrl: string }
  };

  // Updated signUp function that handles profile picture
  const handleSignUpWithProfilePicture = async (
    email: string,
    password: string,
    fullName: string,
    role: string,
    profilePictureUrl?: string
  ) => {
    try {
      // Prepare the request body
      const requestBody: any = {
        name: fullName,
        email,
        password,
        role,
      };

      // Add profilePicture to request if it exists
      if (profilePictureUrl) {
        requestBody.profilePicture = profilePictureUrl;
      }

      const response = await fetch('http://127.0.0.1:5000/api/auth/signup', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return { error: new Error(data.message || "Signup failed") };
      }
      
      return { error: null };
    } catch (error) {
      return {
        error: error instanceof Error ? error : new Error("Sign up failed"),
      };
    }
  };

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    const role = data.isOwner ? "owner" : "user";
    
    try {
      let profilePictureUrl: string | undefined;

      // Upload profile picture if provided
      if (profilePicture) {
        try {
          profilePictureUrl = await uploadProfilePicture(profilePicture);
          console.log("Profile picture uploaded successfully:", profilePictureUrl);
        } catch (uploadError) {
          console.error("Failed to upload profile picture:", uploadError);
          // Continue with signup even if profile picture upload fails
          toast({
            title: "Note",
            description: "Profile picture upload failed, but account creation will continue",
            variant: "default",
          });
        }
      }

      // Call the updated signUp function with profile picture
      const { error } = await handleSignUpWithProfilePicture(
        data.email,
        data.password,
        data.fullName,
        role,
        profilePictureUrl
      );
      
      setIsLoading(false);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: profilePictureUrl 
            ? "Account created successfully with profile picture!" 
            : "Account created successfully! You can now sign in.",
        });
        navigate("/signin");
      }
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Something went wrong during sign up",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <div className="flex flex-1 items-center justify-center bg-muted/30 px-4 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              {t("auth.signUp")}
            </CardTitle>
            <CardDescription>
              {t("auth.hasAccount")}{" "}
              <Link to="/signin" className="text-primary hover:underline">
                {t("auth.signIn")}
              </Link>
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {/* Profile Picture Upload Section */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full bg-muted border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden">
                    {profilePreview ? (
                      <img
                        src={profilePreview}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-muted-foreground text-2xl">
                        👤
                      </div>
                    )}
                  </div>
                  
                  {profilePreview && (
                    <button
                      type="button"
                      onClick={removeProfilePicture}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full text-xs flex items-center justify-center hover:bg-destructive/90"
                    >
                      ×
                    </button>
                  )}
                </div>

                <div className="space-y-2 text-center">
                  <Label 
                    htmlFor="profilePicture" 
                    className="cursor-pointer text-primary hover:underline text-sm"
                  >
                    Upload Photo
                  </Label>
                  <Input
                    id="profilePicture"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePictureChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, JPEG up to 5MB (optional)
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">{t("auth.fullName")}</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  {...register("fullName", {
                    required: "Full name is required",
                    minLength: {
                      value: 2,
                      message: "Name must be at least 2 characters",
                    },
                  })}
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive">
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  {t("auth.confirmPassword")}
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="isOwner" {...register("isOwner")} />
                <Label
                  htmlFor="isOwner"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Sign up as an Owner
                </Label>
              </div>
            </CardContent>

            <CardFooter>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t("common.loading") : t("auth.signUp")}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      <Footer />
    </div>
  );
}