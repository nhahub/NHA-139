import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Mail, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useTranslation } from "react-i18next"; // Import useTranslation

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function Contact() {
  const { t } = useTranslation(); // Initialize translation hook
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactForm>();

  const onSubmit = (data: ContactForm) => {
    console.log("Contact form:", data);
    // Use translated success message for the toast
    toast.success(t("toast.contactSuccess")); 
    reset();
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      {/* Page Header */}
      <div className="border-b bg-muted/30 dark:bg-gray-800 dark:border-gray-700">
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="mb-4 text-4xl font-bold dark:text-white">
            {t("contact.header.title")} {/* Translated */}
          </h1>
          <p className="text-lg text-muted-foreground dark:text-gray-300">
            {t("contact.header.subtitle")} {/* Translated */}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 py-16">
        <div className="container mx-auto px-4">
          {/* Contact Cards */}
          <div className="mb-16 grid gap-6 md:grid-cols-3">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="pt-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <MapPin className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold dark:text-white">
                  {t("contact.card.addressTitle")} {/* Translated */}
                </h3>
                <p className="text-sm text-muted-foreground dark:text-gray-400">
                  4517 Washington Ave.<br />
                  Chester, Kentucky 39495
                </p>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="pt-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Phone className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold dark:text-white">
                  {t("contact.card.callTitle")} {/* Translated */}
                </h3>
                <p className="text-sm text-muted-foreground dark:text-gray-400">
                  Telephone: (603) 555-0123<br />
                  Mobile: (316) 555-0116
                </p>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="pt-6 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Mail className="h-7 w-7 text-primary" />
                </div>
                <h3 className="mb-2 font-semibold dark:text-white">
                  {t("contact.card.emailTitle")} {/* Translated */}
                </h3>
                <p className="text-sm text-muted-foreground dark:text-gray-400">
                  hello@wheretogo.com<br />
                  support@wheretogo.com
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="mx-auto max-w-3xl">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="pt-6">
                <h2 className="mb-6 text-2xl font-bold dark:text-white">
                  {t("contact.form.title")} {/* Translated */}
                </h2>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Name */}
                    <div>
                      <Label htmlFor="name">
                        {t("contact.form.label.name")} {/* Translated */}
                      </Label>
                      <Input
                        id="name"
                        {...register("name", { 
                          required: t("contact.form.validation.requiredName") // Translated validation 
                        })}
                        placeholder={t("contact.form.placeholder.name")} // Translated placeholder
                        className="mt-1.5 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-destructive">
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <Label htmlFor="email">
                        {t("contact.form.label.email")} {/* Translated */}
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        {...register("email", {
                          required: t("contact.form.validation.requiredEmail"), // Translated validation
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: t("contact.form.validation.invalidEmail"), // Translated validation
                          },
                        })}
                        placeholder={t("contact.form.placeholder.email")} // Translated placeholder
                        className="mt-1.5 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-destructive">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <Label htmlFor="subject">
                      {t("contact.form.label.subject")} {/* Translated */}
                    </Label>
                    <Input
                      id="subject"
                      {...register("subject", { required: t("contact.form.validation.requiredSubject") })} // Translated validation
                      placeholder={t("contact.form.placeholder.subject")} // Translated placeholder
                      className="mt-1.5 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                    />
                    {errors.subject && (
                      <p className="mt-1 text-sm text-destructive">
                        {errors.subject.message}
                      </p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <Label htmlFor="message">
                      {t("contact.form.label.message")} {/* Translated */}
                    </Label>
                    <Textarea
                      id="message"
                      {...register("message", { required: t("contact.form.validation.requiredMessage") })} // Translated validation
                      placeholder={t("contact.form.placeholder.message")} // Translated placeholder
                      rows={6}
                      className="mt-1.5 dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-destructive">
                        {errors.message.message}
                      </p>
                    )}
                  </div>

                  <Button type="submit" size="lg" className="w-full md:w-auto bg-[#ef4343] hover:bg-[#ff7e7e]">
                    <Send className="mr-2 h-4 w-4" />
                    {t("contact.form.sendButton")} {/* Translated */}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Map Placeholder */}
          <div className="mt-16">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-0">
                <div className="flex h-96 items-center justify-center bg-muted dark:bg-gray-900">
                  <div className="text-center">
                    <MapPin className="mx-auto mb-2 h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground dark:text-gray-400">
                      {t("map.placeholder")} {/* Translated */}
                    </p>
                    <p className="text-sm text-muted-foreground dark:text-gray-500">
                      {t("map.config")} {/* Translated */}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}