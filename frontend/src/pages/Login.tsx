import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const apiUrl = (import.meta as ImportMeta).env?.VITE_API_URL || 'http://localhost:3000';
      const res = await fetch(`${apiUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Invalid credentials or account not approved');
      }
      const data = await res.json();
      localStorage.setItem('vgms_token', data.access_token);
      localStorage.setItem('vgms_user', JSON.stringify(data.user));

      toast({ title: 'Login Successful', description: 'Welcome to VetGard System!' });

      const role: string = data.user.role;
      if (role === "BASIC_VET") {
        // Look for license application for this vet
        const token = data.access_token;
        try {
          const apiUrl = (import.meta as ImportMeta).env?.VITE_API_URL || 'http://localhost:3000';
          const res = await fetch(`${apiUrl}/api/v1/license-applications/mine`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          if (!res.ok) {
            window.location.href = "/basic-dashboard";
            return;
          }
          const licenseApp = await res.json();
          if (!licenseApp || !licenseApp.fieldOfPractice) {
            window.location.href = "/basic-dashboard";
            return;
          }
          if (licenseApp.fieldOfPractice === "Pharmacy") {
            window.location.href = "/pharmacy-dashboard";
          } else {
            window.location.href = "/basic-dashboard";
          }
        } catch (err) {
          window.location.href = "/basic-dashboard";
        }
        return;
      }
      switch (role) {
        case 'ADMIN':
          window.location.href = '/district-dashboard';
          break;
        case 'SECTOR_VET':
          window.location.href = '/sector-dashboard';
          break;
        case 'BASIC_VET':
        default:
          window.location.href = '/basic-dashboard';
      }
    } catch (error: unknown) {
      let message = 'Login failed';
      if (error instanceof Error) {
        const errMsg = error.message.toLowerCase();
        if (
          errMsg.includes('not approved') ||
          errMsg.includes('pending') ||
          errMsg.includes('waiting')
        ) {
          message =
            'Your account is pending approval by the Huye District Admin. Please wait for approval before logging in.';
        } else {
          message = error.message;
        }
      }
      toast({
        title: 'Login Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="shadow-elegant">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Shield className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
              <CardDescription>
                Sign in to your VetGard account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>


                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 text-sm">
                    <input type="checkbox" className="rounded" />
                    <span>Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>

                <Button type="submit" className="w-full" size="lg">
                  Sign In
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-primary hover:underline font-medium">
                    Sign up
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;