import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SignInFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function SignIn() {
  const { t } = useTranslation();
  const { signIn, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<SignInFormData>();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    const { error } = await signIn(data.email, data.password);
    setIsLoading(false);

    if (error) {
      toast({
        title: t('toast.error.title'), // Translated
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: t('toast.signInSuccess.title'), // Translated
        description: t('toast.signInSuccess.desc'), // Translated
      });
      navigate('/');
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      
      <div className="flex flex-1 items-center justify-center bg-muted/30 px-4 py-12 dark:bg-gray-900">
        <Card className="w-full max-w-md dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold dark:text-white">{t('auth.signIn')}</CardTitle>
            <CardDescription className="dark:text-gray-400">
              {t('auth.noAccount')} <Link to="/signup" className="text-[#ef4343] hover:underline">{t('auth.signUp')}</Link>
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="dark:text-gray-300">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  {...register('email', {
                    required: t('auth.validation.requiredEmail'), // Translated validation
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: t('auth.validation.invalidEmail'), // Translated validation
                    },
                  })}
                  className="dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
              
              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password" className="dark:text-gray-300">{t('auth.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  {...register('password', {
                    required: t('auth.validation.requiredPassword'), // Translated validation
                    minLength: {
                      value: 6,
                      message: t('auth.validation.passwordMinLength'), // Translated validation
                    },
                  })}
                  className="dark:bg-gray-900 dark:border-gray-600 dark:text-white"
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>
              
              {/* Checkbox and Forgot Password Link */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" {...register('rememberMe')} />
                  <Label htmlFor="remember" className="text-sm cursor-pointer dark:text-gray-300">
                    {t('auth.rememberMe')}
                  </Label>
                </div>
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-[#ef4343] hover:underline"
                >
                  {t('auth.forgotPassword')}
                </Link>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button type="submit" className="w-full bg-[#ef4343] hover:bg-[#ff7e7e]" disabled={isLoading}>
                {isLoading ? t('common.loading') : t('auth.signIn')}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
}