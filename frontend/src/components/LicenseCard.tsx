import React, { forwardRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { User, Mail, Phone, MapPin, Award, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import logo from '../assets/logo.jpeg'; // Import the logo
import { getApiUrl } from '../lib/api';

interface LicenseCardProps {
  user: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    sector?: string;
    district?: string;
    province?: string;
    passportPhoto?: string; // Add passportPhoto to user
  };
  licenseNumber: string;
  licenseType: string;
  issuedDate: string; // Add issuedDate
  expiryDate?: string;
  fieldOfPractice?: string; // Add fieldOfPractice to props
}

const LicenseCard = forwardRef<HTMLDivElement, LicenseCardProps>(({ user, licenseNumber, licenseType, issuedDate, expiryDate, fieldOfPractice }, ref) => {
  const formattedIssuedDate = issuedDate ? format(new Date(issuedDate), 'dd-MMM-yy') : 'N/A';
  const formattedExpiryDate = expiryDate ? format(new Date(expiryDate), 'dd-MMM-yy') : 'N/A';

  let photoUrl = '';
  if (user.passportPhoto) {
    // If already full URL
    if (user.passportPhoto.startsWith('http://') || user.passportPhoto.startsWith('https://')) {
      photoUrl = user.passportPhoto;
    } else {
      photoUrl = `${getApiUrl()}${user.passportPhoto.startsWith('/uploads/') ? user.passportPhoto : `/uploads/${user.passportPhoto}`}`;
    }
  }

  return (
    <div ref={ref} className="relative w-[3.375in] h-[2.125in] bg-white text-gray-900 font-sans text-[8px]">
      <div className="absolute top-0 left-0 w-full h-full border border-gray-300 rounded-[3mm] overflow-hidden">
        {/* Recto (Front Side) */}
        <div className="w-full h-1/2 flex flex-col justify-between p-[0.1in] bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-[0.05in]">
              <img src={logo} alt="VGMS Logo" className="h-[0.3in] w-[0.3in] object-contain" />
              <div className="flex flex-col">
                <p className="text-[6px] font-bold">Rwanda Council of Veterinary Doctors</p>
                <p className="text-[5px]">In Pursuit of Quality and Reliable Veterinary Services</p>
                <p className="text-[7px] font-extrabold mt-[0.02in]">LICENSE CARD</p>
              </div>
            </div>
            <div className="text-[6px] font-semibold flex flex-col items-end">
              <span>Licence No: <span className="font-bold">{licenseNumber}</span></span>
            </div>
          </div>

          <div className="flex items-start mt-[0.05in]">
            {photoUrl && (
              <img src={`${photoUrl}?t=${Date.now()}`} crossOrigin="anonymous" alt="Passport" className="w-[0.4in] h-[0.5in] object-cover mr-[0.1in] border border-gray-200 rounded-[1mm]" />
            )}
            <div className="flex-1 grid grid-cols-2 gap-y-[0.02in] text-[6px]">
              <div>
                <span className="font-bold">Name:</span> {user.firstName} {user.lastName}
              </div>
              <div>
                <span className="font-bold">Issued:</span> {formattedIssuedDate}
              </div>
              <div>
                <span className="font-bold">Field of practice:</span> {fieldOfPractice || 'N/A'}
              </div>
              <div>
                <span className="font-bold">Expires:</span> {formattedExpiryDate}
              </div>
              <div>
                <span className="font-bold">Professional area:</span> {user.sector}, {user.district}, {user.province}
              </div>
            </div>
          </div>
        </div>

        {/* Verso (Back Side) */}
        <div className="w-full h-1/2 relative flex flex-col justify-center items-center p-[0.1in] bg-gray-50 border-t border-gray-200 overflow-hidden">
          {/* Watermark logo */}
          <img
            src={logo}
            alt="RCVD Logo Watermark"
            style={{
              position: 'absolute',
              left: '50%',
              top: '54%',
              width: '1.95in',
              height: '1.1in',
              opacity: 0.18,
              transform: 'translate(-50%, -50%)',
              zIndex: 0
            }}
            className="select-none pointer-events-none"
          />

          {/* Overlayed text content */}
          <div className="relative z-10 flex flex-col items-center w-full text-center">
            <span className="text-[10px] font-bold text-green-800 tracking-wide mb-2" style={{letterSpacing: '0.5px'}}>RWANDA COUNCIL OF VETERINARY DOCTORS</span>
            <div className="text-[8.2px] text-black font-bold max-w-[94%] mx-auto leading-tight mb-2" style={{textShadow:'0 1px 2px #fff9,0 0px 0px #fff9'}}>
              This card is issued by RCVD and is strictly personal
            </div>
            <div className="text-[8.2px] text-black font-bold max-w-[97%] mx-auto leading-tight mb-2" style={{textShadow:'0 1px 2px #fff9,0 0px 0px #fff9'}}>
              It remains property of RCVD and must be returned on demand.
            </div>
            <div className="text-[8.2px] text-black font-bold max-w-[100%] mx-auto leading-tight mb-6" style={{textShadow:'0 1px 2px #fff9,0 0px 0px #fff9'}}>
              Please use it in accordance with veterinary code of ethics.
            </div>
          </div>

          {/* Signatures and roles */}
          <div className="absolute left-0 bottom-1.5 flex flex-col items-start w-[47%] pl-2 z-10">
            <span className="text-[7px] font-extrabold text-red-600 leading-3 mt-2">Executive Secretary</span>
          </div>
          <div className="absolute right-0 bottom-1.5 flex flex-col items-end w-[47%] pr-2 z-10">
            <span className="text-[7px] font-extrabold text-red-600 leading-3 mt-2">Chairperson</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default LicenseCard;
