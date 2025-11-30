/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
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
import { Loader2, X, Upload } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL;
const AUTH_API_URL = API_BASE_URL + "/api/auth";

interface SignUpFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  isOwner: boolean;
}

export default function SignUp() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<SignUpFormData>({
    defaultValues: {
      isOwner: false,
    },
  });

  const password = watch("password");

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    return () => {
      if (profilePreview) URL.revokeObjectURL(profilePreview);
    };
  }, [profilePreview]);

  const handleProfilePictureChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast({
          title: t("toast.error.title"), // Translated
          description: t("toast.uploadError.invalidImage"), // Translated
          variant: "destructive",
        });
        return;
      }
      // Check size (e.g. 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: t("toast.error.title"), // Translated
          description: t("toast.uploadError.size"), // Translated
          variant: "destructive",
        });
        return;
      }

      setProfilePicture(file);
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

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);

    const role = data.isOwner ? "owner" : "user";

    try {
      const formData = new FormData();
      formData.append("name", data.fullName);
      formData.append("email", data.email);
      formData.append("password", data.password);
      formData.append("role", role);

      if (profilePicture) {
        formData.append("avatar", profilePicture);
      }

      const response = await fetch(`${AUTH_API_URL}/signup`, {
        method: "POST",
        body: formData,
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || t("toast.error.signUpFailed")); // Translated error
      }

      toast({
        title: t("common.success"), // Translated
        description: t("toast.signUpSuccess.desc"), // Translated
      });
      navigate("/signin");
    } catch (error: any) {
      console.error("Signup Error:", error);
      toast({
        title: t("toast.error.title"), // Translated
        description: error.message || t("toast.error.somethingWrong"), // Translated
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <div className="flex flex-1 items-center justify-center bg-muted/30 px-4 py-12 dark:bg-gray-900">
        <Card className="w-full max-w-md dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold dark:text-white">
              {t("auth.signUp")}
            </CardTitle>
            <CardDescription className="dark:text-gray-400">
              {t("auth.hasAccount")}{" "}
              <Link to="/signin" className="text-[#ef4343] hover:underline">
                {t("auth.signIn")}
              </Link>
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {/* Profile Picture Upload Section */}
              <div className="flex flex-col items-center space-y-4 mb-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full bg-muted border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden relative dark:bg-gray-700">
                    {profilePreview ? (
                      <img
                        src={profilePreview}
                        alt={t("upload.uploadPhoto")} // Fallback translated alt text
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Upload className="h-8 w-8 text-muted-foreground/50 dark:text-gray-500" />
                    )}
                  </div>

                  {profilePreview && (
                    <button
                      type="button"
                      onClick={removeProfilePicture}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90 shadow-sm transition-transform hover:scale-110"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                <div className="space-y-1 text-center">
                  <Label
                    htmlFor="profilePicture"
                    className="cursor-pointer text-[#ef4343] hover:text-[#ff7e7e] hover:underline text-sm font-medium transition-colors"
                  >
                    {profilePreview
                      ? t("upload.changePhoto")
                      : t("upload.uploadPhoto")}
                  </Label>
                  <Input
                    id="profilePicture"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleProfilePictureChange}
                    disabled={isLoading}
                  />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide dark:text-gray-500">
                    {t("upload.optionalMax")}
                  </p>
                </div>
              </div>
              {/* Full Name Input */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="dark:text-gray-300">
                  {t("auth.fullName")}
                </Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  {...register("fullName", {
                    required: t("auth.validation.requiredFullName"), // Translated validation
                    minLength: {
                      value: 2,
                      message: t("auth.validation.fullNameMinLength"), // Translated validation
                    },
                  })}
                  className="dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive">
                    {errors.fullName.message}
                  </p>
                )}
              </div>
              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="dark:text-gray-300">
                  {t("auth.email")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  {...register("email", {
                    required: t("auth.validation.requiredEmail"), // Reused/Translated validation
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: t("auth.validation.invalidEmail"), // Reused/Translated validation
                    },
                  })}
                  className="dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password" className="dark:text-gray-300">
                  {t("auth.password")}
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password", {
                    required: t("auth.validation.requiredPassword"), // Reused/Translated validation
                    minLength: {
                      value: 6,
                      message: t("auth.validation.passwordMinLength"), // Reused/Translated validation
                    },
                  })}
                  className="dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                />
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>
              {/* Confirm Password Input */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="dark:text-gray-300">
                  {t("auth.confirmPassword")}
                </Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...register("confirmPassword", {
                    required: t("auth.validation.requiredConfirmPassword"), // Translated validation
                    validate: (value) =>
                      value === password ||
                      t("auth.validation.passwordMismatch"), // Translated validation
                  })}
                  className="dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
              {/* Sign up as Owner Checkbox */}
              <div className="flex items-center space-x-2">
                <Controller
                  name="isOwner"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="isOwner"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <Label
                  htmlFor="isOwner"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer dark:text-gray-300"
                >
                  {t("auth.label.isOwner")}
                </Label>
              </div>
            </CardContent>

            <CardFooter>
              <Button
                type="submit"
                className="w-full bg-[#ef4343] hover:bg-[#ff7e7e]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("common.loading")}
                  </>
                ) : (
                  t("auth.signUp")
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
