import React, { useState } from 'react';
import { Button } from './ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { User, LogOut, Settings } from 'lucide-react';
import { getApiUrl } from '../lib/api';

interface UserProfileDropdownProps {
  userEmail: string;
  userName?: string;
  onLogout: () => void;
  onUpdateProfile: () => void;
  passportPhotoUrl?: string;
}

const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({
  userEmail,
  userName,
  onLogout,
  onUpdateProfile,
  passportPhotoUrl,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    onLogout();
    setIsOpen(false);
  };

  const handleUpdateProfile = () => {
    onUpdateProfile();
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex items-center space-x-2 px-3 py-2 h-auto"
        >
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
              {passportPhotoUrl ? (
                <img 
                  src={passportPhotoUrl
                      ? (passportPhotoUrl.startsWith('http') 
                          ? `${passportPhotoUrl}?t=${Date.now()}`
                          : `${getApiUrl()}${passportPhotoUrl}?t=${Date.now()}`
                        )
                      : undefined
                  }
                  alt="Passport"
                  className="h-full w-full object-cover" 
                />
              ) : (
                <User className="h-4 w-4 text-primary" />
              )}
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-foreground">
                {userName || userEmail}
              </p>
              <p className="text-xs text-muted-foreground">
                {userEmail}
              </p>
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={handleUpdateProfile}>
          <Settings className="h-4 w-4 mr-2" />
          Update Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfileDropdown;
