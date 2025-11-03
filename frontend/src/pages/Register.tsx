import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Shield, Eye, EyeOff, Upload } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import Header from '../components/Header';
import Footer from '../components/Footer';

const sectorCells: Record<string, string[]> = {
  Ngoma: [
    'Matyazo', 'Butare', 'Kaburemera', 'Ngoma', 'Mara'
  ],
  Tumba: [
    'Cyarwa','Rango B', 'Gitwa', 'Cyimana', 'Mpare'
  ],
  Huye: [
    'Kinyamakara', 'Ruhashya', 'Gatobotobo', 'Nyakagezi', 'Rukira', 'Kibingo', 'Sovu', 'Muyogoro', 'Bunazi'
  ],
  Ruhashya: [
    'Ruhashya', 'Muhororo', 'Rugogwe', 'Gatovu', 'Karama', 'Busheshi'
  ],
  Rusatira: [
    'Rusatira', 'Mugogwe', 'Gafumba', 'Kimuna', 'Kimirehe', 'Kiruhura', 'Buhimba'
  ],
  Gishamvu: [
    'Sholi', 'Nyakibanda', 'Ryakibogo', 'Nyumba', 'Muyogoro'
  ],
  Karama: [
    'Muhembe', 'Gahororo', 'Buhoro', 'Musebeya', 'Rugarama', 'Shanga'
  ],
  Kigoma: [
    'Kabatwa', 'Nyabisindu', 'Karambi', 'Kabuga', 'Gishihe', 'Gitovu', 'Gahana', 'Shanga'
  ],
  Maraba: [
    'Shanga', 'Kabuye', 'Kanyinya', 'Gasumba', 'Shyembe', 'Buremera', 'Rugango', 'Kabuga'
  ],
  Mbazi: [
    'Gatobotobo', 'Rusagara', 'Mutunda', 'Tare', 'Mwulire', 'Bukomeye'
  ],
  Mukura: [
    'Rango A', 'Icyeru', 'Buvumu'
  ],
  Simbi: [
    'Gisakura', 'Kabusanze', 'Mugobore', 'Cyendajuru', 'Nyangazi', 'Cyarwa'
  ],
  Rwaniro: [
    'Kibiraro', 'Mwendo', 'Gatwaro', 'Kamwambi', 'Nyamabuye', 'Shyunga', 'Nyaruhombo'
  ],
  Kinazi: [
    'Byinza', 'Sazange', 'Kabona'
  ],
};

// fallback local villages for Huye (used when API returns 404 or is unavailable)
const localVillagesByCell: Record<string, string[]> = {
  Kinyamakara: ['Kinyamakara I', 'Kinyamakara II', 'Kinyamakara III'],
  Ruhashya: ['Ruhashya Centre', 'Ruhashya East', 'Ruhashya West'],
  Gatobotobo: ['Gatobotobo A', 'Gatobotobo B'],
  Nyakagezi: ['Nyakagezi 1', 'Nyakagezi 2'],
  Rukira: ['Rukira North', 'Rukira South'],
  Kibingo: ['Kibingo A', 'Kibingo B'],
  Sovu: ['Sovu I', 'Sovu II'],
  Muyogoro: ['Muyogoro Central', 'Muyogoro East'],
  Bunazi: ['Bunazi I', 'Bunazi II'],
  // add more mappings as you get real data
};

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    nationalId: '',
    dateOfBirth: '',
    gender: '',
    // Location
    province: 'Southern,', // Set default
    district: 'Huye',     // Set default
    sector: '',           // User must select
    cell: '',
    village: '',
    address: '',
    // Role specific
    role: 'basic-vet',
    // Professional Info
    graduationYear: '',
    graduationProgramFacility: '',
    fieldOfGraduation: '',
    previousWorkplace: '',
    // Documents
    degree: null as File | null,
    license: null as File | null,
    nationalIdCopy: null as File | null,
    passportPhoto: null as File | null,
  });

  // Add validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const currentYear = new Date().getFullYear();
  const [gradYearError, setGradYearError] = useState('');
  const [registrationAllowed, setRegistrationAllowed] = useState(localStorage.getItem('registrationOpen') === 'true');

  useEffect(() => {
    const handler = () => setRegistrationAllowed(localStorage.getItem('registrationOpen') === 'true');
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const { toast } = useToast();

  const provinces = [
    'Southern',
    'Northern',
    'Eastern',
    'Western',
    'Kigali'
  ]; // Huye is in Southern Province

  const sectors = [
    'Ngoma', 'Tumba', 'Huye', 'Ruhashya', 'Rusatira', 'Gishamvu', 'Karama', 'Kigoma',
    'Maraba', 'Mbazi', 'Mukura', 'Simbi', 'Rwaniro', 'Kinazi'
  ];

  // Validation functions
  const validateNationalId = (nationalId: string): boolean => {
    return /^\d{16}$/.test(nationalId);
  };

  const validatePhoneNumber = (phone: string): boolean => {
    return /^\d{10}$/.test(phone);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate National ID
    if (!formData.nationalId) {
      newErrors.nationalId = 'National ID is required';
    } else if (!validateNationalId(formData.nationalId)) {
      newErrors.nationalId = 'National ID must be exactly 16 digits';
    }

    // Validate Phone Number
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhoneNumber(formData.phone)) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    }

    // Validate other required fields
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.province) newErrors.province = 'Province is required';
    if (!formData.district) newErrors.district = 'District is required';
    if (!formData.sector) newErrors.sector = 'Sector is required';
    if (!formData.cell) newErrors.cell = 'Cell is required';
    if (!formData.village) newErrors.village = 'Village is required';

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }

    // Real-time validation for National ID and Phone
    if (field === 'nationalId' && value && !validateNationalId(value)) {
      setErrors({ ...errors, nationalId: 'National ID must be exactly 16 digits' });
    } else if (field === 'phone' && value && !validatePhoneNumber(value)) {
      setErrors({ ...errors, phone: 'Phone number must be exactly 10 digits' });
    }
  };

  // Update graduation year handler
  const handleGraduationYearChange = (value: string) => {
    setFormData({ ...formData, graduationYear: value });
    if (value && parseInt(value, 10) > currentYear) {
      setGradYearError(`Graduation year cannot be greater than ${currentYear}`);
    } else {
      setGradYearError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors below',
        variant: 'destructive',
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.degree || !formData.nationalIdCopy || !formData.passportPhoto) {
      toast({
        title: 'Missing Documents',
        description: 'Please upload the required documents: Degree Certificate, National ID Copy, and Passport Photo.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const apiUrl = (import.meta as ImportMeta).env?.VITE_API_URL || 'http://localhost:3000';

      const uploadFile = async (file: File | null, fieldName: string): Promise<string | null> => {
        if (!file) return null;
        const fileFormData = new FormData();
        fileFormData.append('file', file, file.name);

        let uploadEndpoint = `${apiUrl}/api/v1/upload`;
        if (fieldName === 'Passport Photo') {
          uploadEndpoint = `${apiUrl}/api/v1/upload/passport-photo`;
        }

        const res = await fetch(uploadEndpoint, {
          method: 'POST',
          body: fileFormData,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || `Failed to upload ${fieldName}`);
        }
        const result = await res.json();
        return result.url;
      };

      const [degreePath, licensePath, nationalIdCopyPath, passportPhotoPath] = await Promise.all([
        uploadFile(formData.degree, 'Degree Certificate'),
        uploadFile(formData.license, 'Professional License'),
        uploadFile(formData.nationalIdCopy, 'National ID Copy'),
        uploadFile(formData.passportPhoto, 'Passport Photo'),
      ]);

      const registrationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        nationalId: formData.nationalId,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        province: formData.province,
        district: formData.district,
        sector: formData.sector,
        cell: formData.cell,
        village: formData.village,
        graduationYear: formData.graduationYear ? parseInt(formData.graduationYear, 10) : undefined,
        graduationProgramFacility: formData.graduationProgramFacility || undefined,
        fieldOfGraduation: formData.fieldOfGraduation || undefined,
        workplace: formData.previousWorkplace,
        degreeCert: degreePath,
        license: licensePath,
        nationalIdCopy: nationalIdCopyPath,
        passportPhoto: passportPhotoPath,
        role: 'BASIC_VET',
      };

      const res = await fetch(`${apiUrl}/api/v1/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registrationData),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || 'Registration failed');
      }

      toast({
        title: 'Registration Successful',
        description: 'Your application has been submitted for approval',
      });
      setTimeout(() => navigate('/login'), 1500);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unable to register. Please try again.';
      toast({
        title: 'Registration Error',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  };

  const handleFileUpload = (field: 'degree' | 'license' | 'nationalIdCopy' | 'passportPhoto', file: File | null) => {
    setFormData({...formData, [field]: file});
  };

  // Villages fetched based on selected cell
  const [villages, setVillages] = useState<string[]>([]);
  const [villagesLoading, setVillagesLoading] = useState(false);
  const [villagesError, setVillagesError] = useState<string | null>(null);

  useEffect(() => {
    if (!formData.cell) {
      setVillages([]);
      setVillagesError(null);
      return;
    }

    let mounted = true;
    const apiUrl = (import.meta as ImportMeta).env?.VITE_API_URL || 'http://localhost:3000';

    const tryFetch = async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) return { ok: false, status: res.status, body: null as unknown };
      const json = await res.json();
      return { ok: true, status: res.status, body: json as unknown };
    };

    const fetchVillages = async () => {
      setVillagesLoading(true);
      setVillagesError(null);

      // candidate endpoints to try (add or adjust to match backend)
      const endpoints = [
        `${apiUrl}/api/v1/locations/cells/${encodeURIComponent(formData.cell)}/villages`,
        `${apiUrl}/api/v1/villages?cell=${encodeURIComponent(formData.cell)}`,
        `${apiUrl}/api/v1/locations/villages/${encodeURIComponent(formData.cell)}`
      ];

      try {
        let resultList: string[] | null = null;
        let lastError: string | null = null;

        for (const url of endpoints) {
          try {
            const r = await tryFetch(url);
            if (r.ok) {
              const json = r.body;
              // accept array or { villages: [...] }
              if (Array.isArray(json)) {
                resultList = json as string[];
              } else if (json && typeof json === 'object' && 'villages' in (json as any)) {
                resultList = (json as any).villages as string[];
              } else if (json && typeof json === 'object' && 'data' in (json as any)) {
                // some APIs wrap in data
                const d = (json as any).data;
                resultList = Array.isArray(d) ? d : (d?.villages || null);
              }
              if (resultList) break;
            } else {
              lastError = `Failed to load villages (${r.status}) from ${url}`;
              // try next endpoint on 404 or other non-ok
            }
          } catch (err) {
            lastError = err instanceof Error ? err.message : String(err);
          }
        }

        // If no endpoint returned data, fallback to local map for Huye
        if (!resultList) {
          const fallback = localVillagesByCell[formData.cell];
          if (fallback && fallback.length > 0) {
            resultList = fallback;
            lastError = null; // clear error because we have fallback
          } else {
            // no fallback available
            if (!lastError) lastError = 'No villages found for selected cell';
          }
        }

        if (mounted) {
          setVillages(resultList || []);
          setVillagesError(lastError);
        }
      } catch (err: unknown) {
        if (mounted) {
          setVillages([]);
          setVillagesError(err instanceof Error ? err.message : 'Failed to fetch villages');
        }
      } finally {
        if (mounted) setVillagesLoading(false);
      }
    };

    fetchVillages();
    return () => { mounted = false; };
  }, [formData.cell]);

  if (!registrationAllowed) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card>
          <CardHeader>
            <CardTitle>Registration Closed</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Registration is currently closed. Please contact your district vet to open registration.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-elegant">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Shield className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">Veterinary Registration</CardTitle>
              <CardDescription>
                Register as a veterinary professional to join the VetGard System
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Step Indicator */}
              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    1
                  </div>
                  <div className={`w-16 h-0.5 ${currentStep >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    2
                  </div>
                  <>
                    <div className={`w-16 h-0.5 ${currentStep >= 3 ? 'bg-primary' : 'bg-muted'}`}></div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                      3
                    </div>
                  </>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Step 1: Personal Information */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Personal Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className={errors.firstName ? 'border-red-500' : ''}
                        />
                        {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                      </div>
                      
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className={errors.lastName ? 'border-red-500' : ''}
                        />
                        {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="nationalId">National ID *</Label>
                      <Input
                        id="nationalId"
                        type="text"
                        placeholder="Enter 16-digit National ID"
                        value={formData.nationalId}
                        onChange={(e) => handleInputChange('nationalId', e.target.value)}
                        maxLength={16}
                        className={errors.nationalId ? 'border-red-500' : ''}
                      />
                      {errors.nationalId && <p className="text-red-500 text-sm mt-1">{errors.nationalId}</p>}
                      <p className="text-xs text-muted-foreground mt-1">Must be exactly 16 digits</p>
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="Enter 10-digit phone number"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        maxLength={10}
                        className={errors.phone ? 'border-red-500' : ''}
                      />
                      {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                      <p className="text-xs text-muted-foreground mt-1">Must be exactly 10 digits</p>
                    </div>

                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={errors.email ? 'border-red-500' : ''}
                      />
                      {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                          className={errors.dateOfBirth ? 'border-red-500' : ''}
                        />
                        {errors.dateOfBirth && <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>}
                      </div>
                      
                      <div>
                        <Label htmlFor="gender">Gender *</Label>
                        <div className="flex space-x-6 mt-2">
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="gender"
                              value="male"
                              checked={formData.gender === "male"}
                              onChange={(e) => handleInputChange('gender', e.target.value)}
                              className="accent-primary"
                            />
                            <span>Male</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="gender"
                              value="female"
                              checked={formData.gender === "female"}
                              onChange={(e) => handleInputChange('gender', e.target.value)}
                              className="accent-primary"
                            />
                            <span>Female</span>
                          </label>
                        </div>
                        {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="password">Password *</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={formData.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            className={errors.password ? 'border-red-500' : ''}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Confirm Password *</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={formData.confirmPassword}
                          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                          className={errors.confirmPassword ? 'border-red-500' : ''}
                        />
                        {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Location & Professional Information */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold"> Workplace Location Information</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="province">Province *</Label>
                          <select
                            title="Province"
                            id="province"
                            className="w-full p-2 border border-input rounded-md bg-background"
                            value={formData.province}
                            onChange={(e) => setFormData({...formData, province: e.target.value})}
                            required
                          >
                            <option value="">Select Province</option>
                            {provinces.map(province => (
                              <option
                                key={province}
                                value={province}
                                disabled={province !== 'Southern'}
                              >
                                {province}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="district">District *</Label>
                          <select
                            title="District"
                            id="district"
                            className="w-full p-2 border border-input rounded-md bg-background"
                            value={formData.district}
                            onChange={(e) => setFormData({...formData, district: e.target.value})}
                            required
                            disabled // Make the field fixed
                          >
                            <option value="Huye">Huye</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="sector">Sector *</Label>
                          <select
                            title="Sector"
                            id="sector"
                            className="w-full p-2 border border-input rounded-md bg-background"
                            value={formData.sector}
                            onChange={(e) => setFormData({...formData, sector: e.target.value, cell: ''})}
                            required
                          >
                            <option value="">Select Sector</option>
                            {sectors.map(sector => (
                              <option key={sector} value={sector}>{sector}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cell">Cell</Label>
                          <select
                            id="cell"
                            className="w-full p-2 border border-input rounded-md bg-background"
                            value={formData.cell}
                            onChange={(e) => setFormData({...formData, cell: e.target.value, village: ''})}
                            disabled={!formData.sector}
                            required
                          >
                            <option value="">Select Cell</option>
                            {(sectorCells[formData.sector] || []).map(cell => (
                              <option key={cell} value={cell}>{cell}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="village">Village</Label>
                          <select
                            id="village"
                            className="w-full p-2 border border-input rounded-md bg-background"
                            value={formData.village}
                            onChange={(e) => setFormData({...formData, village: e.target.value})}
                            disabled={!formData.cell || villagesLoading}
                            required
                          >
                            <option value="">{villagesLoading ? 'Loading villages...' : 'Select Village'}</option>
                            {villages.map(v => (
                              <option key={v} value={v}>{v}</option>
                            ))}
                          </select>
                          {!villagesLoading && formData.cell && villages.length === 0 && (
                            <p className="text-sm text-muted-foreground mt-1">No villages available for selected cell.</p>
                          )}
                          {villagesError && (
                            <p className="text-sm text-red-500 mt-1">Error loading villages: {villagesError}</p>
                          )}
                        </div>
                      </div>

                      
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Professional Information</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="graduationYear">Graduation Year *</Label>
                          <Input
                            id="graduationYear"
                            type="number"
                            min="1980"
                            max={currentYear}
                            placeholder="YYYY"
                            value={formData.graduationYear}
                            onChange={(e) => handleGraduationYearChange(e.target.value)}
                            required
                            className={gradYearError ? 'border-red-500' : ''}
                          />
                          {gradYearError && (
                            <p className="text-red-500 text-sm mt-1">{gradYearError}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="graduationProgramFacility">Program/Facility of Graduation</Label>
                          <Input
                            id="graduationProgramFacility"
                            placeholder="e.g., DVM / University of Rwanda"
                            value={formData.graduationProgramFacility}
                            onChange={(e) => setFormData({...formData, graduationProgramFacility: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fieldOfGraduation">Field of Graduation</Label>
                          <Input
                            id="fieldOfGraduation"
                            placeholder="e.g., Veterinary Medicine"
                            value={formData.fieldOfGraduation}
                            onChange={(e) => setFormData({...formData, fieldOfGraduation: e.target.value})}
                          />
                        </div>
                      </div>

                 <div className="space-y-2">
                        <Label htmlFor="previousWorkplace">Previous Workplace</Label>
                        <select
                          id="previousWorkplace"
                          value={formData.previousWorkplace}
                          onChange={(e) => setFormData({ ...formData, previousWorkplace: e.target.value })}
                          className="w-full p-2 border border-input rounded-md bg-background"
                        >
                          <option value="">Select workplace type</option>
                          <option value="Pharmacy">Pharmacy</option>
                          <option value="Clinic">Clinic</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>

                    
                  </div>
                )}

                {/* Step 3: Required Documents */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Required Documents</h3>
                    <p className="text-sm text-muted-foreground">All documents must be clear, legible, and in PDF, JPG, or PNG format (max 10MB each)</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Veterinary Degree Certificate */}
                      <div className="space-y-2">
                        <Label htmlFor="degree">Veterinary Degree Certificate *</Label>
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                          <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <input
                            type="file"
                            id="degree"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload('degree', e.target.files?.[0] || null)}
                            className="hidden"
                            title="Upload your veterinary degree certificate"
                            placeholder="Upload degree certificate"
                          />
                          <Label htmlFor="degree" className="cursor-pointer text-primary hover:underline">
                            Click to upload degree certificate
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG up to 10MB</p>
                          {formData.degree && (
                            <p className="text-sm text-success mt-2">✓ {formData.degree.name}</p>
                          )}
                        </div>
                      </div>

                      {/* National ID Copy */}
                      <div className="space-y-2">
                        <Label htmlFor="nationalIdCopy">National ID Copy *</Label>
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                          <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <input
                            type="file"
                            id="nationalIdCopy"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload('nationalIdCopy', e.target.files?.[0] || null)}
                            className="hidden"
                            title="Upload your National ID copy"
                            placeholder="Upload National ID copy"
                          />
                          <Label htmlFor="nationalIdCopy" className="cursor-pointer text-primary hover:underline">
                            Click to upload National ID copy
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG up to 10MB</p>
                          {formData.nationalIdCopy && (
                            <p className="text-sm text-success mt-2">✓ {formData.nationalIdCopy.name}</p>
                          )}
                        </div>
                      </div>

                      {/* Passport Photo */}
                      <div className="space-y-2">
                        <Label htmlFor="passportPhoto">Passport Photo *</Label>
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                          <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <input
                            type="file"
                            id="passportPhoto"
                            accept=".jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload('passportPhoto', e.target.files?.[0] || null)}
                            className="hidden"
                            title="Upload your passport photo"
                            placeholder="Upload passport photo"
                          />
                          <Label htmlFor="passportPhoto" className="cursor-pointer text-primary hover:underline">
                            Click to upload Passport Photo
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 10MB</p>
                          {formData.passportPhoto && (
                            <p className="text-sm text-success mt-2">✓ {formData.passportPhoto.name}</p>
                          )}
                        </div>
                      </div>

                      {/* Professional License */}
                      <div className="space-y-2">
                        <Label htmlFor="license">Payment Receipt(30,000 RWF)</Label>
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                          <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <input
                            type="file"
                            id="license"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => handleFileUpload('license', e.target.files?.[0] || null)}
                            className="hidden"
                            title="Upload your professional license"
                            placeholder="Upload professional license"
                          />
                          <Label htmlFor="license" className="cursor-pointer text-primary hover:underline">
                           Click to upload Payment Receipt
                          </Label>
                          <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG up to 10MB</p>
                          {formData.license && (
                            <p className="text-sm text-success mt-2">✓ {formData.license.name}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    

                    <div className="bg-info/10 border border-info/20 rounded-lg p-4">
                      <h4 className="font-medium text-info mb-2">Document Requirements:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• All documents must be clearly scanned or photographed</li>
                        <li>• File size should not exceed 10MB per document</li>
                        <li>• Supported formats: PDF, JPG, PNG, DOC, DOCX</li>
                        <li>• Documents should be in English or Kinyarwanda</li>
                        <li>• Professional license is optional for new graduates</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(currentStep - 1)}
                    >
                      Previous
                    </Button>
                  )}
                  
                  {currentStep < 3 ? (
                    <Button
                      key={`next-step-${currentStep}`}
                      type="button"
                      onClick={() => setCurrentStep((s) => Math.min(3, s + 1))}
                      className="ml-auto"
                    >
                      Next
                    </Button>
                  ) : (
                    <Button key="submit-button" type="submit" className="ml-auto">
                      Submit Application
                    </Button>
                  )}
                </div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{' '}
                  <Link to="/login" className="text-primary hover:underline font-medium">
                    Sign in
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

export default Register;