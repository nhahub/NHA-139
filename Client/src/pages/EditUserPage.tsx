/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, X } from "lucide-react";

// نقطة نهاية API لإنشاء مستخدم جديد
const API_BASE_URL = import.meta.env.VITE_API_URL;
const USERS_API_URL = API_BASE_URL + "/api/users";

// واجهة لبيانات النموذج لإنشاء مستخدم (تتضمن كلمة المرور)
interface NewUserData {
  name: string;
  email: string;
  password?: string; // يجب أن يكون مطلوبًا لإنشاء مستخدم جديد
  role: "user" | "owner" | "admin";
}

export default function AddUserPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isArabic = i18n.language === "ar";

  // حالة النموذج
  const [formData, setFormData] = useState<NewUserData>({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  // معالج تغيير المدخلات
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  // معالج تغيير الصلاحية (الدور)
  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({ ...prev, role: value as NewUserData["role"] }));
  };

  // دالة إرسال لإنشاء مستخدم (Mutation)
  const createMutation = useMutation({
    mutationFn: async (data: NewUserData) => {
      if (!token) throw new Error(t("error.missingAuth"));

      const response = await fetch(`${USERS_API_URL}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // استخدام توكن المسؤول
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t("toast.addError.user"));
      }

      return response.json();
    },
    onSuccess: () => {
      // إبطال صلاحية استعلامات المستخدمين لتحديث القائمة في لوحة التحكم
      queryClient.invalidateQueries({ queryKey: ["dashboardUsers"] });

      toast({
        title: t("common.success"),
        description: t("toast.addSuccess.user"),
      });

      // العودة إلى لوحة التحكم
      navigate("/dashboard");
    },
    onError: (error: any) => {
      toast({
        title: t("toast.error.title"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // معالج إرسال النموذج
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // تأكد من وجود اسم وبريد وكلمة مرور
    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: t("toast.error.title"),
        description: t("error.missingFields"),
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(formData);
  };

  // عرض النموذج الرئيسي
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <div className="flex-1 bg-muted/30 dark:bg-gray-900 py-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6 dark:text-white rtl:text-right">
            {t("addUser.title")}
          </h1>

          <Card
            className="max-w-2xl mx-auto dark:bg-gray-800 dark:border-gray-700"
            dir={isArabic ? "rtl" : "ltr"}
          >
            <CardHeader>
              <CardTitle className="rtl:text-right dark:text-white">
                {t("addUser.subtitle")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* NAME Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="rtl:text-right block dark:text-gray-300"
                  >
                    {t("addUser.form.name")} *
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t("addUser.form.namePlaceholder")}
                    className="rtl:text-right dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>

                {/* EMAIL Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="rtl:text-right block dark:text-gray-300"
                  >
                    {t("addUser.form.email")} *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t("addUser.form.emailPlaceholder")}
                    className="rtl:text-right dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>

                {/* PASSWORD Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="rtl:text-right block dark:text-gray-300"
                  >
                    {t("addUser.form.password")} *
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={t("addUser.form.passwordPlaceholder")}
                    className="rtl:text-right dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>

                {/* ROLE Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="role"
                    className="rtl:text-right block dark:text-gray-300"
                  >
                    {t("addUser.form.role")}
                  </Label>
                  <Select
                    onValueChange={handleRoleChange}
                    value={formData.role}
                    disabled={createMutation.isPending}
                  >
                    <SelectTrigger className="w-full rtl:text-right dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                      <SelectValue placeholder={t("addUser.form.selectRole")} />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                      <SelectItem value="user">{t("roles.user")}</SelectItem>
                      <SelectItem value="owner">{t("roles.owner")}</SelectItem>
                      <SelectItem value="admin">{t("roles.admin")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Action Buttons */}
                <div
                  className={`flex gap-4 pt-4 ${
                    isArabic ? "justify-start" : "justify-end"
                  }`}
                >
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/dashboard")}
                    disabled={createMutation.isPending}
                    className="dark:text-white dark:hover:bg-gray-700"
                  >
                    <X className={`h-4 w-4 ${isArabic ? "ml-2" : "mr-2"}`} />
                    {t("common.cancel")}
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending}
                    className="bg-[#ef4343] hover:bg-[#ff7e7e]"
                  >
                    {createMutation.isPending ? (
                      <Loader2
                        className={`h-4 w-4 animate-spin ${
                          isArabic ? "ml-2" : "mr-2"
                        }`}
                      />
                    ) : (
                      <Plus
                        className={`h-4 w-4 ${isArabic ? "ml-2" : "mr-2"}`}
                      />
                    )}
                    {t("addUser.form.addButton")}
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
