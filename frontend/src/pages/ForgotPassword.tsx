import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import axios from 'axios';

// Simple email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: email, 2: otp+new password, 3: done
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const getApiUrl = () => {
    return (import.meta.env?.VITE_API_URL as string) || 'http://localhost:3000';
  };

  // Step 1: Request OTP
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_REGEX.test(email)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${getApiUrl()}/api/v1/auth/request-password-reset`, { email });
      toast({
        title: 'Email Sent',
        description: res.data.message || 'An OTP has been sent to your email address.',
      });
      setStep(2);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Error requesting password reset. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP and set new password
  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast({
        title: 'Invalid Password',
        description: 'Password must be at least 6 characters long.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${getApiUrl()}/api/v1/auth/reset-password`, {
        email,
        otp,
        newPassword,
      });
      toast({
        title: 'Success',
        description: res.data.message || 'Your password has been reset successfully.',
      });
      setStep(3);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Invalid OTP or an error occurred. Please try again.';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <CardHeader>
              <CardTitle>Forgot Password</CardTitle>
              <CardDescription>
                Enter your email address and we'll send you an OTP to reset your password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Send Reset Code
                </Button>
              </form>
            </CardContent>
          </>
        );
      case 2:
        return (
          <>
            <CardHeader>
              <CardTitle>Reset Your Password</CardTitle>
              <CardDescription>
                An OTP has been sent to {email}. Please enter it below along with your new password.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerifyAndReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">One-Time Password (OTP)</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter the OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter your new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Reset Password
                </Button>
              </form>
            </CardContent>
          </>
        );
      case 3:
        return (
          <>
            <CardHeader className="text-center">
              <CardTitle>Password Reset Successful!</CardTitle>
              <CardDescription>
                You can now log in with your new password.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <Button asChild>
                <Link to="/login">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Login
                </Link>
              </Button>
            </CardContent>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center container mx-auto px-4 py-16">
        <div className="w-full max-w-md">
          <Card className="shadow-elegant">
            {renderStepContent()}
          </Card>
          {step !== 3 && (
            <div className="mt-4 text-center text-sm">
              <Link to="/login" className="text-primary hover:underline">
                <ArrowLeft className="inline-block mr-1 h-4 w-4" />
                Back to Login
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );

};

export default ForgotPassword;