'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, Phone, MapPin, Calendar } from 'lucide-react';

import { signUpSchema, type SignUpFormData } from '@/lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    setValue,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: 'onChange',
    defaultValues: {
      countryCode: '+91',
    },
  });

  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const errorData = await response.json();
      if (response.ok) {
        router.push('/auth/signin?message=Registration successful');
      } else if (errorData.message && errorData.message.toLowerCase().includes('already exists')) {
        setError('A user with this email already exists. Please sign in or use a different email.');
      } else {
        setError(errorData.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = async () => {
    if (currentStep === 1) {
      const isValid = await trigger(['email', 'password', 'confirmPassword'] as (keyof SignUpFormData)[]);
      const email = (document.getElementById('email') as HTMLInputElement)?.value;
      const password = (document.getElementById('password') as HTMLInputElement)?.value;
      const confirmPassword = (document.getElementById('confirmPassword') as HTMLInputElement)?.value;
      if (!isValid) return;
      if (password !== confirmPassword) {
        setError("Passwords don't match");
        return;
      }
      // Check if user already exists
      try {
        const res = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`);
        const result = await res.json();
        if (result.exists) {
          setError('A user with this email already exists. Please sign in or use a different email.');
          return;
        }
      } catch (error: unknown) {
        console.error('Error verifying email:', error);
        setError('Could not verify email. Please try again.');
        return;
      }
      setError(null);
      setCurrentStep(2);
    } else {
      const isValid = await trigger(['firstName', 'lastName', 'countryCode', 'phoneNumber', 'country', 'currentCity'] as (keyof SignUpFormData)[]);
      if (isValid) {
        setCurrentStep(2);
      }
    }
  };

  const prevStep = () => {
    setCurrentStep(1);
  };

  const handleUseMyLocation = async () => {
    if (!('geolocation' in navigator)) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }
    setLocationError(null);
    setIsLocating(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 300000,
        });
      });

      const { latitude, longitude } = position.coords;
      const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}&localityLanguage=en`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Failed to reverse geocode');
      }
      const data = await res.json();
      const detectedCountry: string = data.countryName || '';
      const detectedCity: string = data.city || data.locality || data.principalSubdivision || '';

      if (detectedCountry) setValue('country', detectedCountry, { shouldValidate: true, shouldDirty: true });
      if (detectedCity) setValue('currentCity', detectedCity, { shouldValidate: true, shouldDirty: true });

      if (!detectedCountry && !detectedCity) {
        setLocationError('Could not determine city or country from your location');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to access your location';
      setLocationError(message);
    } finally {
      setIsLocating(false);
    }
  };

  const handleGoogleSignUp = () => {
    signIn('google', { callbackUrl: '/home' });
  };

  return (
    <Card className="w-full max-w-lg mx-auto border border-gray-200 bg-white">
      <CardHeader className="text-center pb-8">
        <CardTitle className="text-3xl font-bold text-black">Create Account</CardTitle>
        <CardDescription className="text-gray-500 mt-2">
          Step {currentStep} of 2: {currentStep === 1 ? 'Account Details' : 'Personal Information'}
        </CardDescription>

        {/* Progress indicator */}
        <div className="flex items-center justify-center mt-4">
          <div className="flex space-x-2">
            <div className={`w-3 h-3 rounded-full ${currentStep >= 1 ? 'bg-black' : 'bg-gray-300'}`} />
            <div className={`w-3 h-3 rounded-full ${currentStep >= 2 ? 'bg-black' : 'bg-gray-300'}`} />
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-black">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10 h-12 border-gray-300 focus:border-black focus:ring-black transition-colors bg-white"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-black">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="pl-10 pr-12 h-12 border-gray-300 focus:border-black focus:ring-black transition-colors bg-white"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600 mt-1">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-black">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    className="pl-10 pr-12 h-12 border-gray-300 focus:border-black focus:ring-black transition-colors bg-white"
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600 mt-1">{errors.confirmPassword.message}</p>
                )}
              </div>

              {error && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-sm text-black text-center">{error}</p>
                </div>
              )}

              <Button
                type="button"
                onClick={nextStep}
                className="w-full h-12 bg-black hover:bg-gray-800 text-white font-medium transition-colors"
              >
                Next Step
              </Button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-black">
                    First Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="firstName"
                      placeholder="First name"
                      className="pl-10 h-12 border-gray-300 focus:border-black focus:ring-black transition-colors"
                      {...register('firstName')}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-sm text-red-600 mt-1">{errors.firstName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-black">
                    Last Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="lastName"
                      placeholder="Last name"
                      className="pl-10 h-12 border-gray-300 focus:border-black focus:ring-black transition-colors"
                      {...register('lastName')}
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-sm text-red-600 mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium text-black">
                  Phone Number
                </Label>
                <div className="flex space-x-3">
                  <div className="w-32">
                    <select
                      {...register('countryCode')}
                      className="w-full h-12 px-3 border border-gray-300 rounded-md focus:border-black focus:ring-black bg-white text-sm transition-colors"
                      defaultValue="+91"
                    >
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+86">🇨🇳 +86</option>
                      <option value="+81">🇯🇵 +81</option>
                      <option value="+82">🇰🇷 +82</option>
                      <option value="+33">🇫🇷 +33</option>
                      <option value="+49">🇩🇪 +49</option>
                      <option value="+39">🇮🇹 +39</option>
                      <option value="+34">🇪🇸 +34</option>
                      <option value="+7">🇷🇺 +7</option>
                      <option value="+55">🇧🇷 +55</option>
                      <option value="+61">🇦🇺 +61</option>
                      <option value="+27">🇿🇦 +27</option>
                    </select>
                  </div>
                  <div className="flex-1 relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="phone"
                      placeholder="Phone number"
                      className="pl-10 h-12 border-gray-300 focus:border-black focus:ring-black transition-colors"
                      {...register('phoneNumber')}
                    />
                  </div>
                </div>
                {(errors.countryCode || errors.phoneNumber) && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.countryCode?.message || errors.phoneNumber?.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="country" className="text-sm font-medium text-black">
                    Country
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleUseMyLocation}
                    disabled={isLocating}
                    className="text-xs border-gray-300 hover:bg-gray-50 text-black h-8 px-3"
                  >
                    {isLocating ? 'Detecting…' : 'Use my location'}
                  </Button>
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="country"
                    placeholder="Your country"
                    className="pl-10 h-12 border-gray-300 focus:border-black focus:ring-black transition-colors"
                    {...register('country')}
                  />
                </div>
                {errors.country && (
                  <p className="text-sm text-red-600 mt-1">{errors.country.message}</p>
                )}
                {locationError && (
                  <p className="text-xs text-red-600">{locationError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentCity" className="text-sm font-medium text-black">
                  Current City
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="currentCity"
                    placeholder="Your current city"
                    className="pl-10 h-12 border-gray-300 focus:border-black focus:ring-black transition-colors"
                    {...register('currentCity')}
                  />
                </div>
                {errors.currentCity && (
                  <p className="text-sm text-red-600 mt-1">{errors.currentCity.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="birthday" className="text-sm font-medium text-black">
                    Birthday <span className="text-gray-400">(Optional)</span>
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="birthday"
                      type="date"
                      className="pl-10 h-12 border-gray-300 focus:border-black focus:ring-black transition-colors"
                      {...register('birthday')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender" className="text-sm font-medium text-black">
                    Gender <span className="text-gray-400">(Optional)</span>
                  </Label>
                  <Select
                    {...register('gender')}
                    className="h-12 border-gray-300 focus:border-black focus:ring-black transition-colors"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                    <option value="prefer_not_to_say">Prefer not to say</option>
                  </Select>
                </div>
              </div>

              {error && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <p className="text-sm text-black text-center">{error}</p>
                </div>
              )}

              <div className="flex space-x-3">
                <Button
                  type="button"
                  onClick={prevStep}
                  variant="outline"
                  className="flex-1 h-12 border-gray-300 hover:bg-gray-50 transition-colors text-black"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="flex-1 h-12 bg-black hover:bg-gray-800 text-white font-medium transition-colors"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </div>
            </div>
          )}
        </form>

        {/* Google Sign Up Option */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-4 text-gray-400">Or continue with</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full h-12 border-gray-300 hover:bg-gray-50 transition-colors text-black"
          onClick={handleGoogleSignUp}
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>
      </CardContent>

      <CardFooter className="justify-center pb-8">
        <p className="text-sm text-gray-500">
          Already have an account?{' '}
          <Link
            href="/auth/signin"
            className="text-black hover:text-gray-700 font-medium hover:underline transition-colors"
          >
            Sign in
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}