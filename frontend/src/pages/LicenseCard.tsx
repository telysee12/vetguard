import React, { forwardRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { ShieldCheck, Calendar, Award } from 'lucide-react';

interface User {
  id: number | string;
  firstName?: string;
  lastName?: string;
  email?: string;
  passportPhoto?: string;
  [key: string]: unknown;
}

interface LicenseCardProps {
  user: User | null;
  licenseNumber: string;
  licenseType: string;
  fieldOfPractice?: string;
  issuedDate: string;
  expiryDate: string;
}

const LicenseCard = forwardRef<HTMLDivElement, LicenseCardProps>(
  ({ user, licenseNumber, licenseType, fieldOfPractice, issuedDate, expiryDate }, ref) => {
    const getInitials = (firstName?: string, lastName?: string) => {
      return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
    };

    return (
      <div ref={ref} className="p-4 bg-white">
        <Card className="w-[324px] h-[204px] bg-gradient-to-br from-blue-100 to-green-100 shadow-lg border-2 border-blue-800">
          <CardHeader className="flex flex-row items-center justify-between p-3 bg-blue-800 text-white rounded-t-lg">
            <div className="flex items-center space-x-2">
              <Award className="h-6 w-6" />
              <CardTitle className="text-sm font-bold">VETERINARY LICENSE</CardTitle>
            </div>
            <div className="text-xs font-semibold">Rwanda</div>
          </CardHeader>
          <CardContent className="p-3">
            <div className="flex space-x-3">
              <Avatar className="h-20 w-20 border-2 border-blue-200">
                <AvatarImage src={user?.passportPhoto} alt={`${user?.firstName} ${user?.lastName}`} />
                <AvatarFallback className="bg-blue-200 text-blue-800 font-bold">
                  {getInitials(user?.firstName, user?.lastName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <h3 className="text-base font-bold text-blue-900 leading-tight">
                  {user?.firstName} {user?.lastName}
                </h3>
                <p className="text-xs text-gray-600 leading-tight">{licenseType}</p>
                <div className="flex items-center text-xs text-gray-700 pt-1">
                  <ShieldCheck className="h-3 w-3 mr-1.5 text-green-600" />
                  <p className="font-medium">
                    License No: <span className="font-bold">{licenseNumber}</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-blue-200 space-y-1.5">
              <div className="flex justify-between text-xs">
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1.5 text-gray-500" />
                  <span className="font-medium text-gray-600">Issued:</span>
                </div>
                <span className="font-semibold text-gray-800">
                  {new Date(issuedDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1.5 text-gray-500" />
                  <span className="font-medium text-gray-600">Expires:</span>
                </div>
                <span className="font-semibold text-red-600">{expiryDate}</span>
              </div>
              {fieldOfPractice && (
                <div className="flex justify-between text-xs items-center pt-1">
                  <div className="flex items-center">
                    <Stethoscope className="h-3 w-3 mr-1.5 text-gray-500" />
                    <span className="font-medium text-gray-600">Field of Practice:</span>
                  </div>
                  <span className="font-semibold text-gray-800 text-right uppercase truncate">
                    {fieldOfPractice}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
);

LicenseCard.displayName = 'LicenseCard';

export default LicenseCard;