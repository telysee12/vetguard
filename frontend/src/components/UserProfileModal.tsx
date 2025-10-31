import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from './ui/dialog';
import { useToast } from '../hooks/use-toast';
import { getApiUrl, getAuthHeaders, getAuthHeadersForFormData } from '../lib/api';
import { Eye, EyeOff, Loader2, User } from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail: string;
  onProfileUpdated: (updatedUser: any) => void;
  currentPassportPhotoUrl?: string;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentEmail,
  onProfileUpdated,
  currentPassportPhotoUrl,
}) => {
  console.log('UserProfileModal currentPassportPhotoUrl:', currentPassportPhotoUrl);
  const [email, setEmail] = useState(currentEmail);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passportPhoto, setPassportPhoto] = useState<File | null>(null);

  const { toast } = useToast();

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setEmail(currentEmail);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
      setPassportPhoto(null);
    }
  }, [isOpen, currentEmail]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation (only if new password is provided)
    if (newPassword) {
      if (!currentPassword) {
        newErrors.currentPassword = 'Current password is required to change password';
      }
      if (newPassword.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters long';
      }
      if (newPassword !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const updates: any = {};
      let hasUpdates = false;

      // Update email if changed
      if (email !== currentEmail) {
        const emailResponse = await fetch(`${getApiUrl()}/api/v1/auth/update-email`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify({ newEmail: email }),
        });

        if (!emailResponse.ok) {
          const errorData = await emailResponse.json();
          throw new Error(errorData.message || 'Failed to update email');
        }

        updates.email = email;
        hasUpdates = true;
      }

      // Update password if provided
      if (newPassword) {
        const passwordResponse = await fetch(`${getApiUrl()}/api/v1/auth/change-password`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        });

        if (!passwordResponse.ok) {
          const errorData = await passwordResponse.json();
          throw new Error(errorData.message || 'Failed to update password');
        }

        hasUpdates = true;
      }

      // Upload passport photo if provided
      if (passportPhoto) {
        const formData = new FormData();
        formData.append('file', passportPhoto);

        const uploadResponse = await fetch(`${getApiUrl()}/api/v1/upload/passport-photo`, {
          method: 'POST',
          headers: { ...getAuthHeadersForFormData() },
          body: formData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(errorData.message || 'Failed to upload passport photo');
        }
        const { url } = await uploadResponse.json();
        updates.passportPhotoUrl = url;
        hasUpdates = true;

        // PATCH the new passport photo URL to backend for this user
        if (updates.passportPhotoUrl) {
          const updatePhotoRes = await fetch(`${getApiUrl()}/api/v1/auth/update-passport-photo`, {
            method: 'PATCH',
            headers: {
              ...getAuthHeaders(),
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ passportPhotoUrl: updates.passportPhotoUrl }),
          });
          if (!updatePhotoRes.ok) {
            const errorData = await updatePhotoRes.json();
            throw new Error(errorData.message || 'Failed to update passport photo in profile');
          }
        }
      }

      if (hasUpdates) {
        // Fetch updated user data
        const userResponse = await fetch(`${getApiUrl()}/api/v1/auth/me`, {
          headers: getAuthHeaders(),
        });

        if (userResponse.ok) {
          const updatedUser = await userResponse.json();
          onProfileUpdated(updatedUser);
        }

        toast({
          title: "Profile Updated",
          description: "Your profile has been updated successfully.",
        });

        onClose();
      } else {
        toast({
          title: "No Changes",
          description: "No changes were made to your profile.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl"> {/* Increased width */}
        <DialogHeader>
          <DialogTitle>Update Profile</DialogTitle>
          <DialogDescription>
            Update your email address and password. Leave password fields empty if you don't want to change your password.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Passport Photo Top Center */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-28 h-28 rounded-full bg-muted flex items-center justify-center overflow-hidden mb-2 border-2 border-primary">
              {passportPhoto ? (
                <img 
                  src={URL.createObjectURL(passportPhoto)}
                  alt="Passport Preview"
                  className="h-full w-full object-cover"
                />
              ) : currentPassportPhotoUrl ? (
                <img 
                  src={currentPassportPhotoUrl.startsWith('http') 
                    ? `${currentPassportPhotoUrl}?t=${Date.now()}` 
                    : `${getApiUrl()}${currentPassportPhotoUrl}?t=${Date.now()}`}
                  alt="Current Passport"
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-14 w-14 text-muted-foreground" />
              )}
            </div>
            <Input
              id="passportPhoto"
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={(e) => setPassportPhoto(e.target.files?.[0] || null)}
              className="w-full"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Upload a new passport photo (JPG, PNG up to 10MB)
            </p>
          </div>

          {/* Two fields per row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Current Password Field */}
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  disabled={isLoading}
                  tabIndex={-1}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.currentPassword && (
                <p className="text-sm text-red-600">{errors.currentPassword}</p>
              )}
            </div>

            {/* New Password Field */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password (optional)</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={isLoading}
                  tabIndex={-1}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.newPassword && (
                <p className="text-sm text-red-600">{errors.newPassword}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Password must be at least 8 characters long
              </p>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
          </div>

          {/* Action Buttons - always visible */}
          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Profile'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal;
