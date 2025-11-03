import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  Building2, 
  Users, 
  FileCheck, 
  Activity,
  CheckCircle,
  AlertCircle,
  Clock,
  LogOut,
  Eye,
  Download,
  BarChart3,
  Search,
  Filter,
  TrendingUp,
  Calendar,
  Phone,
  Mail,
  User,
  PawPrint,
  Shield,
  Award,
  Send,
  MapPin,
  Star,
  MessageSquare,
  PieChart,
  Target,
  Zap,
  Globe,
  FileText,
  ClipboardList,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Edit,
  Trash2,
  Plus,
  UserPlus,
  Settings,
  Bell,
  X
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { getApiUrl, getAuthHeaders, apiGet, apiPatch, apiDelete, apiPost } from '../lib/api';
import UserProfileDropdown from '../components/UserProfileDropdown';
import UserProfileModal from '../components/UserProfileModal';

// Enhanced data structures for comprehensive country management
interface Veterinarian {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  role: 'basic-vet' | 'sector-vet' | 'district-vet';
  assignedLocation: {
    district: string;
    sector?: string;
  };
  dateOfRegistration: string;
  status: 'active' | 'inactive';
  profile: {
    FieldOfPractice?: string;
    yearsExperience?: number;
    qualifications?: string[];
  };
}

interface District {
  id: string;
  name: string;
  sectors: Sector[];
}

interface Sector {
  id: string;
  name: string;
  districtId: string;
}

interface VetApplication {
  id: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  role: 'basic-vet' | 'sector-vet' | 'district-vet' | 'country-vet';
  FieldOfPractice: string;
  location: {
    province: string;
    district: string;
    sector: string;
  };
  submittedDate: string;
  status: 'pending' | 'under-review' | 'approved' | 'rejected' | 'requires-documents';
  documents: {
    degree: boolean;
    idDocument: boolean;
    experience: boolean;
    license: boolean;
    cv: boolean;
  };
  reviewNotes?: string;
  reviewer?: string;
  reviewDate?: string;
  priority: 'low' | 'medium' | 'high';
  yearsExperience: number;
  previousWorkplace?: string;
  graduationYear?: number | string;
  graduationProgramFacility?: string;
  fieldOfGraduation?: string;
}

interface LicenseApplication {
  id: string;
  vetId: string;
  vetName: string;
  vetRole: string;
  licenseType: 'basic' | 'specialized' | 'emergency' | 'research';
  fieldOfPractice: string;
  submittedDate: string;
  status: 'pending' | 'under-review' | 'approved' | 'rejected' | 'expired';
  documents: {
    degree: boolean;
    idDocument: boolean;
    experience: boolean;
    paymentReceipt: boolean;
  };
  reviewNotes?: string;
  reviewer?: string;
  reviewDate?: string;
  licenseNumber?: string;
  expiryDate?: string;
  feeAmount: number;
  feeStatus: 'unpaid' | 'paid' | 'waived';
}

interface VetLicenseApplication {
  id: number;
  vetId: number;
  fieldOfPractice: string;
  licenseType: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  degreeCertUrl: string;
  idDocumentUrl: string;
  paymentReceiptUrl?: string;
  feeStatus: 'PENDING' | 'PAID' | 'WAIVED';
  reviewNotes?: string;
  createdAt: string;
  vet: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    degreeCertUrl: string;
    idDocumentUrl: string;
  };
}

interface NationalReport {
  id: string;
  reportType: 'monthly' | 'quarterly' | 'annual' | 'emergency';
  period: string;
  year: number;
  submittedBy: string;
  submittedDate: string;
  status: 'draft' | 'submitted' | 'under-review' | 'approved' | 'published';
  content: {
    totalTreatments: number;
    totalVaccinations: number;
    emergencyCases: number;
    newPatients: number;
    activeVets: number;
  };
  attachments: string[];
  reviewNotes?: string;
  reviewer?: string;
  reviewDate?: string;
}

interface NationalStats {
  totalBasicVets: number;
  totalVets: number;
  totalDistricts: number;
  totalSectors: number;
  totalTreatments: number;
  totalVaccinations: number;
  totalFieldsOfPractice: number;
  emergencyResponseRate: number;
  monthlyGrowth: number;
  pendingApplications: number;
  activeLicenses: number;
  expiredLicenses: number;
}

// Update the interface to match the database structure
interface DatabaseReport {
  id: number;
  title: string;
  content: string;
  reportType: string;
  status: string;
  submittedBy: number;
  sector: string;
  district: string;
  province: string;
  attachments?: string;
  sectorVetNotes?: string;
  reviewedBy?: number;
  reviewedAt?: string;
  districtVetNotes?: string;
  districtReviewedBy?: number;
  districtReviewedAt?: string;
  countryStatus?: string;
  countryVetNotes?: string;
  countryReviewedBy?: number;
  countryReviewedAt?: string;
  createdAt: string;
  updatedAt: string;
  submitter: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    sector: string;
    district: string;
    role: string;
  };
}

const DistrictDashboard = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [selectedApplication, setSelectedApplication] = useState<VetApplication | null>(null);
  const [selectedLicense, setSelectedLicense] = useState<VetLicenseApplication | null>(null);
  const [selectedReport, setSelectedReport] = useState<NationalReport | null>(null);
  const [showLicenseReviewModal, setShowLicenseReviewModal] = useState(false);
  const [licenseReviewNotes, setLicenseReviewNotes] = useState('');
  const [licenseToReview, setLicenseToReview] = useState<VetLicenseApplication | null>(null);

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewDecision, setReviewDecision] = useState<'approve' | 'reject' | 'request-documents'>('approve');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  // Inline document preview state
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'pdf' | 'image' | 'other' | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>('');

  // User state management
  interface User {
    id: number | string;
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
    [key: string]: unknown;
  }
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Veterinary Management State
  const [showAddVetModal, setShowAddVetModal] = useState(false);
  const [showVetProfileModal, setShowVetProfileModal] = useState(false);
  const [selectedVet, setSelectedVet] = useState<Veterinarian | null>(null);
  const [editingVet, setEditingVet] = useState<Veterinarian | null>(null);
  const [vetFormData, setVetFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    nationalId: '',
    password: '',
    role: 'district-vet' as 'district-vet' | 'sector-vet',
    district: 'Huye',
    sector: ''
  });
  const [vetSearchTerm, setVetSearchTerm] = useState('');
  const [vetFilterStatus, setVetFilterStatus] = useState('all');
  const [vetFilterSector, setVetFilterSector] = useState('all');
  const { toast } = useToast();

  const [reports, setReports] = useState<DatabaseReport[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [selectedReportForReview, setSelectedReportForReview] = useState<DatabaseReport | null>(null);
  const [showReportReviewModal, setShowReportReviewModal] = useState(false);
  const [districtReviewData, setDistrictReviewData] = useState({
    status: '',
    districtVetNotes: ''
  });

  const [districts, setDistricts] = useState<District[]>([{
    id: 'huye-district-id',
    name: 'Huye',
    sectors: [
      { id: 'gishamvu-sector-id', name: 'Gishamvu', districtId: 'huye-district-id' },
      { id: 'huye-sector-id', name: 'Huye', districtId: 'huye-district-id' },
      { id: 'karama-sector-id', name: 'Karama', districtId: 'huye-district-id' },
      { id: 'kigoma-sector-id', name: 'Kigoma', districtId: 'huye-district-id' },
      { id: 'kinazi-sector-id', name: 'Kinazi', districtId: 'huye-district-id' },
      { id: 'maraba-sector-id', name: 'Maraba', districtId: 'huye-district-id' },
      { id: 'mbazi-sector-id', name: 'Mbazi', districtId: 'huye-district-id' },
      { id: 'mukura-sector-id', name: 'Mukura', districtId: 'huye-district-id' },
      { id: 'ngoma-sector-id', name: 'Ngoma', districtId: 'huye-district-id' },
      { id: 'ruhashya-sector-id', name: 'Ruhashya', districtId: 'huye-district-id' },
      { id: 'rusatira-sector-id', name: 'Rusatira', districtId: 'huye-district-id' },
      { id: 'rwaniro-sector-id', name: 'Rwaniro', districtId: 'huye-district-id' },
      { id: 'simbi-sector-id', name: 'Simbi', districtId: 'huye-district-id' },
      { id: 'tumba-sector-id', name: 'Tumba', districtId: 'huye-district-id' },
    ],
  }]);

  const openDocumentPreview = (url: string, title?: string) => {
    const lower = (url || '').toLowerCase();
    const isPdf = lower.endsWith('.pdf');
    const isImage = /(\.png|\.jpg|\.jpeg|\.gif)$/i.test(lower);
    setPreviewType(isPdf ? 'pdf' : isImage ? 'image' : 'other');
    setPreviewUrl(url);
    setPreviewTitle(title || 'Document Preview');
  };

  const handleLogout = () => {
    // Clear stored user data and token
    localStorage.removeItem('vgms_user');
    localStorage.removeItem('vgms_token');
    window.location.href = '/login';
  };

  const handleProfileUpdated = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('vgms_user', JSON.stringify(updatedUser));
  };

  const nationalReports: NationalReport[] = [
    {
      id: '1',
      reportType: 'monthly',
      period: 'January 2024',
      year: 2024,
      submittedBy: 'Dr. John Uwimana',
      submittedDate: '2024-01-31',
      status: 'submitted',
      content: {
        totalTreatments: 24567,
        totalVaccinations: 18934,
        emergencyCases: 1234,
        newPatients: 5678,
        activeVets: 1247,
      },
      attachments: ['monthly_report_jan_2024.pdf', 'vaccination_data.xlsx']
    },
    {
      id: '2',
      reportType: 'quarterly',
      period: 'Q4 2023',
      year: 2023,
      submittedBy: 'Dr. Marie Nyirahabimana',
      submittedDate: '2024-01-15',
      status: 'approved',
      content: {
        totalTreatments: 72345,
        totalVaccinations: 56789,
        emergencyCases: 3456,
        newPatients: 15678,
        activeVets: 1189,
      },
      attachments: ['quarterly_report_q4_2023.pdf', 'annual_summary.pdf'],
      reviewNotes: 'Excellent comprehensive report with detailed analysis',
      reviewer: 'Huye District Admin',
      reviewDate: '2024-01-20'
    }
  ];

  const [pendingRegistrations, setPendingRegistrations] = useState<VetApplication[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [licenseApplications, setLicenseApplications] = useState<VetLicenseApplication[]>([]);
  const [loadingLicenses, setLoadingLicenses] = useState(false);
  const [loadingRegistrations, setLoadingRegistrations] = useState<boolean>(false);
  const [nationalStats, setNationalStats] = useState<NationalStats>({
    totalVets: 0,
    totalBasicVets: 0,
    totalDistricts: 0,
    totalSectors: 0,
    totalTreatments: 0,
    totalVaccinations: 0,
    totalFieldsOfPractice: 0,
    emergencyResponseRate: 0,
    monthlyGrowth: 0,
    pendingApplications: 0,
    activeLicenses: 0,
    expiredLicenses: 0,
  });

  const fetchAllSectorVetReports = async () => {
    setLoadingReports(true);
    try {
      const data = await apiGet<DatabaseReport[]>('/api/v1/reports/all-sector-vet-reports');
      setReports(data);
    } catch (error) {
      console.error("Failed to load reports:", error);
      toast({ title: "Error", description: "Could not load reports.", variant: "destructive" });
    } finally {
      setLoadingReports(false);
    }
  };

  // Update country-level review
  const handleDistrictReview = async (reportId: number) => {
    try {
      await apiPatch(`/api/v1/reports/${reportId}/district-review`, districtReviewData);
      toast({
        title: 'Success',
        description: 'Report review updated successfully',
      });
      setShowReportReviewModal(false);
      fetchAllSectorVetReports(); // Refresh data
    } catch (error) {
      console.error('Error updating report review:', error);
      toast({
        title: 'Error',
        description: 'Failed to update report review',
        variant: 'destructive',
      });
    }
  };

  // Open review modal
  const openReportReviewModal = (report: DatabaseReport) => {
    setSelectedReportForReview(report);
    setDistrictReviewData({
      status: report.status,
      districtVetNotes: report.districtVetNotes || ''
    });
    setShowReportReviewModal(true);
  };

  // Add the missing loadBasicVets function
  const loadBasicVets = async () => {
    try {
      const response = await fetch(`${getApiUrl()}/api/v1/register`, { 
        headers: getAuthHeaders() 
      });
      if (!response.ok) {
        throw new Error('Failed to load registrations');
      }
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.error('Error loading registrations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load registrations',
        variant: 'destructive',
      });
      return [];
    }
  };

  // Load current user
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const storedUser = localStorage.getItem('vgms_user');
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }
        
        const res = await fetch(`${getApiUrl()}/api/v1/auth/me`, { 
          headers: getAuthHeaders() 
        });
        if (res.ok) {
          const userData = await res.json();
          setCurrentUser(userData);
          localStorage.setItem('vgms_user', JSON.stringify(userData));
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
        const storedUser = localStorage.getItem('vgms_user');
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }
      } finally {
        setUserLoading(false);
      }
    };

    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (selectedTab === 'reports') {
      fetchAllSectorVetReports();
    }
  }, [selectedTab]);

  useEffect(() => {
    const loadCountryData = async () => {
      try {
        setLoadingRegistrations(true);
        const [usersRes, patientsRes, treatmentsRes, fieldsRes] = await Promise.all([
          fetch(`${getApiUrl()}/api/v1/register`, { headers: getAuthHeaders() }),
          fetch(`${getApiUrl()}/api/v1/patients`, { headers: getAuthHeaders() }),
          fetch(`${getApiUrl()}/api/v1/treatments`, { headers: getAuthHeaders() }),
          fetch(`${getApiUrl()}/api/v1/field-of-practice`, { headers: getAuthHeaders() })
        ]);

        const users = await usersRes.json();
        const patientsData = await patientsRes.json();
        const treatmentsData = await treatmentsRes.json();
        const fieldsData = await fieldsRes.json();

        const allRegs = Array.isArray(users) ? users : [];
        const patients = Array.isArray(patientsData) ? patientsData : [];
        const treatments = Array.isArray(treatmentsData) ? treatmentsData : [];
        const allFields = Array.isArray(fieldsData) ? fieldsData : [];

        // Set registrations for approvals tab
        setRegistrations(allRegs);
        const pending = allRegs.filter((r: Registration) => (r.status || '').toUpperCase() === 'PENDING' && (r.role || '').toUpperCase() === 'BASIC_VET');
        setPendingRegistrations(pending);

        // Load Vet Management users: SECTOR_VET
        const vets: Veterinarian[] = allRegs
          .filter((u: any) => ['SECTOR_VET'].includes((u.role || '').toUpperCase()))
          .map((u: any) => ({
            id: u.id,
            fullName: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email,
            email: u.email,
            phone: u.phone,
            username: u.email,
            password: '********', // This is a placeholder, as it should not be stored in frontend state.
            role: (u.role || 'BASIC_VET').toLowerCase().replace('_', '-') as 'district-vet' | 'sector-vet',
            assignedLocation: {
              district: u.district || 'N/A',
              sector: (u.role || '').toUpperCase() === 'SECTOR_VET' ? (u.sector || 'N/A') : undefined,
            },
            dateOfRegistration: (u.createdAt ? new Date(u.createdAt).toISOString().slice(0,10) : 'N/A'),
            status: (u.status || 'APPROVED').toUpperCase() === 'APPROVED' ? 'active' : 'inactive',
            profile: {},
          }));
        setVeterinarians(vets);
        // Calculate and set national stats using real data
        const allBasicVets = allRegs.filter(v => (v.role || '').toUpperCase() === 'BASIC_VET');
        const allAppVets = allRegs.filter(v => ['BASIC_VET', 'SECTOR_VET', 'ADMIN'].includes((v.role || '').toUpperCase()));
        const districtsSet = new Set(allRegs.map(v => v.district).filter(Boolean));
        const sectorsSet = new Set(allRegs.filter(r => (r.role || '').toUpperCase() === 'SECTOR_VET').map(v => v.sector).filter(Boolean));
        const totalVaccinations = treatments.filter((t: any) => (t.diagnosisAndNotes || '').toLowerCase().includes('vaccin')).length;
        const totalTreatments = treatments.length;

        // Fetch license applications to compute accurate license stats
        let licenseApps: any[] = [];
        try {
          const licRes = await fetch(`${getApiUrl()}/api/v1/license-applications`, { headers: getAuthHeaders() });
          if (licRes.ok) {
            const licData = await licRes.json();
            licenseApps = Array.isArray(licData) ? licData : [];
            setLicenseApplications(licenseApps);
          }
        } catch (e) {
          console.warn('Failed to load license applications for analytics', e);
        }

        const activeLicenses = licenseApps.filter(l => (l.status || '').toUpperCase() === 'APPROVED').length;
        // treat approved licenses older than 365 days as expired for reporting purposes
        const expiredLicenses = licenseApps.filter(l => (l.status || '').toUpperCase() === 'APPROVED' && l.createdAt && (new Date(l.createdAt) < new Date(Date.now() - 365 * 24 * 60 * 60 * 1000))).length;

        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const newIn30Days = allAppVets.filter((v: any) => v.createdAt && new Date(v.createdAt) > thirtyDaysAgo).length;
        const monthlyGrowthPct = allAppVets.length > 0 ? Math.round((newIn30Days / allAppVets.length) * 100) : 0;

        setNationalStats({
          totalBasicVets: allBasicVets.length,
          totalVets: allAppVets.length,
          totalDistricts: districtsSet.size,
          totalSectors: sectorsSet.size,
          totalTreatments: totalTreatments,
          totalVaccinations: totalVaccinations,
          totalFieldsOfPractice: allFields.length,
          emergencyResponseRate: 1.8, // keep mocked for now
          monthlyGrowth: monthlyGrowthPct,
          pendingApplications: pending.length,
          activeLicenses: activeLicenses,
          expiredLicenses: expiredLicenses,
        });

      } catch (error) {
        console.error("Failed to load country data:", error);
        toast({
          title: "Error",
          description: "Failed to load country-wide statistics. Some data may be mocked.",
          variant: "destructive",
        });
      } finally {
        setLoadingRegistrations(false);
      }
    };

    loadCountryData();

    const loadLicenseApplications = async () => {
      setLoadingLicenses(true);
      try {
        const res = await fetch(`${getApiUrl()}/api/v1/license-applications`, { headers: getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          setLicenseApplications(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to load license applications:", error);
        toast({ title: "Error", description: "Could not load license applications.", variant: "destructive" });
      } finally {
        setLoadingLicenses(false);
      }
    };
    if (selectedTab === 'licenses') loadLicenseApplications();
  }, [toast, selectedTab]);



  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([]);

  // Map backend registrations to UI friendly objects for approvals tab
  const mapRoleToUi = (role: string) => {
    const upper = (role || '').toUpperCase();
    if (upper === 'BASIC_VET') return 'basic-vet';
    if (upper === 'SECTOR_VET') return 'sector-vet';
    if (upper === 'ADMIN') return 'district-vet';
    return 'basic-vet';
  };

  const mapStatusToUi = (status: string) => {
    const upper = (status || '').toUpperCase();
    if (upper === 'PENDING') return 'pending';
    if (upper === 'APPROVED') return 'approved';
    if (upper === 'REJECTED') return 'rejected';
    return 'under-review';
  };

  interface Registration {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    phone: string;
    role: string;
    workplace?: string;
    province?: string;
    district?: string;
    sector?: string;
    createdAt?: string;
    status?: string;
    degreeCert?: boolean;
    nationalIdCopy?: boolean;
    graduationYear?: string | number;
    graduationProgramFacility?: string;
    fieldOfGraduation?: string;
    license?: boolean;
    rejectionReason?: string;
    approvedBy?: string;
    rejectedBy?: string;
    approvedAt?: string;
    // add other fields as needed
  }

  const registrationCards = (registrations || []).map((r: Registration) => ({
    id: r.id,
    applicantName: `${r.firstName ?? ''} ${r.lastName ?? ''}`.trim() || r.email,
    applicantEmail: r.email,
    applicantPhone: r.phone,
    role: mapRoleToUi(r.role),
    FieldOfPractice: '',
    location: {
      province: r.province || 'N/A',
      district: r.district || 'N/A',
      sector: r.sector || 'N/A',
    },
    submittedDate: new Date(r.createdAt || Date.now()).toISOString().slice(0, 10),
    status: mapStatusToUi(r.status || ''),
    documents: {
      degree: Boolean(r.degreeCert),
      idDocument: Boolean(r.nationalIdCopy),
      experience: Boolean(r.graduationYear),
      license: Boolean(r.license),
      cv: false,
    },
    // Provide absolute URLs for document viewing (used via (app as any).documentPaths)
    documentPaths: {
      degree: r.degreeCert ? `${getApiUrl()}${r.degreeCert}` : undefined,
      id: r.nationalIdCopy ? `${getApiUrl()}${r.nationalIdCopy}` : undefined,
      license: r.license ? `${getApiUrl()}${r.license}` : undefined,
    },
    reviewNotes: r.rejectionReason || undefined,
    reviewer: r.approvedBy || r.rejectedBy || undefined,
    reviewDate: r.approvedAt || undefined,
    priority: 'medium' as const,
    yearsExperience: r.graduationYear ? Math.max(0, new Date().getFullYear() - Number(r.graduationYear)) : 0,
    previousWorkplace: r.workplace || undefined,
    graduationYear: r.graduationYear,
    graduationProgramFacility: r.graduationProgramFacility,
    fieldOfGraduation: r.fieldOfGraduation,
  } as VetApplication));

  const filteredVetApplications = registrationCards.filter(app => {
    const query = searchTerm.toLowerCase();
    const matchesSearch = app.applicantName.toLowerCase().includes(query) ||
                         app.applicantEmail.toLowerCase().includes(query) ||
                         app.location.district.toLowerCase().includes(query) ||
                         app.location.sector.toLowerCase().includes(query);
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    const isBasicVet = app.role === 'basic-vet';
    return matchesSearch && matchesStatus && isBasicVet;
  });

  const handleReviewApplication = () => {
    if (!selectedApplication || !reviewComment.trim()) {
      toast({
        title: "Error",
        description: "Please provide review comment",
        variant: "destructive"
      });
      return;
    }

    // In a real app, this would update the application status
    toast({
      title: "Review Submitted",
      description: `Application ${reviewDecision === 'approve' ? 'approved' : reviewDecision === 'reject' ? 'rejected' : 'requires additional documents'}`,
    });

    setReviewComment('');
    setReviewDecision('approve');
    setShowReviewModal(false);
    setSelectedApplication(null);
  };

  const handleUpdateLicenseStatus = async (id: string | number, status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'REQUIRES_DOCUMENTS', licenseNumber?: string) => {
    // normalize id
    const appId = String(id);

    try {
      const { apiPatch, apiDelete } = await import('../lib/api');

      if (status === 'REJECTED') {
        // allow passing rejection reason via licenseNumber param (from modal) or fallback to prompt
        const reason = (licenseNumber || '').trim() || prompt('Reason for rejection (required)') || '';
        if (!reason.trim()) {
          toast({ title: 'Reason required', description: 'Please provide a reason for rejection.', variant: 'destructive' });
          return;
        }

        // If backend expects deletion for rejection, call delete; otherwise call patch with status
        // We'll attempt a patch first; if the endpoint requires delete, fallback to delete.
        try {
          await apiPatch(`/api/v1/license-applications/${appId}/status`, { status: 'REJECTED', reviewNotes: reason });
        } catch (patchErr) {
          // fallback: delete application
          await apiDelete(`/api/v1/license-applications/${appId}`);
        }

        toast({ title: 'Rejected', description: 'Application has been rejected.' });
        // refresh list
        const res = await fetch(`${getApiUrl()}/api/v1/license-applications`, { headers: getAuthHeaders() });
        if (res.ok) setLicenseApplications(await res.json());
        setSelectedLicense(null);
        setShowLicenseReviewModal(false);
        setLicenseReviewNotes('');
        return;
      }

      // APPROVED / PENDING / REQUIRES_DOCUMENTS handling
      if (status === 'APPROVED') {
        // licenseNumber param is expected to be a string like 'VET-RW-2025-123'
        const payload: any = { status: 'APPROVED' };
        if (licenseNumber) payload.licenseNumber = licenseNumber;
        await apiPatch(`/api/v1/license-applications/${appId}/status`, payload);
        toast({ title: 'Approved', description: 'Application has been approved.' });
      } else if (status === 'PENDING') {
        await apiPatch(`/api/v1/license-applications/${appId}/status`, { status: 'PENDING' });
        toast({ title: 'Updated', description: 'Application moved to pending.' });
      } else if (status === 'REQUIRES_DOCUMENTS') {
        await apiPatch(`/api/v1/license-applications/${appId}/status`, { status: 'REQUIRES_DOCUMENTS' });
        toast({ title: 'Requested Documents', description: 'Applicant requested to provide additional documents.' });
      }

      // refresh license applications
      const res = await fetch(`${getApiUrl()}/api/v1/license-applications`, { headers: getAuthHeaders() });
      if (res.ok) setLicenseApplications(await res.json());
      setSelectedLicense(null);
      setShowLicenseReviewModal(false);
      setLicenseReviewNotes('');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Update failed';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'under-review':
        return <Badge variant="default"><Eye className="h-3 w-3 mr-1" />Under Review</Badge>;
      case 'approved':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'requires-documents':
        return <Badge variant="outline"><FileText className="h-3 w-3 mr-1" />Requires Documents</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium Priority</Badge>;
      case 'low':
        return <Badge variant="default">Low Priority</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'basic-vet':
        return <Badge variant="secondary">Basic Vet</Badge>;
      case 'sector-vet':
        return <Badge variant="default">Sector Vet</Badge>;
      case 'district-vet':
        return <Badge variant="default">District Vet</Badge>;
      case 'admin':
        return <Badge variant="destructive">Admin</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  // Veterinary Management Helper Functions
  const filteredVeterinarians = veterinarians.filter(vet => {
    if (vet.role !== 'sector-vet') return false;
    const matchesSearch = vet.fullName.toLowerCase().includes(vetSearchTerm.toLowerCase()) ||
                         vet.email.toLowerCase().includes(vetSearchTerm.toLowerCase()) ||
                         vet.phone.includes(vetSearchTerm);    
    const matchesStatus = vetFilterStatus === 'all' || vet.status === vetFilterStatus;
    const matchesSector = vetFilterSector === 'all' || vet.assignedLocation.sector === vetFilterSector;
    return matchesSearch && matchesStatus && matchesSector;
  });

  const getVetStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary"><X className="h-3 w-3 mr-1" />Inactive</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Add validation functions
  const validateNationalId = (nationalId: string): boolean => {
    return /^\d{16}$/.test(nationalId);
  };

  const validatePhoneNumber = (phone: string): boolean => {
    return /^\d{10}$/.test(phone);
  };

  // Veterinary Management CRUD Functions
  const addVeterinarian = async () => {
    // Add validation for National ID and Phone
    if (!vetFormData.fullName || !vetFormData.email || !vetFormData.phone || 
        !vetFormData.password || !vetFormData.district ||
        (vetFormData.role === 'sector-vet' && !vetFormData.sector)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Validate phone number format
    if (!validatePhoneNumber(vetFormData.phone)) {
      toast({
        title: "Validation Error",
        description: "Phone number must be exactly 10 digits.",
        variant: "destructive",
      });
      return;
    }

    // Validate national ID format
    if (!validateNationalId(vetFormData.nationalId)) {
      toast({
        title: "Validation Error",
        description: "National ID must be exactly 16 digits.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Map UI roles to backend roles
      const roleMap: Record<string, string> = {
        'district-vet': 'ADMIN',
        'sector-vet': 'SECTOR_VET',
      };
      const payload = {
        firstName: vetFormData.fullName.split(' ')[0] || vetFormData.fullName,
        lastName: vetFormData.fullName.split(' ').slice(1).join(' ') || '-',
        email: vetFormData.email,
        phone: vetFormData.phone,
        nationalId: vetFormData.nationalId,
        dateOfBirth: '1990-01-01',
        gender: 'male',
        password: vetFormData.password,
        province: 'N/A',
        district: vetFormData.district,
        sector: vetFormData.role === 'sector-vet' ? vetFormData.sector : 'Head Office',
        cell: 'N/A',
        village: 'N/A',
        role: roleMap[vetFormData.role] || 'SECTOR_VET',
      };

      const { apiPost, apiPatch } = await import('../lib/api');
      // Use public register endpoint to align with server DTO
      const created: any = await apiPost('/api/v1/register', payload);
      // Auto-approve sector vets immediately so they are not left pending
      try {
        if ((payload.role || '').toUpperCase() === 'SECTOR_VET' && created && created.id) {
          await apiPatch(`/api/v1/register/${created.id}/approve`);
        }
      } catch {
        // If approval fails, proceed; user will remain pending
      }

      toast({
        title: 'Success',
        description: `${vetFormData.role === 'district-vet' ? 'District' : 'Sector'} veterinarian created`,
      });
    } catch (err: unknown) {
      let message = 'Failed to create user';
      if (err instanceof Error) {
        message = err.message;
      }
      toast({ title: 'Error', description: message, variant: 'destructive' });
      return;
    }

    setShowAddVetModal(false);
    setVetFormData({
      fullName: '',
      email: '',
      phone: '',
      nationalId: '',
      password: '',
      role: 'district-vet',
      district: 'Huye',
      sector: ''
    });
  };

  const updateVeterinarian = async () => {
    if (!editingVet) return;

    if (!vetFormData.fullName || !vetFormData.email || !vetFormData.phone || 
        !vetFormData.district ||
        (vetFormData.role === 'sector-vet' && !vetFormData.sector)) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    try {
      const [firstName, ...rest] = vetFormData.fullName.trim().split(' ');
      const lastName = rest.join(' ') || '-';
      const payload: any = {
        firstName,
        lastName,
        email: vetFormData.email,
        phone: vetFormData.phone,
        nationalId: vetFormData.nationalId,
        district: vetFormData.district,
        sector: vetFormData.role === 'sector-vet' ? vetFormData.sector : undefined,
        role: vetFormData.role === 'sector-vet' ? 'SECTOR_VET' : 'DISTRICT_VET',
      };
      if (vetFormData.password) payload.password = vetFormData.password;

      const { apiPatch } = await import('../lib/api');
      await apiPatch(`/api/v1/register/${editingVet.id}`, payload);

      const allRegs = await loadBasicVets();
      setRegistrations(allRegs || []);

      toast({ title: 'Success', description: `Veterinarian ${vetFormData.fullName} has been updated successfully.` });
      setShowAddVetModal(false);
      setEditingVet(null);
      setVetFormData({
        fullName: '',
        email: '',
        phone: '',
        nationalId: '',
        password: '',
        role: 'district-vet',
        district: 'Huye',
        sector: ''
      });
    } catch (e: any) {
      toast({ title: 'Update failed', description: e?.message || 'Could not update veterinarian', variant: 'destructive' });
    }
  };

  const deleteVeterinarian = async (vetId: string) => {
    const vet = veterinarians.find(v => v.id === vetId);
    if (!vet) return;

    if (!window.confirm(`Are you sure you want to delete ${vet.fullName}? This action cannot be undone.`)) return;

    try {
      const { apiDelete } = await import('../lib/api');
      await apiDelete(`/api/v1/register/${vetId}`);
      const allRegs = await loadBasicVets();
      setRegistrations(allRegs || []);
      toast({ title: 'Deleted', description: `Veterinarian ${vet.fullName} has been deleted successfully.` });
    } catch (e: any) {
      toast({ title: 'Delete failed', description: e?.message || 'Could not delete veterinarian', variant: 'destructive' });
    }
  };

  const exportVeterinarians = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Role', 'District', 'Sector', 'Status', 'Registration Date', 'FieldOfPractice', 'Experience'],
      ...filteredVeterinarians.map(vet => [
        vet.fullName,
        vet.email,
        vet.phone,
        vet.role.replace('-', ' ').toUpperCase(),
        vet.assignedLocation.district,
        vet.assignedLocation.sector || 'N/A',
        vet.status,
        vet.dateOfRegistration,
        vet.profile.FieldOfPractice || 'N/A',
        vet.profile.yearsExperience?.toString() || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `veterinarians_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Successful",
      description: `Veterinarians data has been exported successfully.`,
    });
  };

  const exportReports = () => {
    if (!reports || reports.length === 0) {
      toast({ title: 'No reports', description: 'There are no reports to export.' });
      return;
    }

    const headers = ['ID', 'Title', 'Report Type', 'Submitted By', 'District', 'Sector', 'Status', 'Submitted Date', 'Content'];
    const rows = reports.map(r => ([
      r.id,
      `"${(r.title || '').replace(/"/g, '""')}"`,
      r.reportType,
      r.submitter && typeof r.submitter === 'object' ? `${(r.submitter.firstName || '')} ${(r.submitter.lastName || '')}`.trim() : (r.submittedBy || ''),
      r.district,
      r.sector,
      (r.countryStatus || r.status) || '',
      new Date(r.createdAt).toLocaleDateString(),
      `"${(r.content || '').replace(/"/g, '""')}"`
    ]));

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `reports_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: 'Export Successful', description: 'Reports exported successfully.' });
  };

  const exportReport = (report: any) => {
    if (!report) return;
    const headers = ['ID', 'Title', 'Report Type', 'Submitted By', 'District', 'Sector', 'Status', 'Submitted Date', 'Content'];
    const row = [
      report.id,
      `"${(report.title || '').replace(/"/g, '""')}"`,
      report.reportType,
      report.submitter && typeof report.submitter === 'object' ? `${(report.submitter.firstName || '')} ${(report.submitter.lastName || '')}`.trim() : (report.submittedBy || ''),
      report.district,
      report.sector,
      (report.countryStatus || report.status) || '',
      new Date(report.createdAt).toLocaleDateString(),
      `"${(report.content || '').replace(/"/g, '""')}"`
    ];

    const csvContent = [headers, row].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `report_${report.id}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({ title: 'Export Successful', description: `Report ${report.id} exported.` });
  };

  const getVetRoleBadge = (role: string) => {
    switch (role) {
      case 'district-vet':
        return <Badge variant="default"><Building2 className="h-3 w-3 mr-1" />District Vet</Badge>;
      case 'sector-vet':
        return <Badge variant="secondary"><MapPin className="h-3 w-3 mr-1" />Sector Vet</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const handleAddVeterinarian = async () => {
    if (!vetFormData.fullName || !vetFormData.email || !vetFormData.phone || !vetFormData.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (vetFormData.role === 'sector-vet' && !vetFormData.sector) {
      toast({
        title: "Error",
        description: "Please select a sector for sector veterinarian",
        variant: "destructive"
      });
      return;
    }

    await addVeterinarian();

    // Reset form
    setVetFormData({
      fullName: '',
      email: '',
      phone: '',
      nationalId: '',
      password: '',
      role: 'district-vet',
      district: 'Huye',
      sector: ''
    });
    setShowAddVetModal(false);
  };

  const handleUpdateVeterinarian = () => {
    if (!editingVet) return;

    // In a real app, this would update the veterinarian
    toast({
      title: "Success",
      description: "Veterinarian updated successfully",
    });

    setEditingVet(null);
  };

  const handleDeleteVeterinarian = (vetId: string) => {
    // In a real app, this would delete the veterinarian
    toast({
      title: "Success",
      description: "Veterinarian deleted successfully",
    });
  };

  const handleToggleVetStatus = (vetId: string, currentStatus: string) => {
    // In a real app, this would toggle the veterinarian status
    toast({
      title: "Success",
      description: `Veterinarian ${currentStatus === 'active' ? 'deactivated' : 'activated'} successfully`,
    });
  };

  const getSectorsForDistrict = (districtId: string) => {
    const district = districts.find(d => d.id === districtId);
    return district ? district.sectors : [];
  };

  const [limitMsgPhone, setLimitMsgPhone] = useState('');
  const [limitMsgId, setLimitMsgId] = useState('');

  const [registrationOpen, setRegistrationOpen] = useState(() => localStorage.getItem('registrationOpen') === 'true');
  const handleRegistrationToggle = () => {
    const newState = !registrationOpen;
    setRegistrationOpen(newState);
    localStorage.setItem('registrationOpen', newState ? 'true' : 'false');
  };

  // --- Field of Practice state and handlers ---
  const [fields, setFields] = useState<any[]>([]);
  const [fieldsLoading, setFieldsLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEdit, setCurrentEdit] = useState<any|null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState<number|null>(null);
  const [fieldNameInput, setFieldNameInput] = useState('');

  const loadFields = async () => {
    setFieldsLoading(true);
    try {
      const all = await apiGet('/api/v1/field-of-practice');
      setFields(Array.isArray(all) ? all : []);
    } catch (e: any) {
      toast({title: 'Error', description: e.message, variant: 'destructive'});
    }
    setFieldsLoading(false);
  };
  useEffect(() => {
    if (selectedTab === 'field-of-practice') loadFields();
  }, [selectedTab]);

  const handleAddNew = async () => {
    const rawName = fieldNameInput.trim();
    if (!rawName) {
      toast({ title: 'Validation', description: 'Name is required', variant: 'destructive' });
      return;
    }
    // Prevent duplicates (case-insensitive)
    const exists = fields.some(f => String(f.name || '').toLowerCase() === rawName.toLowerCase());
    if (exists) {
      toast({ title: 'Already exists', description: 'This field of practice already exists.', variant: 'destructive' });
      return;
    }
    try {
      // Normalize name to Title Case
      const name = rawName.replace(/\s+/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
      await apiPost('/api/v1/field-of-practice', { name });
      setShowAddModal(false);
      setFieldNameInput('');
      toast({ title: 'Success', description: 'Field added' });
      loadFields();
    } catch (e: any) {
      // Provide clearer error when server rejects duplicates or bad input
      const msg = typeof e?.message === 'string' ? e.message : 'Failed to add field';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    }
  };
  const handleEditField = async () => {
    if (!fieldNameInput.trim() || !currentEdit) {
      toast({ title: 'Validation', description: 'Name is required', variant: 'destructive' });
      return;
    }
    try {
      await apiPatch(`/api/v1/field-of-practice/${currentEdit.id}`, { name: fieldNameInput });
      setShowEditModal(false);
      setFieldNameInput('');
      setCurrentEdit(null);
      toast({ title: 'Success', description: 'Field updated' });
      loadFields();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };
  const handleDeleteField = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this field of practice?')) return;
    setDeleteInProgress(id);
    try {
      await apiDelete(`/api/v1/field-of-practice/${id}`);
      toast({ title: 'Success', description: 'Field deleted' });
      loadFields();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
    setDeleteInProgress(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Header */}
      <section className="bg-gradient-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">Huye District Veterinary Dashboard</h1>
              <p className="text-primary-foreground/90">Huye District Veterinary Administration</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">
                <Building2 className="h-3 w-3 mr-1" />
                Huye District Level
              </Badge>
              {currentUser?.email && (
                <UserProfileDropdown
                  userEmail={currentUser.email}
                  userName={currentUser.firstName && currentUser.lastName 
                    ? `${currentUser.firstName} ${currentUser.lastName}` 
                    : undefined}
                  onLogout={handleLogout}
                  onUpdateProfile={() => setShowProfileModal(true)}
                  passportPhotoUrl={currentUser.passportPhoto}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
  {/* Inline Document Preview Modal */}
  {previewUrl && (
    <Dialog open={!!previewUrl} onOpenChange={(open) => { if (!open) { setPreviewUrl(null); setPreviewType(null); setPreviewTitle(''); } }}>
      <DialogContent className="max-w-5xl w-[95vw] h-[85vh]">
        <DialogHeader>
          <DialogTitle>{previewTitle}</DialogTitle>
          <DialogDescription>Document preview</DialogDescription>
        </DialogHeader>
        <div className="w-full h-full">
          {previewType === 'pdf' && (
            <iframe src={`${previewUrl}#toolbar=1`} className="w-full h-[70vh]" title="Document Preview"></iframe>
          )}
          {previewType === 'image' && (
            <img src={previewUrl} alt={previewTitle} className="max-h-[75vh] w-auto mx-auto object-contain" />
          )}
          {previewType === 'other' && (
            <div className="text-sm text-muted-foreground">
              Preview not available.
              <a className="text-primary underline ml-1" href={previewUrl} target="_blank" rel="noreferrer">Open in new tab</a>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="approvals">Vet Approvals</TabsTrigger>
            <TabsTrigger value="licenses">License Approvals</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="veterinary-management">Vet Management</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="registration">Registration</TabsTrigger>
            <TabsTrigger value="field-of-practice">Field of Practice</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}

            {/* Performance Metrics */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-l-4 border-l-blue-500 cursor-pointer hover:bg-muted/30 transition"
                onClick={() => setSelectedTab('veterinary-management')}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Active Sectors</CardTitle>
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{nationalStats.totalSectors}</div>
                  <p className="text-xs text-muted-foreground">Sectors with active vets</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-green-500 cursor-pointer hover:bg-muted/30 transition"
                onClick={() => { setFilterStatus('all'); setSearchTerm(''); setSelectedTab('approvals'); }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Basic Vets</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{nationalStats.totalBasicVets}</div>
                  <p className="text-xs text-muted-foreground">Registered basic veterinarians</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-yellow-500 cursor-pointer hover:bg-muted/30 transition"
                onClick={() => { setFilterStatus('pending'); setSearchTerm(''); setSelectedTab('approvals'); }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{nationalStats.pendingApplications}</div>
                  <p className="text-xs text-muted-foreground">New vet applications</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <span>Recent Huye district Activities</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {registrationCards.filter(a => a.role === 'basic-vet' && a.status === 'pending').slice(0, 3).map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{app.role.replace('-', ' ').toUpperCase()} Application - {app.location.district}</h4>
                        <p className="text-sm text-muted-foreground">
                          {app.applicantName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Location: {app.location.province} {'>'} {app.location.district} {'>'} {app.location.sector}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        {getStatusBadge(app.status)}
                        {getPriorityBadge(app.priority)}
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedApplication(app);
                            setSelectedTab('approvals');
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Vet Approvals Tab */}
          <TabsContent value="approvals" className="space-y-6">
            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>Comprehensive Veterinarian Approval Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <Label htmlFor="search">Search Applications</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Search by name, FieldOfPractice, or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-48">
                    <Label htmlFor="status-filter">Status Filter</Label>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger id="status-filter">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Applications Grid */}
                <div className="space-y-4">
                  {(!loadingRegistrations ? filteredVetApplications : []).map((app) => (
                    <Card key={app.id} className="hover:shadow-md transition-shadow border-l-4 border-l-primary">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <div>
                                <h3 className="text-lg font-semibold">{app.applicantName}</h3>
                                <p className="text-sm text-muted-foreground">{app.applicantEmail}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                {getStatusBadge(app.status)}
                                {getPriorityBadge(app.priority)}
                                {getRoleBadge(app.role)}
                              </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-6 mb-4">
                              <div className="space-y-3">
                                <h4 className="font-medium text-primary">Professional Information</h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Graduation Year:</span>
                                    <span className="font-medium">{app.graduationYear || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Program/Facility:</span>
                                    <span className="font-medium">{app.graduationProgramFacility || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Field of Graduation:</span>
                                    <span className="font-medium">{app.fieldOfGraduation || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Workplace:</span>
                                    <span className="font-medium">{app.previousWorkplace || 'N/A'}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                <h4 className="font-medium text-primary">Location</h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Province:</span>
                                    <span>{app.location.province}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">District:</span>
                                    <span>{app.location.district}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Sector:</span>
                                    <span>{app.location.sector}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Document Status */}
                            <div className="mb-4">
                              <h4 className="font-medium mb-2">Document Status</h4>
                              <div className="grid grid-cols-3 gap-2">
                                <div className={`text-center p-2 rounded ${app.documents.degree ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  <div className="text-xs font-medium">Degree</div>
                                  <div className="text-xs flex items-center justify-center gap-2">
                                    <span>{app.documents.degree ? '✓' : '✗'}</span>
                                    {app.documents.degree && (app as any).documentPaths?.degree && (
                                      <Button size="sm" variant="outline" onClick={() => openDocumentPreview((app as any).documentPaths.degree, 'Degree Certificate')}>View</Button>
                                    )}
                                  </div>
                                </div>
                                <div className={`text-center p-2 rounded ${app.documents.idDocument ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  <div className="text-xs font-medium">ID</div>
                                  <div className="text-xs flex items-center justify-center gap-2">
                                    <span>{app.documents.idDocument ? '✓' : '✗'}</span>
                                    {app.documents.idDocument && (app as any).documentPaths?.id && (
                                      <Button size="sm" variant="outline" onClick={() => openDocumentPreview((app as any).documentPaths.id, 'ID Document')}>View</Button>
                                    )}
                                  </div>
                                </div>
                                <div className={`text-center p-2 rounded ${app.documents.license ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  <div className="text-xs font-medium">Payment Receipt</div>
                                  <div className="text-xs flex items-center justify-center gap-2">
                                    <span>{app.documents.license ? '✓' : '✗'}</span>
                                    {app.documents.license && (app as any).documentPaths?.license && (
                                      <Button size="sm" variant="outline" onClick={() => openDocumentPreview((app as any).documentPaths.license, 'License Document')}>View</Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="text-sm text-muted-foreground">
                              Submitted: {app.submittedDate}
                            </div>
                          </div>

                          <div className="flex flex-col space-y-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedApplication(app)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            {app.status === 'pending' && (
                              <div className="flex flex-col space-y-2">
                                <Button size="sm" variant="default" onClick={async () => {
                                  try {
                                    const { apiPatch, apiGet } = await import('../lib/api');
                                    await apiPatch(`/api/v1/admin/register/${app.id}/approve`);
                                    const allRegs = await loadBasicVets();
                                    setRegistrations(allRegs || []);
                                    const pending = (allRegs || []).filter((r: Registration) => (r.status || '').toUpperCase() === 'PENDING');
                                    setPendingRegistrations(pending);
                                    setNationalStats((s) => ({ ...s, pendingApplications: pending.length }));
                                    toast({ title: 'Approved', description: 'Application has been approved' });
                                  } catch (e: unknown) {
                                    let message = 'Approval failed';
                                    if (e instanceof Error) message = e.message;
                                    toast({ title: 'Error', description: message, variant: 'destructive' });
                                  }
                                }}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                            </Button>
                                <Button size="sm" variant="destructive" onClick={async () => {
                                  try {
                                    const reason = prompt('Reason for rejection (required)');
                                    if (!reason || !reason.trim()) {
                                      toast({ title: 'Reason required', description: 'Please provide a reason to reject this application.', variant: 'destructive' });
                                      return;
                                    }
                                    const { apiDelete } = await import('../lib/api');
                                    await apiDelete(`/api/v1/register/${app.id}`);
                                    const allRegs = await loadBasicVets();
                                    setRegistrations(allRegs || []);
                                    const pending = (allRegs || []).filter((r: Registration) => (r.status || '').toUpperCase() === 'PENDING');
                                    setPendingRegistrations(pending);
                                    setNationalStats((s) => ({ ...s, pendingApplications: pending.length }));
                                    toast({ title: 'Rejected', description: 'Application has been rejected and deleted' });
                                  } catch (e: unknown) {
                                    let message = 'Rejection failed';
                                    if (e instanceof Error) message = e.message;
                                    toast({ title: 'Error', description: message, variant: 'destructive' });
                                  }
                                }}>
                                  <AlertTriangle className="h-4 w-4 mr-2" />
                                  Reject
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {!loadingRegistrations && registrations.length > 0 && filteredVetApplications.length === 0 && (
                    <div className="text-sm text-muted-foreground p-4">No applications match your filters.</div>
                  )}
                  {!loadingRegistrations && registrations.length === 0 && (
                    <div className="text-sm text-muted-foreground p-4">No Basic Vet registrations found.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* License Approvals Tab */}
          <TabsContent value="licenses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-primary" />
                  <span>License Application Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* License Summary */}
                  <div className="grid md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{loadingLicenses ? '...' : licenseApplications.length}</div>
                      <p className="text-sm text-muted-foreground">Total Applications</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-secondary">
                        {loadingLicenses ? '...' : licenseApplications.filter(l => l.status === 'PENDING').length}
                      </div>
                      <p className="text-sm text-muted-foreground">Pending Review</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {loadingLicenses ? '...' : licenseApplications.filter(l => l.status === 'APPROVED').length}
                      </div>
                      <p className="text-sm text-muted-foreground">Approved</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">0</div>
                      <p className="text-sm text-muted-foreground">Under Review</p>
                    </div>
                  </div>

                  {/* License Applications */}
                  <div className="space-y-4">
                    {licenseApplications.map((license) => (
                      <Card key={license.id} className="hover:shadow-md transition-shadow border-l-4 border-l-accent">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-3">
                                <div>
                                  <h3 className="text-lg font-semibold">{license.vet.firstName} {license.vet.lastName}</h3>
                                  <p className="text-sm text-muted-foreground">{license.vet.role.replace('_', ' ')}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Badge variant={
                                    license.status === 'APPROVED' ? 'default' : 
                                    license.status === 'PENDING' ? 'secondary' : 
                                    'destructive'
                                  }>
                                    {license.status}
                                  </Badge>
                                  <Badge variant="outline">{license.licenseType}</Badge>
                                </div>
                              </div>
                              
                              <div className="grid md:grid-cols-2 gap-6 mb-4">
                                <div className="space-y-3">
                                  <h4 className="font-medium text-primary">License Details</h4>
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Type:</span>
                                      <span className="font-medium">{license.licenseType}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">FieldOfPractice:</span>
                                    <span className="font-medium">{license.fieldOfPractice}</span>
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="space-y-3">
                                  <h4 className="font-medium text-primary">Document Status</h4>
                                  <div className="space-y-2">
                                    {license.paymentReceiptUrl && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Payment Receipt:</span>
                                        <Button size="xs" variant="link" onClick={() => openDocumentPreview(`${getApiUrl()}${license.paymentReceiptUrl}`, 'Payment Receipt')}>View</Button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {license.status === 'APPROVED' && (
                                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium text-green-800">License Number:</span>
                                    <span className="font-bold text-green-800">VET-RW-{license.id}</span>
                                  </div>
                                </div>
                              )}

                              <div className="text-sm text-muted-foreground">
                                Submitted: {new Date(license.createdAt).toLocaleDateString()}
                              </div>
                            </div>

                            <div className="flex flex-col space-y-2 ml-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedLicense(license)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                              {license.status === 'PENDING' && (
                                <>
                                  <Button size="sm" variant="default" onClick={() => {
                                    const year = new Date().getFullYear();
                                    const licenseNumber = `VET-RW-${year}-${license.id}`;
                                    handleUpdateLicenseStatus(license.id, 'APPROVED', licenseNumber);
                                  }}>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                  </Button>
                                  <Button size="sm" variant="destructive" onClick={() => handleUpdateLicenseStatus(license.id, 'REJECTED')}>
                                    <AlertTriangle className="h-4 w-4 mr-2" />
                                    Reject
                                  </Button>
                                </>
                              )}
                              {license.status === 'REQUIRES_DOCUMENTS' && (
                                <Button size="sm" variant="secondary" onClick={() => handleUpdateLicenseStatus(license.id, 'PENDING', undefined)}>
                                  <Clock className="h-4 w-4 mr-2" />
                                  Move to Pending
                                </Button>
                              )}

                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {loadingLicenses && <p className="text-muted-foreground">Loading applications...</p>}
                    {!loadingLicenses && licenseApplications.length === 0 && <p className="text-muted-foreground">No license applications found.</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <CardTitle>Huye Veterinary Reports & Analytics</CardTitle>
                  </div>
                  <div>
                    <Button variant="outline" onClick={() => exportReports()}>
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Report Summary */}
                  <div className="grid md:grid-cols-4 gap-4 p-4 bg-muted rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{reports.length}</div>
                      <p className="text-sm text-muted-foreground">Total Reports</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-secondary">
                        {reports.filter(r => r.status === 'PENDING').length}
                      </div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {reports.filter(r => r.status === 'APPROVED' || r.countryStatus === 'APPROVED').length}
                      </div>
                      <p className="text-sm text-muted-foreground">Approved</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {reports.filter(r => r.status === 'REVIEWED' || r.countryStatus === 'REVIEWED').length}
                      </div>
                      <p className="text-sm text-muted-foreground">Under Review</p>
                    </div>
                  </div>

                  {/* National Reports */}
                  <div className="space-y-4">
                    {loadingReports ? (
                      <p className="text-muted-foreground">Loading reports...</p>
                    ) : reports.length === 0 ? (
                      <p className="text-muted-foreground">No reports found from District Vets.</p>
                    ) : (
                      reports.map((report) => (
                        <Card key={report.id} className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-3">
                                  <div>
                                    <h3 className="text-lg font-semibold">{report.title}</h3>
                                    <p className="text-sm text-muted-foreground">
                                      Submitted by {report.submitter.firstName} {report.submitter.lastName} ({report.submitter.role})
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {report.district} District, {report.sector} Sector
                                    </p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Badge variant={
                                      (report.countryStatus || report.status) === 'APPROVED' ? 'default' : 
                                      (report.countryStatus || report.status) === 'PENDING' ? 'secondary' : 
                                      (report.countryStatus || report.status) === 'REVIEWED' ? 'default' : 'outline'
                                    }>
                                      {report.countryStatus || report.status}
                                    </Badge>
                                    <Badge variant="outline">{report.reportType}</Badge>
                                  </div>
                                </div>
                                
                                {/* Report Content Preview */}
                                <div className="mb-4 p-3 bg-muted rounded-lg">
                                  <p className="text-sm text-muted-foreground line-clamp-3">{report.content}</p>
                                </div>

                                {/* Attachments */}
                                {report.attachments && (
                                  <div className="mb-4">
                                    <h4 className="font-medium mb-2">Attachments</h4>
                                    <Badge variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                                      <FileText className="h-3 w-3 mr-1" />
                                      {report.attachments}
                                    </Badge>
                                  </div>
                                )}

                                {/* Review Information */}
                                {report.countryVetNotes && (
                                  <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                                    <h4 className="font-medium text-primary mb-2">Country Vet Notes</h4>
                                    <p className="text-sm text-primary">{report.countryVetNotes}</p>
                                    {report.countryReviewedAt && (
                                      <div className="text-xs text-primary/70 mt-2">
                                        Reviewed on {new Date(report.countryReviewedAt).toLocaleDateString()}
                                      </div>
                                    )}
                                  </div>
                                )}

                                <div className="text-sm text-muted-foreground">
                                  Submitted: {new Date(report.createdAt).toLocaleDateString()}
                                </div>
                              </div>

                              <div className="flex flex-col space-y-2 ml-4">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openReportReviewModal(report)}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => exportReport(report)}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Export
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Veterinary Management Tab */}
          <TabsContent value="veterinary-management" className="space-y-6">
            {/* Veterinary Management Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <UserPlus className="h-5 w-5 text-primary" />
                    <CardTitle>Veterinary Management System</CardTitle>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      onClick={() => {
                        setVetFormData({
                          fullName: '',
                          email: '',
                          phone: '',
                          nationalId: '',
                          password: '',
                          role: 'district-vet',
                          district: 'Huye',
                          sector: '',
                           });
                        setEditingVet(null);
                        setShowAddVetModal(true);
                      }}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Sector_Vet
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => exportVeterinarians()}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Comprehensive management of veterinarians at District and Sector levels. Add, update, delete, and monitor all veterinary personnel across the country.
                </p>
              </CardContent>
            </Card>

            {/* Search and Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5 text-primary" />
                  <span>Search & Filter Veterinarians</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="vet-search">Search Veterinarians</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="vet-search"
                        placeholder="Search by name, email, or location..."
                        value={vetSearchTerm}
                        onChange={(e) => setVetSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="vet-status-filter">Status Filter</Label>
                    <Select value={vetFilterStatus} onValueChange={setVetFilterStatus}>
                      <SelectTrigger id="vet-status-filter">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="vet-sector-filter">Sector Filter</Label>
                    <Select value={vetFilterSector} onValueChange={setVetFilterSector}>
                      <SelectTrigger id="vet-sector-filter">
                        <SelectValue placeholder="All Sectors" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Sectors</SelectItem>
                        {(districts.find(d => d.name === 'Huye')?.sectors ?? []).map((sector) => (
                          <SelectItem key={sector.id} value={sector.name}>
                            {sector.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Veterinarians Table */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span>Veterinarians Directory</span>
                  </div>
                  <Badge variant="outline" className="text-sm">
                    {filteredVeterinarians.length} Total
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredVeterinarians.map((vet) => (
                    <Card key={vet.id} className="hover:shadow-md transition-shadow border-l-4 border-l-primary">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <div>
                                <h3 className="text-lg font-semibold">{vet.fullName}</h3>
                                <p className="text-sm text-muted-foreground">{vet.email}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant={vet.status === 'active' ? 'default' : 'secondary'}>
                                  {vet.status}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-6 mb-4">
                              <div className="space-y-3">
                                <h4 className="font-medium text-primary">Contact Information</h4>
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{vet.email}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">{vet.phone}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <User className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">@{vet.username}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                <h4 className="font-medium text-primary">Assignment</h4>
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">
                                      {vet.assignedLocation.district}
                                      {vet.assignedLocation.sector && ` > ${vet.assignedLocation.sector}`}
                      </span>                      
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm">Registered: {vet.dateOfRegistration}</span>
                                  </div>
                                  {vet.profile.FieldOfPractice && (
                                    <div className="flex items-center space-x-2">
                                      <Award className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm">{vet.profile.FieldOfPractice}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            {vet.profile.yearsExperience && (
                              <div className="mb-4">
                                <div className="flex items-center space-x-2">
                                  <Star className="h-4 w-4 text-muted-foreground" />
                                  <span className="text-sm text-muted-foreground">
                                    {vet.profile.yearsExperience} years of experience
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col space-y-2 ml-4">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedVet(vet);
                                setShowVetProfileModal(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Profile
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingVet(vet);
                                setVetFormData({
                                  fullName: vet.fullName,
                                  email: vet.email,
                                  phone: vet.phone,
                                  password: vet.password,
                                  role: vet.role,
                                  district: vet.assignedLocation.district,
                                  sector: vet.assignedLocation.sector || ''
                                });
                                setShowAddVetModal(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteVeterinarian(vet.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  {filteredVeterinarians.length === 0 && (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />                      
                      <h3 className="text-lg font-medium text-muted-foreground mb-2">No veterinarians found</h3>
                      <p className="text-muted-foreground mb-4">                        
                        {vetSearchTerm || vetFilterStatus !== 'all' || vetFilterSector !== 'all'
                          ? 'Try adjusting your search criteria or filters.'
                          : 'Get started by adding your first veterinarian.'}
                      </p>
                      {!vetSearchTerm && vetFilterStatus === 'all' && vetFilterSector === 'all' && (
                        <Button 
                          onClick={() => {
                            setVetFormData({
                              fullName: '',
                              email: '',
                              phone: '',
                              nationalId: '',
                              password: '',
                              role: 'district-vet',
                              district: 'Huye',
                              sector: '',
                             
                            });
                            setEditingVet(null);
                            setShowAddVetModal(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add New Sector_Vet
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <span>Comprehensive National Veterinary Analytics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Analytics Overview */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="border-l-4 border-l-primary">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">National Growth</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-primary">+{nationalStats.monthlyGrowth}%</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Performance Metrics */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Target className="h-5 w-5 text-primary" />
                          <span>Field of Practice</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span>Total Field of Practice</span>
                            <span className="font-bold text-primary">{nationalStats.totalFieldsOfPractice.toLocaleString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Users className="h-5 w-5 text-primary" />
                          <span>Veterinarian Distribution</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span>Total Active Vets</span>
                            <span className="font-bold text-primary">{nationalStats.totalVets.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full" style={{ width: '100%' }}></div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span>Districts Covered</span>
                            <span className="font-bold text-secondary">{nationalStats.totalDistricts}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-secondary h-2 rounded-full" style={{ width: '100%' }}></div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span>Sectors Active</span>
                            <span className="font-bold text-orange-600">{nationalStats.totalSectors}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-orange-600 h-2 rounded-full" style={{ width: '95%' }}></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Application & License Analytics */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <ClipboardList className="h-5 w-5 text-primary" />
                          <span>Application Status Overview</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span>Pending Applications</span>
                            <span className="font-bold text-warning">{nationalStats.pendingApplications}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-warning h-2 rounded-full" style={{ width: '15%' }}></div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span>Active Licenses</span>
                            <span className="font-bold text-green-600">{nationalStats.activeLicenses.toLocaleString()}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span>Expired Licenses</span>
                            <span className="font-bold text-red-600">{nationalStats.expiredLicenses}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-red-600 h-2 rounded-full" style={{ width: '5%' }}></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <PieChart className="h-5 w-5 text-primary" />
                          <span>Geographic Distribution</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span>South Province</span>
                            <span className="font-bold text-primary">45%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full" style={{ width: '45%' }}></div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span>Huye District</span>
                            <span className="font-bold text-secondary">25%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-secondary h-2 rounded-full" style={{ width: '25%' }}></div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span>Sectors </span>
                            <span className="font-bold text-orange-600">5%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div className="bg-orange-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Export & Actions */}
                  
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Registration Tab */}
          <TabsContent value="registration" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Registration Control</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm mb-2">
                    Registration page is currently <span className={registrationOpen ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{registrationOpen ? 'OPEN' : 'CLOSED'}</span> for new users in this district.
                  </p>
                  <Button onClick={handleRegistrationToggle} variant={registrationOpen ? 'destructive' : 'default'}>
                    {registrationOpen ? 'Close Registration' : 'Open Registration'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Field of Practice Tab */}
          <TabsContent value="field-of-practice" className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Fields of Practice</h2>
                <Button size="sm" onClick={() => { setFieldNameInput(''); setShowAddModal(true); }}>+ Add New</Button>
              </div>
              <div className="bg-white rounded shadow-md p-2 w-full max-w-lg mx-auto">
                {fieldsLoading ? (
                  <div className="p-4 text-center text-muted-foreground">Loading...</div>
                ) : fields.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">No Fields of Practice found.</div>
                ) : (
                  <table className="w-full text-sm border-collapse">
                    <thead><tr className="bg-muted"><th className="py-2 px-4 text-left">Name</th><th className="py-2 px-4 text-center">Actions</th></tr></thead>
                    <tbody>
                      {fields.map((field: any) => (
                        <tr key={field.id} className="border-b last:border-b-0">
                          <td className="py-2 px-4">{field.name}</td>
                          <td className="py-2 px-4 text-center">
                            <Button variant="outline" size="sm" className="mr-2" onClick={() => { setCurrentEdit(field); setFieldNameInput(field.name); setShowEditModal(true); }}><span className="sr-only">Edit</span>✏️</Button>
                            <Button variant="outline" size="sm" disabled={deleteInProgress === field.id} className="text-red-600" onClick={() => handleDeleteField(field.id)}><span className="sr-only">Delete</span>🗑️</Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              {/* Add Modal */}
              <Dialog open={showAddModal} onOpenChange={v => setShowAddModal(v)}>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add Field of Practice</DialogTitle></DialogHeader>
                  <form onSubmit={e => { e.preventDefault(); handleAddNew(); }}>
                    <Label>Name</Label>
                    <Input value={fieldNameInput} onChange={e => setFieldNameInput(e.target.value)} autoFocus required className="mb-4" />
                    <div className="flex justify-end">
                      <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} className="mr-2">Cancel</Button>
                      <Button type="submit" variant="default">Add</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              {/* Edit Modal */}
              <Dialog open={showEditModal} onOpenChange={v => { setShowEditModal(v); if (!v) { setCurrentEdit(null); setFieldNameInput(''); }}}>
                <DialogContent>
                  <DialogHeader><DialogTitle>Edit Field of Practice</DialogTitle></DialogHeader>
                  <form onSubmit={e => { e.preventDefault(); handleEditField(); }}>
                    <Label>Name</Label>
                    <Input value={fieldNameInput} onChange={e => setFieldNameInput(e.target.value)} autoFocus required className="mb-4" />
                    <div className="flex justify-end">
                      <Button type="button" variant="outline" onClick={() => setShowEditModal(false)} className="mr-2">Cancel</Button>
                      <Button type="submit" variant="default">Save</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedApplication && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border rounded-lg shadow-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">Review Application - {selectedApplication.applicantName}</h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowReviewModal(false)}
              >
                Close
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="review-decision">Review Decision</Label>
                <Select value={reviewDecision} onValueChange={(value: 'approve' | 'reject' | 'request-documents') => setReviewDecision(value)}>
                  <SelectTrigger id="review-decision">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="approve">Approve Application</SelectItem>
                    <SelectItem value="reject">Reject Application</SelectItem>
                    <SelectItem value="request-documents">Request Additional Documents</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="review-comment">Review Comment</Label>
                <Textarea
                  id="review-comment"
                  placeholder="Provide detailed review comments..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleReviewApplication}
                  className="flex-1"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Submit Review
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Application Details Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">Application Details - {selectedApplication.applicantName}</h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedApplication(null)}
              >
                Close
              </Button>
            </div>
            <div className="p-6 space-y-6">
              {/* Applicant Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3">Personal Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{selectedApplication.applicantName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email:</span>
                      <span>{selectedApplication.applicantEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phone:</span>
                      <span>{selectedApplication.applicantPhone}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Professional Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Role:</span>
                      {getRoleBadge(selectedApplication.role)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Graduation Year:</span>
                      <span className="font-medium">{selectedApplication.graduationYear || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Program/Facility:</span>
                      <span className="font-medium">{selectedApplication.graduationProgramFacility || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Field of Graduation:</span>
                      <span className="font-medium">{selectedApplication.fieldOfGraduation || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Workplace:</span>
                      <span className="font-medium">{selectedApplication.previousWorkplace || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div>
                <h3 className="font-medium mb-3">Location Information</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Province</div>
                    <div className="font-medium">{selectedApplication.location.province}</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">District</div>
                    <div className="font-medium">{selectedApplication.location.district}</div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Sector</div>
                    <div className="font-medium">{selectedApplication.location.sector}</div>
                  </div>
                </div>
              </div>

              {/* Document Status */}
              <div>
                <h3 className="font-medium mb-3">Document Status</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className={`text-center p-3 rounded-lg ${selectedApplication.documents.degree ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <div className="text-sm font-medium">Degree</div>
                    <div className="text-lg flex items-center justify-center gap-2">
                      <span>{selectedApplication.documents.degree ? '✓' : '✗'}</span>
                      {selectedApplication.documents.degree && (selectedApplication as any).documentPaths?.degree && (
                        <Button size="sm" variant="outline" onClick={() => openDocumentPreview((selectedApplication as any).documentPaths.degree, 'Degree Certificate')}>View</Button>
                      )}
                    </div>
                  </div>
                  <div className={`text-center p-3 rounded-lg ${selectedApplication.documents.idDocument ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <div className="text-sm font-medium">ID Document</div>
                    <div className="text-lg flex items-center justify-center gap-2">
                      <span>{selectedApplication.documents.idDocument ? '✓' : '✗'}</span>
                      {selectedApplication.documents.idDocument && (selectedApplication as any).documentPaths?.id && (
                        <Button size="sm" variant="outline" onClick={() => openDocumentPreview((selectedApplication as any).documentPaths.id, 'ID Document')}>View</Button>
                      )}
                    </div>
                  </div>
                  <div className={`text-center p-3 rounded-lg ${selectedApplication.documents.license ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    <div className="text-sm font-medium">License</div>
                    <div className="text-lg flex items-center justify-center gap-2">
                      <span>{selectedApplication.documents.license ? '✓' : '✗'}</span>
                      {selectedApplication.documents.license && (selectedApplication as any).documentPaths?.license && (
                        <Button size="sm" variant="outline" onClick={() => openDocumentPreview((selectedApplication as any).documentPaths.license, 'License Document')}>View</Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Application Details */}
              <div>
                <h3 className="font-medium mb-3">Application Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Submitted Date:</span>
                    <span>{selectedApplication.submittedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    {getStatusBadge(selectedApplication.status)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Priority:</span>
                    {getPriorityBadge(selectedApplication.priority)}
                  </div>
                  {selectedApplication.previousWorkplace && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Previous Workplace:</span>
                      <span>{selectedApplication.previousWorkplace}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* License Details Modal */}
      {selectedLicense && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">License Details - {selectedLicense.vet.firstName} {selectedLicense.vet.lastName}</h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedLicense(null)}
              >
                Close
              </Button>
            </div>
            <div className="p-6 space-y-6">
              {/* License Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3">Veterinarian Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{selectedLicense.vet.firstName} {selectedLicense.vet.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Role:</span>
                      <span>{selectedLicense.vet.role.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">FieldOfPractice:</span>
                      <span className="font-medium">{selectedLicense.fieldOfPractice}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">License Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium">{selectedLicense.licenseType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Fee Status:</span>
                      <Badge variant={selectedLicense.feeStatus === 'PAID' ? 'default' : 'destructive'}>
                        {selectedLicense.feeStatus}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Status */}
              <div>
                <h3 className="font-medium mb-3">Document Status</h3>
                <div className="grid grid-cols-4 gap-4">
                  <Button variant="outline" onClick={() => openDocumentPreview(`${getApiUrl()}${selectedLicense.degreeCertUrl}`, 'Degree Certificate')}>View Degree</Button>
                  <Button variant="outline" onClick={() => openDocumentPreview(`${getApiUrl()}${selectedLicense.idDocumentUrl}`, 'ID Document')}>View ID</Button>
                  {selectedLicense.paymentReceiptUrl && (
                    <Button variant="outline" onClick={() => openDocumentPreview(`${getApiUrl()}${selectedLicense.paymentReceiptUrl}`, 'Payment Receipt')}>View Payment</Button>
                  )}
                </div>
              </div>

              {/* License Status */}
              {selectedLicense.status === 'APPROVED' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-medium text-green-800 mb-3">Active License</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-muted-foreground">License Number:</span>
                      <span className="font-bold text-green-800 ml-2">VET-RW-{selectedLicense.id}</span>
                    </div>
                    { (
                      <div>
                        <span className="text-muted-foreground">Expiry Date:</span>
                        <span className="font-medium ml-2">
                          {new Date(new Date(selectedLicense.createdAt).setFullYear(new Date(selectedLicense.createdAt).getFullYear() + 1)).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="text-sm text-muted-foreground">
                Submitted: {new Date(selectedLicense.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Details Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border rounded-lg shadow-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">{selectedReport.reportType.toUpperCase()} Report - {selectedReport.period}</h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedReport(null)}
              >
                Close
              </Button>
            </div>
            <div className="p-6 space-y-6">
              {/* Report Overview */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-3">Report Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium">{selectedReport.reportType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Period:</span>
                      <span>{selectedReport.period}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Year:</span>
                      <span>{selectedReport.year}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Submitted By:</span>
                      <span>{selectedReport.submittedBy}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Report Status</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant={
                        selectedReport.status === 'APPROVED' ? 'default' : 
                        selectedReport.status === 'PENDING' ? 'secondary' : 
                        selectedReport.status === 'REVIEWED' ? 'default' : 'outline'
                      }>
                        {selectedReport.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Submitted Date:</span>
                      <span>{selectedReport.submittedDate}</span>
                    </div>
                    {selectedReport.reviewer && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Reviewer:</span>
                        <span>{selectedReport.reviewer}</span>
                      </div>
                    )}
                    {selectedReport.reviewDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Review Date:</span>
                        <span>{selectedReport.reviewDate}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Report Content */}
              <div>
                <h3 className="font-medium mb-3">Report Content</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{selectedReport.content.totalTreatments.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <h3 className="font-medium mb-3">Performance Metrics</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-lg font-bold text-primary">{selectedReport.content.activeVets}</div>
                  </div>
                </div>
              </div>

              {/* Attachments */}
              {selectedReport.attachments.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">Attachments</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedReport.attachments.map((attachment, index) => (
                      <Badge key={index} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                        <FileText className="h-3 w-3 mr-1" />
                        {attachment}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Review Notes */}
              {selectedReport.reviewNotes && (
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <h3 className="font-medium text-primary mb-2">Review Notes</h3>
                  <p className="text-sm text-primary">{selectedReport.reviewNotes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* License Review Modal */}
      {showLicenseReviewModal && licenseToReview && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border rounded-lg shadow-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">Reject License Application</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setShowLicenseReviewModal(false);
                  setLicenseToReview(null);
                  setLicenseReviewNotes('');
                }}
              >
                Close
              </Button>
            </div>
            <div className="p-6 space-y-4">
              <p>You are rejecting the application for <span className="font-bold">{licenseToReview.vet.firstName} {licenseToReview.vet.lastName}</span>.</p>
              <div className="space-y-2">
                <Label htmlFor="license-review-notes">Reason for Rejection *</Label>
                <Textarea
                  id="license-review-notes"
                  placeholder="Provide a clear reason for rejection..."
                  value={licenseReviewNotes}
                  onChange={(e) => setLicenseReviewNotes(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowLicenseReviewModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleUpdateLicenseStatus(licenseToReview.id, 'REJECTED', licenseReviewNotes)}
                  className="flex-1"
                  variant="destructive"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Confirm Rejection
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Veterinarian Modal */}
      {showAddVetModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">
                {editingVet ? 'Edit Veterinarian' : 'Add New Veterinarian'}
              </h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setShowAddVetModal(false);
                  setEditingVet(null);
                  setVetFormData({
                    fullName: '',
                    email: '',
                    phone: '',
                    nationalId: '',
                    password: '',
                    role: 'sector-vet',
                    district: 'Huye',
                    sector: ''
                  });
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium text-primary">Basic Information</h3>
                  <div>
                    <Label htmlFor="vet-full-name">Full Name *</Label>
                    <Input
                      id="vet-full-name"
                      value={vetFormData.fullName}
                      onChange={(e) => setVetFormData({...vetFormData, fullName: e.target.value})}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vet-email">Email Address *</Label>
                    <Input
                      id="vet-email"
                      type="email"
                      value={vetFormData.email}
                      onChange={(e) => setVetFormData({...vetFormData, email: e.target.value})}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vet-phone">Phone Number *</Label>
                    <Input
                      id="vet-phone"
                      placeholder="e.g. 0781234567"
                      value={vetFormData.phone}
                      onChange={e => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length > 10) {
                          val = val.slice(0, 10);
                          setLimitMsgPhone('Maximum 10 digits allowed');
                        } else {
                          setLimitMsgPhone('');
                        }
                        setVetFormData({ ...vetFormData, phone: val });
                      }}
                      required
                    />
                    {limitMsgPhone && <span className="text-red-500 text-xs">{limitMsgPhone}</span>}
                  </div>
                  <div>
                    <Label htmlFor="vet-national-id">National ID *</Label>
                    <Input
                      id="vet-national-id"
                      placeholder="National ID"
                      value={vetFormData.nationalId}
                      onChange={e => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length > 16) {
                          val = val.slice(0, 16);
                          setLimitMsgId('Maximum 16 digits allowed');
                        } else {
                          setLimitMsgId('');
                        }
                        setVetFormData({ ...vetFormData, nationalId: val });
                      }}
                      required
                    />
                    {limitMsgId && <span className="text-red-500 text-xs">{limitMsgId}</span>}
                  </div>
                  <div>
                    <Label htmlFor="vet-role">Role *</Label>
                    <Select 
                      value={vetFormData.role} 
                      onValueChange={(value: 'sector-vet') => setVetFormData({...vetFormData, role: value})}
                    >
                      <SelectTrigger id="vet-role">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sector-vet">Sector Veterinarian</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium text-primary">Login Credentials</h3>
                  <div>
                    <Label htmlFor="vet-password">Password *</Label>
                    <Input
                      id="vet-password"
                      type="password"
                      value={vetFormData.password}
                      onChange={(e) => setVetFormData({...vetFormData, password: e.target.value})}
                      placeholder="Enter password"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vet-district">District *</Label>
                    <Select 
                      value="Huye"
                      disabled
                    >
                      <SelectTrigger id="vet-district">
                        <SelectValue placeholder="Select district" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Huye">Huye</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {vetFormData.role === 'sector-vet' && (
                    <div>
                      <Label htmlFor="vet-sector">Sector *</Label>
                      <Select 
                        value={vetFormData.sector} 
                        onValueChange={(value) => setVetFormData({...vetFormData, sector: value})}
                      >
                        <SelectTrigger id="vet-sector">
                          <SelectValue placeholder="Select sector" />
                        </SelectTrigger>
                        <SelectContent className="max-h-72 overflow-y-auto">
                          {districts
                            .find(d => d.name === 'Huye')
                            ?.sectors
                              .slice()
                              .sort((a, b) => a.name.localeCompare(b.name))
                              .map((sector) => (
                                <SelectItem key={sector.id} value={sector.name}>
                                  {sector.name}
                                </SelectItem>
                              ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>


              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowAddVetModal(false);
                    setEditingVet(null);
                    setVetFormData({
                      fullName: '',
                      email: '',
                      phone: '',
                                  nationalId: '',
                      password: '',
                      role: 'sector-vet',
                      district: 'Huye',
                      sector: '',
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={editingVet ? updateVeterinarian : addVeterinarian}
                  disabled={!vetFormData.fullName || !vetFormData.email || !vetFormData.phone || 
                           !vetFormData.nationalId || !vetFormData.password || !vetFormData.district ||
                           (vetFormData.role === 'sector-vet' && !vetFormData.sector)}
                >
                  {editingVet ? 'Update Veterinarian' : 'Add Veterinarian'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Veterinarian Profile Modal */}
      {showVetProfileModal && selectedVet && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">Veterinarian Profile - {selectedVet.fullName}</h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowVetProfileModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6 space-y-6">
              {/* Profile Header */}
              <div className="flex items-start space-x-4 p-4 bg-primary/5 rounded-lg">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{selectedVet.fullName}</h3>
                  <p className="text-muted-foreground">{selectedVet.email}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge variant={selectedVet.status === 'active' ? 'default' : 'secondary'}>
                      {selectedVet.status}
                    </Badge>
                    <Badge variant="outline">
                      {selectedVet.role.replace('-', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-primary mb-3">Contact Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">{selectedVet.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <p className="text-sm text-muted-foreground">{selectedVet.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-primary mb-3">Assignment</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Location</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedVet.assignedLocation.district}
                          {selectedVet.assignedLocation.sector && ` > ${selectedVet.assignedLocation.sector}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Registration Date</p>
                        <p className="text-sm text-muted-foreground">{selectedVet.dateOfRegistration}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>


              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setEditingVet(selectedVet);
                    setVetFormData({
                      fullName: selectedVet.fullName,
                      email: selectedVet.email,
                      phone: selectedVet.phone,
                      password: selectedVet.password,
                      role: selectedVet.role,
                      district: selectedVet.assignedLocation.district,
                      sector: selectedVet.assignedLocation.sector || ''
                    });
                    setShowVetProfileModal(false);
                    setShowAddVetModal(true);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setShowVetProfileModal(false);
                    deleteVeterinarian(selectedVet.id);
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Review Modal */}
      <Dialog open={showReportReviewModal} onOpenChange={setShowReportReviewModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Report Details & Review</DialogTitle>
            <DialogDescription>Review and update report status</DialogDescription>
          </DialogHeader>
          {selectedReportForReview && (
            <div className="space-y-6">
              {/* Report Details */}
              <div className="space-y-4">
                <div>
                  <Label className="font-medium">Report Title</Label>
                  <p className="text-sm text-muted-foreground">{selectedReportForReview.title}</p>
                </div>
                <div>
                  <Label className="font-medium">Report Type</Label>
                  <p className="text-sm text-muted-foreground">{selectedReportForReview.reportType}</p>
                </div>
                <div>
                  <Label className="font-medium">Submitted By</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedReportForReview.submitter.firstName} {selectedReportForReview.submitter.lastName} 
                    ({selectedReportForReview.submitter.role})
                  </p>
                </div>
                <div>
                  <Label className="font-medium">Location</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedReportForReview.district} District, {selectedReportForReview.sector} Sector, {selectedReportForReview.province} Province
                  </p>
                </div>
                <div>
                  <Label className="font-medium">Content</Label>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">{selectedReportForReview.content}</p>
                  </div>
                </div>
                {selectedReportForReview.attachments && (
                  <div>
                    <Label className="font-medium">Attachments</Label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <Badge variant="outline" className="cursor-pointer">
                        <FileText className="h-3 w-3 mr-1" />
                        {selectedReportForReview.attachments}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>

              <hr />

              {/* Review Section */}
              <div className="space-y-4">
                <h3 className="font-medium text-lg">Huye District-Level Review</h3>
                
                {/* Current Status (Display Only) */}
                <div>
                  <Label className="font-medium">Current Status</Label>
                  <div className="mt-1">
                    <Badge variant={
                      (selectedReportForReview.countryStatus || selectedReportForReview.status) === 'APPROVED' ? 'default' : 
                      (selectedReportForReview.countryStatus || selectedReportForReview.status) === 'PENDING' ? 'secondary' : 
                      (selectedReportForReview.countryStatus || selectedReportForReview.status) === 'REVIEWED' ? 'default' : 'outline'
                    }>
                      {selectedReportForReview.countryStatus || selectedReportForReview.status}
                    </Badge>
                  </div>
                </div>

                {/* Update Status */}
                <div>
                  <Label htmlFor="countryStatus">Update Status</Label>
                  <Select
                    value={districtReviewData.status}
                    onValueChange={(value) => setDistrictReviewData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="REVIEWED">Under Review</SelectItem>
                      <SelectItem value="APPROVED">Approved</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                      <SelectItem value="REQUIRES_REVISION">Requires Revision</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Country Vet Notes */}
                <div>
                  <Label htmlFor="countryVetNotes">Huye District Vet Notes</Label>
                  <Textarea
                    id="countryVetNotes"
                    placeholder="Add your review notes here..."
                    value={districtReviewData.districtVetNotes}
                    onChange={(e) => setDistrictReviewData(prev => ({ ...prev, districtVetNotes: e.target.value }))}
                    rows={4}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowReportReviewModal(false)}>
                  Cancel
                </Button>
                <Button onClick={() => handleDistrictReview(selectedReportForReview.id)}>
                  Update Review
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* User Profile Modal */}
      {currentUser?.email && (
        <UserProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          currentEmail={currentUser.email}
          onProfileUpdated={handleProfileUpdated}
          currentPassportPhotoUrl={typeof currentUser.passportPhoto === 'string' ? currentUser.passportPhoto : undefined}
        />
      )}
    </div>
  );
};

export default DistrictDashboard;
