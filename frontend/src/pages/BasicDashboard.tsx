import React, { useEffect, useState, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { 
  PawPrint, 
  FileCheck,
  Activity, 
  Upload,
  Award,
  Download,
  CheckCircle,
  Clock,  
  Shield,
  Eye,
  Edit,
  CreditCard,
  Send,
  Stethoscope,
  Trash2,
  Plus,
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  X,
  Save,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Stethoscope as StethoscopeIcon,
  Syringe,
  Heart,
  Activity as ActivityIcon,
  Pill,
  LogOut,
  Package,
  FilePlus,
  CalendarDays,
  Calendar as CalendarIcon,
  Check,
  X as XIcon,
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import PatientForm from '../components/forms/PatientForm';
import { getApiUrl, getAuthHeaders, getAuthHeadersForFormData, apiPost, apiGet } from '../lib/api';
import { PatientDetails } from '../components/details/PatientDetails';
import UserProfileDropdown from '../components/UserProfileDropdown';
import LicenseCard from '../components/LicenseCard';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf'; // Import jsPDF
import MedicineForm from '../components/forms/MedicineForm';
import { MedicineDetails } from '../components/details/MedicineDetails';
import UserProfileModal from '../components/UserProfileModal';
import { addYears } from 'date-fns';
import { io, Socket } from 'socket.io-client'; // Add for WebSocket integration

// Import Patient type from PatientForm to ensure type compatibility
import type { Patient } from '../components/forms/PatientForm';

// Medicine Management Interfaces
interface Medicine {
  id: number;
  name: string;
  description: string;
  totalStock: number;
  currentStock: number;
  stockIn: number;
  stockOut: number;
  unit: string;
  expiryDate: string;
  veterinarianId: number;
  createdAt: string;
  updatedAt: string;
  stockMovements: MedicineStockMovement[];
}

interface MedicineStockMovement {
  id: number;
  medicineId: number;
  quantity: number;
  type: 'STOCK_IN' | 'STOCK_OUT';
  createdAt: string;
}

// Activity Management Interfaces
interface ActivityRecord {
  id: number;
  type: 'treatment' | 'vaccination' | 'checkup' | 'surgery' | 'emergency';
  patientId: number;
  patientName: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  ownerIdNumber?: string;
  province?: string;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
  previousConditions?: string;
  date: string;
  time: string;
  description: string;
  diagnosis?: string;
  treatment?: string;
  medications?: string[];
  cost: number;
  veterinarian: string;
  status: 'completed' | 'pending' | 'cancelled' | 'follow-up';
  followUpDate?: string;
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

interface ActivityFilters {
  search: string;
  type: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  patientId: number;
}

// Enhanced mock data for PatientDetails component
interface DetailedPatient {
  id: number;
  name: string;
  breed: string;
  species: string;
  age: number;
  gender: string;
  weight: number;
  color: string;
  microchipId?: string;
  profileImage?: string;
  owner: {
    name: string;
    phone: string;
    email: string;
    address: string;
    emergencyContact: string;
  };
  medicalHistory: string;
  allergies: string;
  currentMedications: string[];
  vaccinations: Array<{
    id: number;
    vaccine: string;
    date: string;
    nextDue?: string;
    veterinarian: string;
  }>;
  treatments: Array<{
    id: number;
    date: string;
    diagnosis: string;
    treatment: string;
    medications: string[];
    veterinarian: string;
    cost: number;
    followUpDate?: string;
  }>;
  lastVisit: string;
  nextAppointment?: string;
  status: 'active' | 'inactive' | 'deceased';
  notes: string;
  dateRegistered: string;
}

const detailedPatients: DetailedPatient[] = [
];

// Mock activity data
const activityRecords: ActivityRecord[] = [
  {
    id: 1,
    type: 'treatment',
    patientId: 1,
    patientName: 'Bella',
    ownerName: 'John Uwimana',
    ownerPhone: '0788123456',
    date: '2024-01-20',
    time: '10:30',
    description: 'Routine checkup and vaccination',
    diagnosis: 'Healthy',
    treatment: 'Annual vaccination',
    medications: ['Rabies vaccine', 'Vitamin D'],
    cost: 25000,
    veterinarian: 'Dr. Sarah Johnson',
    status: 'completed',
    followUpDate: '2024-02-20',
    notes: 'Patient responded well to treatment',
    attachments: ['vaccination_cert.pdf'],
    createdAt: '2024-01-20T10:30:00Z',
    updatedAt: '2024-01-20T10:30:00Z'
  },
  {
    id: 2,
    type: 'emergency',
    patientId: 2,
    patientName: 'Rex',
    ownerName: 'Marie Claire',
    ownerPhone: '0788765432',
    date: '2024-01-19',
    time: '14:15',
    description: 'Emergency treatment for injury',
    diagnosis: 'Laceration on front leg',
    treatment: 'Wound cleaning and bandaging',
    medications: ['Antibiotics', 'Pain relief'],
    cost: 45000,
    veterinarian: 'Dr. Sarah Johnson',
    status: 'follow-up',
    followUpDate: '2024-01-26',
    notes: 'Monitor for signs of infection',
    attachments: ['xray_scan.pdf'],
    createdAt: '2024-01-19T14:15:00Z',
    updatedAt: '2024-01-19T14:15:00Z'
  },
  {
    id: 3,
    type: 'vaccination',
    patientId: 1,
    patientName: 'Bella',
    ownerName: 'John Uwimana',
    ownerPhone: '0788123456',
    date: '2024-01-15',
    time: '09:00',
    description: 'Bovine vaccination program',
    diagnosis: 'Preventive care',
    treatment: 'Multi-vaccine administration',
    medications: ['BVD vaccine', 'IBR vaccine'],
    cost: 35000,
    veterinarian: 'Dr. Sarah Johnson',
    status: 'completed',
    followUpDate: '2024-02-15',
    notes: 'All vaccines administered successfully',
    attachments: [],
    createdAt: '2024-01-15T09:00:00Z',
    updatedAt: '2024-01-15T09:00:00Z'
  }
];

type ReportTypeString = 'MONTHLY' | 'QUARTERLY' | 'ANNUAL' | 'EMERGENCY' | 'INCIDENT' | 'VACCINATION_CAMPAIGN' | 'DISEASE_OUTBREAK' | 'PHARMACEUTICAL' | 'OTHER';

interface Report {
  id: number;
  title: string;
  content: string;
  reportType: ReportTypeString;
  status: string;
  submittedBy: number;
  submitter: {firstName: string, lastName: string, email: string, phone: string, sector: string, district: string, role: string};
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
  createdAt: string;
  updatedAt: string;
  recommendation?: string;
}

interface VetLicenseApplication {
  id: number;
  vetId: number;
  specialization: string;
  licenseType: string;
  status: string;
  paymentReceiptUrl: string;
  licenseNumber: string;
  reviewNotes: string;
  createdAt: string;
  updatedAt: string;
}

const BasicDashboard = () => {
  // License Types with Prices (based on screenshot)
  interface LicenseOption {
    value: string;
    label: string;
    price: number;
  }

  const licenseOptions = [
    { value: 'VETERINARY_PROFESSIONAL', label: 'Veterinary professional', price: 30000 },
    { value: 'ANIMAL_SCIENTIST_A0', label: 'Animal Scientist (A0)', price: 30000 },
    { value: 'VETERINARY_PARAPROFESSIONAL_A1', label: 'Veterinary paraprofessional (Vet A1)', price: 20000 },
    { value: 'ASSISTANT_ANIMAL_SCIENTIST_A1', label: 'Assistant animal Scientist (A1)', price: 20000 },
    { value: 'VETERINARY_PARAPROFESSIONAL_A2', label: 'Veterinary paraprofessional (Vet A2)', price: 15000 },
  ];

  const [selectedTab, setSelectedTab] = useState('overview');
  const [showPatientForm, setShowPatientForm] = useState(false);  
  const [editingPatient, setEditingPatient] = useState<Patient | undefined>(undefined);
  const [viewingPatientId, setViewingPatientId] = useState<number | null>(null);
  const [viewingPatientData, setViewingPatientData] = useState<Patient | null>(null);
  const [showStockInModal, setShowStockInModal] = useState(false);
  const [showStockOutModal, setShowStockOutModal] = useState(false);
  const [selectedMedicineForStock, setSelectedMedicineForStock] = useState<Medicine | null>(null);
  const [stockQuantity, setStockQuantity] = useState(1);
  const [showReportForm, setShowReportForm] = useState(false);
  const [viewingReportId, setViewingReportId] = useState<number | null>(null);

  const [viewingTreatments, setViewingTreatments] = useState<ActivityRecord[]>([]);
  const [viewingLoading, setViewingLoading] = useState<boolean>(false);
  
  // Medicine Management State
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [showMedicineForm, setShowMedicineForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | undefined>(undefined);
  const [viewingMedicineData, setViewingMedicineData] = useState<Medicine | null>(null);
  const [medicineLoading, setMedicineLoading] = useState(false);
  
  // Add user state management
  interface User {
    id: number | string;
    firstName?: string;
    lastName?: string;
    email?: string;
    sector?: string;
    district?: string;
    province?: string;
    [key: string]: unknown;
  }
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  const [showReportModal, setShowReportModal] = useState(false);
  const [submittingReport, setSubmittingReport] = useState(false);
  const [reportForm, setReportForm] = useState({
    title: '',
    content: '',
    reportType: 'MONTHLY' as ReportTypeString,
    attachments: [] as File[],
  });
  const [licenseApplication, setLicenseApplication] = useState({
    degree: null as File | null,
    idDocument: null as File | null,
    paymentReceipt: null as File | null,
    specialization: '',
    licenseType: 'BASIC',
  });
  const [myLicenseApp, setMyLicenseApp] = useState<any | null>(null);
  const [loadingLicense, setLoadingLicense] = useState(true);
  const [fieldsOfPractice, setFieldsOfPractice] = useState<{ id: number; name: string }[]>([]);
  const [reportFilters, setReportFilters] = useState({
    patientId: 'all',
    period: 'month',
    date: new Date().toISOString().split('T')[0],
  });
  const [recentActivities, setRecentActivities] = useState<ActivityRecord[]>([]);

  // Activity Management State
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityRecord | null>(null);
  const [viewingActivity, setViewingActivity] = useState<ActivityRecord | null>(null);
  const [activityFilters, setActivityFilters] = useState<ActivityFilters>({
    search: '',
    type: 'all',
    status: 'all',
    dateFrom: '',
    dateTo: '',
    patientId: 0
  });
  const [activityForm, setActivityForm] = useState({
    type: 'treatment' as ActivityRecord['type'],
    patientId: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    description: '',
    diagnosis: '',
    treatment: '',
    medications: '',
    cost: 0,
    status: 'completed' as ActivityRecord['status'],
    followUpDate: '',
    notes: ''
  });

  const { toast } = useToast();

  const [socket, setSocket] = useState<Socket | null>(null); // Add this to the dashboard's main component state

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

  // Activity Management Helper Functions
  const filteredActivityRecords = activityRecords.filter(activity => {
    const matchesSearch = activity.patientName.toLowerCase().includes(activityFilters.search.toLowerCase()) ||
                         activity.ownerName.toLowerCase().includes(activityFilters.search.toLowerCase()) ||
                         activity.description.toLowerCase().includes(activityFilters.search.toLowerCase()) ||
                         activity.diagnosis?.toLowerCase().includes(activityFilters.search.toLowerCase());
    
    const matchesType = activityFilters.type === 'all' || activity.type === activityFilters.type;
    const matchesStatus = activityFilters.status === 'all' || activity.status === activityFilters.status;
    const matchesPatient = activityFilters.patientId === 'all' || activity.patientId === activityFilters.patientId;
    
    const activityDate = new Date(activity.date);
    const fromDate = activityFilters.dateFrom ? new Date(activityFilters.dateFrom) : null;
    const toDate = activityFilters.dateTo ? new Date(activityFilters.dateTo) : null;
    
    const matchesDateRange = (!fromDate || activityDate >= fromDate) && (!toDate || activityDate <= toDate);
    
    return matchesSearch && matchesType && matchesStatus && matchesPatient && matchesDateRange;
  });

  const getActivityTypeIcon = (type: ActivityRecord['type']) => {
    switch (type) {
      case 'treatment': return <StethoscopeIcon className="h-4 w-4" />;
      case 'vaccination': return <Syringe className="h-4 w-4" />;
      case 'checkup': return <Heart className="h-4 w-4" />;
      case 'surgery': return <ActivityIcon className="h-4 w-4" />;
      case 'emergency': return <AlertTriangle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getActivityTypeColor = (type: ActivityRecord['type']) => {
    switch (type) {
      case 'treatment': return 'text-blue-600 bg-blue-100';
      case 'vaccination': return 'text-green-600 bg-green-100';
      case 'checkup': return 'text-purple-600 bg-purple-100';
      case 'surgery': return 'text-orange-600 bg-orange-100';
      case 'emergency': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusBadge = (status: ActivityRecord['status']) => {
    switch (status) {
      case 'completed': return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'pending': return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'cancelled': return <Badge variant="destructive"><X className="h-3 w-3 mr-1" />Cancelled</Badge>;
      case 'follow-up': return <Badge variant="outline" className="bg-blue-100 text-blue-800"><Calendar className="h-3 w-3 mr-1" />Follow-up</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleAddActivity = () => {
    setActivityForm({
      type: 'treatment',
      patientId: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().slice(0, 5),
      description: '',
      diagnosis: '',
      treatment: '',
      medications: '',
      cost: 0,
      status: 'completed',
      followUpDate: '',
      notes: ''
    });
    setEditingActivity(null);
    setShowActivityModal(true);
  };

  const handleEditActivity = (activity: ActivityRecord) => {
    setActivityForm({
      type: activity.type,
      patientId: String(activity.patientId),
      date: activity.date,
      time: activity.time,
      description: activity.description,
      diagnosis: activity.diagnosis || '',
      treatment: activity.treatment || '',
      medications: activity.medications?.join(', ') || '',
      cost: activity.cost,
      status: activity.status,
      followUpDate: activity.followUpDate || '',
      notes: activity.notes || ''
    });
    setEditingActivity(activity);
    setShowActivityModal(true);
  };

  const handleSaveActivity = () => {
    if (!activityForm.patientId || !activityForm.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    const patient = detailedPatients.find(p => p.id === Number(activityForm.patientId));
    if (!patient) return;

    const newActivity: ActivityRecord = {
      id: editingActivity?.id || Date.now(), // Mock ID generation
      type: activityForm.type,
      patientId: Number(activityForm.patientId),
      patientName: patient.name,
      ownerName: patient.owner.name,
      ownerPhone: patient.owner.phone,
      date: activityForm.date,
      time: activityForm.time,
      description: activityForm.description,
      diagnosis: activityForm.diagnosis || undefined,
      treatment: activityForm.treatment || undefined,
      medications: activityForm.medications ? activityForm.medications.split(',').map(m => m.trim()) : undefined,
      cost: activityForm.cost,
      veterinarian: 'Dr. Sarah Johnson',
      status: activityForm.status,
      followUpDate: activityForm.followUpDate || undefined,
      notes: activityForm.notes || undefined,
      attachments: [],
      createdAt: editingActivity?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (editingActivity) {
      // Update existing activity
      const index = activityRecords.findIndex(a => a.id === editingActivity.id);
      if (index !== -1) {
        activityRecords[index] = newActivity;
      }
      toast({
        title: "Success",
        description: "Activity updated successfully.",
      });
    } else {
      // Add new activity
      activityRecords.push(newActivity);
      toast({
        title: "Success",
        description: "Activity added successfully.",
      });
    }

    setShowActivityModal(false);
    setEditingActivity(null);
  };

  const handleDeleteActivity = (activityId: number) => {
    const activity = activityRecords.find(a => a.id === activityId);
    if (!activity) return;

    if (window.confirm(`Are you sure you want to delete this activity for ${activity.patientName}?`)) {
      const index = activityRecords.findIndex(a => a.id === activityId);
      if (index !== -1) {
        activityRecords.splice(index, 1);
        toast({
          title: "Success",
          description: "Activity deleted successfully.",
        });
      }
    }
  };

  const handleViewActivity = (activity: ActivityRecord) => {
    setViewingActivity(activity);
  };

  const handleFilterChange = (field: keyof typeof reportFilters, value: string) => {
    setReportFilters(prev => ({ ...prev, [field]: value }));
  };

  // Remove this function as it's not needed
  // const submitReport = () => {
  //   toast({
  //     title: "Report Submitted",
  //     description: "Your activity report has been sent to the Sector Vet.",
  //   });
  // };

  const handleSaveTreatment = () => {
    // In a real app, you would get form data and send it to an API
    toast({
      title: "Treatment Record Saved",
      description: "The new treatment has been added to the patient's history.",
    });
  };

  const handleFileUpload = (field: 'degree' | 'idDocument' | 'paymentReceipt', file: File | null) => {
    setLicenseApplication(prev => ({...prev, [field]: file}));
  };

  const submitLicenseApplication = async () => {
    /*
    if (!licenseApplication.degree || !licenseApplication.idDocument) {
      toast({
        title: "Missing Documents",
        description: "Please upload all required documents (Degree and ID).",
        variant: "destructive"
      });
      return;
    }
    */
    try {
      const uploadFile = async (file: File, fieldName: string): Promise<string> => {
        const fileFormData = new FormData();
        fileFormData.append('file', file, file.name);

        const res = await fetch(`${getApiUrl()}/api/v1/upload`, {
          method: 'POST',
          headers: getAuthHeadersForFormData(),
          body: fileFormData,
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.message || `Failed to upload ${fieldName}`);
        }
        const result = await res.json();
        return result.url;
      };

      // const degreePath = await uploadFile(licenseApplication.degree, 'Degree Certificate');
      // const idDocumentPath = await uploadFile(licenseApplication.idDocument, 'ID Document');
      const paymentReceiptPath = licenseApplication.paymentReceipt ? await uploadFile(licenseApplication.paymentReceipt, 'Payment Receipt') : null;

      const payload = {
        vetId: currentUser?.id,
        specialization: licenseApplication.specialization,
        licenseType: licenseApplication.licenseType,
        paymentReceiptUrl: paymentReceiptPath,
      };

      const res = await fetch(`${getApiUrl()}/api/v1/license-applications`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to submit license application');
      }

      const newApp = await res.json();
      setMyLicenseApp(newApp);

      toast({ title: "Application Submitted", description: "Your license application has been submitted for review." });
    } catch (error: any) {
      toast({ title: 'Submission Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleStockIn = async () => {
    if (!selectedMedicineForStock || stockQuantity <= 0) return;
    try {
      const res = await fetch(`${getApiUrl()}/api/v1/medicines/${selectedMedicineForStock.id}/stock-in`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ quantity: stockQuantity }),
      });
      if (!res.ok) throw new Error('Failed to stock in');
      toast({ title: 'Stock Updated', description: `${stockQuantity} units added.` });
      setShowStockInModal(false);
      setSelectedMedicineForStock(null);
      setStockQuantity(1);
      reloadMedicines();
    } catch (e: unknown) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed', variant: 'destructive' });
    }
  };

  const handleStockOut = async () => {
    if (!selectedMedicineForStock || stockQuantity <= 0) return;
    if (stockQuantity > selectedMedicineForStock.currentStock) {
      toast({ title: 'Error', description: 'Stock out quantity cannot exceed current stock.', variant: 'destructive' });
      return;
    }
    try {
      const res = await fetch(`${getApiUrl()}/api/v1/medicines/${selectedMedicineForStock.id}/stock-out`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ quantity: stockQuantity }),
      });
      if (!res.ok) throw new Error('Failed to stock out');
      toast({ title: 'Stock Updated', description: `${stockQuantity} units dispensed.` });
      setShowStockOutModal(false);
      setSelectedMedicineForStock(null);
      setStockQuantity(1);
      reloadMedicines();
    } catch (e: unknown) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed', variant: 'destructive' });
    }
  };

  const deleteMedicine = async (id: number) => {
    try {
      const res = await fetch(`${getApiUrl()}/api/v1/medicines/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to delete medicine');
      toast({ title: 'Medicine Deleted' });
      reloadMedicines();
    } catch (e: unknown) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed', variant: 'destructive' });
    }
  };

  const loadReports = async () => {
    // Placeholder for report loading logic
    console.log("Reloading reports...");
  };

  const [recentPatients, setRecentPatients] = useState<Array<{ id: number|string; animalName: string; owner: string; lastVisit: string; condition: string; status: string }>>([]);
  useEffect(() => {
    const loadPatients = async () => {
      try {
        // Only load patients if we have a current user
        if (!currentUser?.id) return;
        
        const res = await fetch(`${getApiUrl()}/api/v1/patients`, { headers: getAuthHeaders() });
        if (res.ok) {
          const list = await res.json();
          type ApiPatient = {
            id: number | string;
            animalName: string;
            ownerName: string;
            updatedAt?: string;
            createdAt?: string;
            previousConditions?: string;
            veterinarianId?: number;
          };
          // Filter patients by current user's ID
          const filteredList = (list || []).filter((p: ApiPatient) => 
            p.veterinarianId === Number(currentUser.id)
          );
          const mapped = filteredList.map((p: ApiPatient) => ({
            id: Number(p.id),
            animalName: p.animalName,
            owner: p.ownerName,
            lastVisit: new Date(p.updatedAt || p.createdAt || '').toISOString().split('T')[0],
            condition: p.previousConditions || '—',
            status: 'Completed',
          }));
          setRecentPatients(mapped);
          // Auto-select first patient if none selected
          if (!activityForm.patientId && mapped.length > 0) {
            setActivityForm(prev => ({ ...prev, patientId: String(mapped[0].id) }));
          }
        }
      } catch {
        // Intentionally ignored error while loading patients
      }
    };
    
    // Only load patients when currentUser is available
    if (currentUser?.id) {
      loadPatients();
    }
    
    const handler = () => {
      if (currentUser?.id) {
        loadPatients();
      }
    };
    window.addEventListener('patient:created', handler as EventListener);
    return () => window.removeEventListener('patient:created', handler as EventListener);
  }, [currentUser?.id]); // Add currentUser.id as dependency

  // Load recent activities from API
  useEffect(() => {
    const loadRecentActivities = async () => {
      try {
        // Only load activities if we have a current user
        if (!currentUser?.id) return;
        
        const res = await fetch(`${getApiUrl()}/api/v1/treatments`, { headers: getAuthHeaders() });
        if (!res.ok) return;
        const list = await res.json();
        const mapped: ActivityRecord[] = (Array.isArray(list) ? list : [])
          .filter((a: any) => a.veterinarianId === Number(currentUser.id)) // Filter by current user
          .map((a: any) => ({
            id: Number(a.id ?? a._id ?? Date.now()),
            type: (a.type ?? 'treatment') as ActivityRecord['type'],
            patientId: Number(a.patientId ?? a.patient?.id ?? ''),
            patientName: String(a.patientName ?? a.patient?.animalName ?? 'Unknown'),
            ownerName: String(a.ownerName ?? a.patient?.ownerName ?? 'Unknown'),
            ownerPhone: String(a.ownerPhone ?? a.patient?.ownerPhone ?? '—'),
            ownerEmail: String(a.ownerEmail ?? a.patient?.ownerEmail ?? ''),
            ownerIdNumber: String(a.ownerIdNumber ?? a.patient?.ownerIdNumber ?? ''),
            province: String(a.province ?? a.patient?.province ?? ''),
            district: String(a.district ?? a.patient?.district ?? ''),
            sector: String(a.sector ?? a.patient?.sector ?? ''),
            cell: String(a.cell ?? a.patient?.cell ?? ''),
            village: String(a.village ?? a.patient?.village ?? ''),
            previousConditions: String(a.previousConditions ?? a.patient?.previousConditions ?? ''),
            date: (a.date ? new Date(a.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
            time: String(a.time ?? ''),
            description: String(a.description ?? a.treatment ?? 'Activity'),
            diagnosis: a.diagnosisAndNotes?.split(' - ')[0] ?? undefined,
            treatment: a.diagnosisAndNotes?.split(' - ')[1] ?? a.diagnosisAndNotes ?? undefined,
            medications: a.medicinesAndPrescription ? a.medicinesAndPrescription.split(',').map((m: string) => m.trim()) : undefined,
            cost: Number(a.cost ?? 0),
            veterinarian: String(a.veterinarian ?? a.vetName ?? '—'),
            status: (a.status ?? 'completed') as ActivityRecord['status'],
            followUpDate: a.followUpDate ? new Date(a.followUpDate).toISOString().split('T')[0] : undefined,
            notes: a.diagnosisAndNotes?.split(' - ')[1] ?? a.diagnosisAndNotes ?? undefined,
            attachments: Array.isArray(a.attachments) ? a.attachments : [],
            createdAt: String(a.createdAt ?? new Date().toISOString()),
            updatedAt: String(a.updatedAt ?? new Date().toISOString()),
          }));
        // Sort by date desc then time desc
        mapped.sort((a, b) => {
          const d = new Date(b.date).getTime() - new Date(a.date).getTime();
          if (d !== 0) return d;
          return (b.time || '').localeCompare(a.time || '');
        });
        setRecentActivities(mapped);
      } catch {
        // silent fail, fallback will be used in UI
      }
    };
    
    // Only load activities when currentUser is available
    if (currentUser?.id) {
      loadRecentActivities();
    }
  }, [currentUser?.id]); // Add currentUser.id as dependency

  const recentPatientsFallback = [
    {
      id: 1,
      animalName: 'Bella',
      owner: 'John Uwimana',
      lastVisit: '2024-01-20',
      condition: 'Vaccination',
      status: 'Completed'
    },
    {
      id: 2,
      animalName: 'Rex', 
      owner: 'Marie Claire',
      lastVisit: '2024-01-19',
      condition: 'Injury Treatment',
      status: 'Follow-up'
    }
  ];

  // Helper: map lightweight dashboard patient to full Patient for editing
  type RecentPatient = {
    id: number;
    animalName: string;
    owner: string;
    lastVisit: string;
    condition: string;
    status: string;
  };

  const mapToFullPatient = (p: RecentPatient): Patient => ({
    animalName: p.animalName || '',
    ownerName: p.owner || '',
    ownerPhone: '',
    ownerEmail: '',
    ownerIdNumber: '',
    province: 'Kigali',
    district: '',
    sector: '',
    cell: '',
    village: '',
    previousConditions: p.condition || '',
  });

  // Report filtering logic - use dynamic data
  const allActivities = recentActivities.length > 0 ? recentActivities : activityRecords;

  const filteredActivities = allActivities.filter(activity => {
    const activityDate = new Date(activity.date);
    const today = new Date();

    // Patient filter
    if (reportFilters.patientId !== 'all' && activity.patientId !== Number(reportFilters.patientId)) {
      return false;
    }

    // Period filter
    switch (reportFilters.period) {
      case 'date': {
        const specificDate = new Date(reportFilters.date + 'T00:00:00');
        return activityDate.getFullYear() === specificDate.getFullYear() &&
               activityDate.getMonth() === specificDate.getMonth() &&
               activityDate.getDate() === specificDate.getDate();
      }
      case 'week': {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        return activityDate >= startOfWeek && activityDate <= endOfWeek;
      }
      case 'month':
        return activityDate.getFullYear() === today.getFullYear() && activityDate.getMonth() === today.getMonth();
      case 'year':
        return activityDate.getFullYear() === today.getFullYear();
      default:
        return true;
    }
  });

  const reportSummary = {
    treatments: filteredActivities.length,
    totalActivities: filteredActivities.length,
    patientsAttended: new Set(filteredActivities.map(a => a.patientId)).size,
    uniquePatients: new Set(filteredActivities.map(a => a.patientId)).size
  };

  // Add useEffect to load current user
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        setUserLoading(true);
        // Always fetch fresh data from API first
        const res = await fetch(`${getApiUrl()}/api/v1/auth/me`, {
          headers: getAuthHeaders()
        });

        if (res.ok) {
          const userData = await res.json();
          setCurrentUser(userData);
          // Update localStorage with fresh data, ensuring all relevant fields are present
          localStorage.setItem('vgms_user', JSON.stringify(userData));
        } else {
          // If API fails, try to get from localStorage (might be stale but better than nothing)
          const storedUser = localStorage.getItem('vgms_user');
          if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
          }
          console.error('Failed to fetch user data from API.');
        }
      } catch (error) {
        console.error('Failed to load user data:', error);
        // Fallback to stored user if API fails unexpectedly
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
    const loadMyApplication = async () => {
      if (!currentUser?.id) return;
      setLoadingLicense(true);
      try {
        const res = await fetch(`${getApiUrl()}/api/v1/license-applications/mine`, { headers: getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          setMyLicenseApp(data);
        } else {
          setMyLicenseApp(null);
        }
      } catch (error) {
        setMyLicenseApp(null);
      } finally {
        setLoadingLicense(false);
      }
    };
    if (currentUser) loadMyApplication();
  }, [currentUser]);

  // Move your function here, outside of JSX!
  const reloadActivities = async () => {
    try {
      // Only reload activities if we have a current user
      if (!currentUser?.id) return;
      
      const res = await fetch(`${getApiUrl()}/api/v1/treatments`, { headers: getAuthHeaders() });
      if (!res.ok) return;
      const list = await res.json();
      const mapped: ActivityRecord[] = (Array.isArray(list) ? list : [])
        .filter((a: any) => a.veterinarianId === Number(currentUser.id)) // Filter by current user
        .map((a: any) => ({
          id: Number(a.id ?? a._id ?? Date.now()),
          type: (a.type ?? 'treatment') as ActivityRecord['type'],
          patientId: Number(a.patientId ?? a.patient?.id ?? ''),
          patientName: String(a.patientName ?? a.patient?.animalName ?? 'Unknown'),
          ownerName: String(a.ownerName ?? a.patient?.ownerName ?? 'Unknown'),
          ownerPhone: String(a.ownerPhone ?? a.patient?.ownerPhone ?? '—'),
          ownerEmail: String(a.ownerEmail ?? a.patient?.ownerEmail ?? ''),
          ownerIdNumber: String(a.ownerIdNumber ?? a.patient?.ownerIdNumber ?? ''),
          province: String(a.province ?? a.patient?.province ?? ''),
          district: String(a.district ?? a.patient?.district ?? ''),
          sector: String(a.sector ?? a.patient?.sector ?? ''),
          cell: String(a.cell ?? a.patient?.cell ?? ''),
          village: String(a.village ?? a.patient?.village ?? ''),
          previousConditions: String(a.previousConditions ?? a.patient?.previousConditions ?? ''),
          date: (a.date ? new Date(a.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
          time: String(a.time ?? ''),
          description: String(a.description ?? a.treatment ?? 'Activity'),
          diagnosis: a.diagnosisAndNotes?.split(' - ')[0] ?? undefined,
          treatment: a.diagnosisAndNotes?.split(' - ')[1] ?? a.diagnosisAndNotes ?? undefined,
          medications: a.medicinesAndPrescription ? a.medicinesAndPrescription.split(',').map((m: string) => m.trim()) : undefined,
          cost: Number(a.cost ?? 0),
          veterinarian: String(a.veterinarian ?? a.vetName ?? '—'),
          status: (a.status ?? 'completed') as ActivityRecord['status'],
          followUpDate: a.followUpDate ? new Date(a.followUpDate).toISOString().split('T')[0] : undefined,
          notes: a.diagnosisAndNotes?.split(' - ')[1] ?? a.diagnosisAndNotes ?? undefined,
          attachments: Array.isArray(a.attachments) ? a.attachments : [],
          createdAt: String(a.createdAt ?? new Date().toISOString()),
          updatedAt: String(a.updatedAt ?? new Date().toISOString()),
        }));
      // Sort by date desc then time desc
      mapped.sort((a, b) => {
        const d = new Date(b.date).getTime() - new Date(a.date).getTime();
        if (d !== 0) return d;
        return (b.time || '').localeCompare(a.time || '');
      });
      setRecentActivities(mapped);
    } catch {
      // silent fail, fallback will be used in UI
    }
  };

  // Add report submission handler
  const handleSubmitReport = async () => {
    if (!reportForm.title || !reportForm.content || !reportForm.reportType) {
      toast({ title: 'Error', description: 'Please fill in all required fields.', variant: 'destructive' });
      return;
    }

    setSubmittingReport(true);
    try {
      const user = currentUser; // Use the already available currentUser state

      const formData = new FormData();
      formData.append('title', reportForm.title);
      formData.append('content', reportForm.content);
      formData.append('reportType', reportForm.reportType); // This FormData is created but not used.
      formData.append('sector', user.sector || '');
      formData.append('district', user.district || '');
      formData.append('province', user.province || '');

      reportForm.attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      const res = await fetch(`${getApiUrl()}/api/v1/reports`, {
        method: 'POST',
        headers: getAuthHeaders({'Content-Type': 'application/json'}),
        body: JSON.stringify({
          title: reportForm.title,
          content: reportForm.content,
          reportType: reportForm.reportType as ReportTypeString,
          sector: user.sector || '',
          district: user.district || '',
          province: user.province || '',
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to submit report');
      }

      setReportForm({
        title: '',
        content: '',
        reportType: 'MONTHLY',
        attachments: [],
      });
      toast({ title: 'Report Submitted', description: 'Your report has been submitted successfully.' });
      setShowReportModal(false);
      reloadReports();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to submit report', variant: 'destructive' });
    } finally {
      setSubmittingReport(false);
    }
  };

  const handleDownloadReport = async (reportId: number) => {
    try {
      const report = await apiGet<Report>(`/api/v1/reports/${reportId}`);
      if (report.reportType === 'PHARMACEUTICAL') {
        // For pharmaceutical reports, display content directly in a new tab
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(`<h1>${report.title}</h1><pre>${report.content}</pre>`);
          newWindow.document.close();
        } else {
          throw new Error('Failed to open new window for report.');
        }
      } else {
        // For other reports, proceed with download logic
        const response = await fetch(`${getApiUrl()}/api/v1/reports/${reportId}`, {
          headers: getAuthHeaders(),
        });

        if (!response.ok) throw new Error('Failed to download report');

        const reportBlob = await response.blob();
        const url = window.URL.createObjectURL(reportBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${reportId}.pdf`; // Or appropriate file type
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        toast({ title: 'Download Started', description: 'Your report download has started.' });
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to download report', variant: 'destructive' });
    }
  };

  const [myReports, setMyReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [editReport, setEditReport] = useState<any | null>(null);
  const [editReportForm, setEditReportForm] = useState({ title: '', content: '' });
  const licenseCardRef = useRef<HTMLDivElement>(null);

  const loadMyReports = async () => {
    setLoadingReports(true);
    try {
      const data = await apiGet<any[]>(`/api/v1/reports/mine`);
      setMyReports(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load my reports:", e);
      setMyReports([]);
    } finally {
      setLoadingReports(false);
    }
  };

  const reloadReports = () => {
    loadMyReports();
  };
  
  useEffect(() => {
    loadMyReports();
  }, [currentUser?.id]);

  // Load fields of practice
  useEffect(() => {
    const loadFields = async () => {
      try {
        const data = await apiGet<{ id: number; name: string }[]>('/api/v1/field-of-practice');
        setFieldsOfPractice(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load fields of practice:", error);
        toast({ title: "Error", description: "Could not load fields of practice.", variant: "destructive" });
      }
    };

    if (selectedTab === 'license') loadFields();
  }, [selectedTab, toast]);

  const handleOpenEditReport = (r: any) => {
    setEditReport(r);
    setEditReportForm({ title: r.title || '', content: r.content || '' });
  };

  const handleResubmitReport = async () => {
    if (!editReport) return;
    try {
      const res = await fetch(`${getApiUrl()}/api/v1/reports/${editReport.id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          submitterEdit: true,
          title: editReportForm.title,
          content: editReportForm.content,
        }),
      });
      if (!res.ok) throw new Error('Failed to resubmit report');
      toast({ title: 'Report Resubmitted', description: 'Report moved back to Pending' });
      setEditReport(null);
      // reload
      const list = await fetch(`${getApiUrl()}/api/v1/reports/mine`, { headers: getAuthHeaders() }).then(r => r.json());
      setMyReports(Array.isArray(list) ? list : []);
    } catch (e: unknown) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed', variant: 'destructive' });
    }
  };

  const handleDeleteReport = async (id: number) => {
    if (!confirm('Delete this report? This cannot be undone.')) return;
    try {
      const res = await fetch(`${getApiUrl()}/api/v1/reports/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!res.ok) throw new Error('Failed to delete report');
      toast({ title: 'Report Deleted' });
      setMyReports(prev => prev.filter(r => r.id !== id));
    } catch (e: unknown) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed', variant: 'destructive' });
    }
  };

  const handleDownloadLicenseCard = async () => {
    if (!currentUser || !myLicenseApp?.licenseNumber) {
      toast({
        title: "Download Failed",
        description: "License information is not available.",
        variant: "destructive",
      });
      return;
    }

    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv);

    const root = ReactDOM.createRoot(tempDiv);
    root.render(
      <LicenseCard
        user={currentUser}
        licenseNumber={myLicenseApp.licenseNumber}
        licenseType={myLicenseApp.licenseType}
        fieldOfPractice={myLicenseApp.fieldOfPractice}
        issuedDate={myLicenseApp.createdAt}
        expiryDate={addYears(new Date(myLicenseApp.createdAt), 1).toLocaleDateString()}
      />
    );

    // Helper: Wait for ALL images in given element to load
    function waitForAllImagesToLoad(element) {
      const images = Array.from(element.querySelectorAll('img'));
      if (images.length === 0) return Promise.resolve();
      return Promise.all(
        images.map(img => {
          if (img.complete && img.naturalHeight !== 0) return Promise.resolve();
          return new Promise(resolve => {
            img.onload = img.onerror = () => resolve();
          });
        })
      );
    }

    try {
      // Wait for React to render & images to load
      await new Promise(r => setTimeout(r, 100));
      await waitForAllImagesToLoad(tempDiv);
      // Now safe to snapshot
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });
      const imgData = canvas.toDataURL('image/png');

      const cardWidthPx = 324; // 3.375in * 96dpi (approx)
      const cardHeightPx = 204; // 2.125in * 96dpi (approx)
      const dpi = 96;
      const cardWidthMm = (cardWidthPx / dpi) * 25.4; // px->mm
      const cardHeightMm = (cardHeightPx / dpi) * 25.4;

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [cardWidthMm + 10, cardHeightMm * 2 + 20],
      });

      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * cardWidthMm) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 5, 5, cardWidthMm, imgHeight);
      pdf.save(`license_card_${myLicenseApp.licenseNumber}.pdf`);
      toast({ title: "Download Complete", description: "Your license card has been downloaded." });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({ title: "Download Failed", description: "Could not generate license card. Please try again.", variant: "destructive" });
    } finally {
      root.unmount();
      document.body.removeChild(tempDiv);
    }
  };

  const handlePrepareReport = () => {
    if (filteredActivities.length === 0) {
      toast({
        title: "No Data to Report",
        description: "There are no activities for the selected filters. Cannot generate a report.",
        variant: "destructive",
      });
      return;
    }

    // 1. Generate Title based on current report type selection
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const typeText = reportForm.reportType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
    const title = `${typeText} Report - ${dateStr}`;

    // 2. Generate Content from filtered activities
    const periodText = reportFilters.period.charAt(0).toUpperCase() + reportFilters.period.slice(1);
    let content = `This report covers the period: ${periodText}.\n`;
    if (reportFilters.period === 'date') {
      content = `This report is for the specific date: ${reportFilters.date}.\n`;
    }
    content += `Generated on: ${new Date().toLocaleString()}.\n\n`;
    content += `Summary:\n`;
    content += `- Total Activities: ${reportSummary.totalActivities}\n`;
    content += `- Unique Patients Attended: ${reportSummary.uniquePatients}\n\n`;
    content += "----------------------------------------\n\n";
    content += "Detailed Activity Log:\n\n";

    const activityDetails = filteredActivities.map(activity => {
      return [
        `Date: ${new Date(activity.date).toLocaleDateString()}`,
        `Patient: ${activity.patientName} (ID: ${activity.patientId})`,
        `Owner: ${activity.ownerName} (${activity.ownerPhone})`,
        `Diagnosis/Notes: ${activity.diagnosis || activity.notes || 'N/A'}`,
        `Medicines: ${Array.isArray(activity.medications) ? activity.medications.join(', ') : (activity.medications || 'N/A')}`,
      ].join('\n');
    }).join('\n\n---\n\n');

    content += activityDetails;

    // 3. Update state and show modal
    setReportForm(prev => ({
      ...prev,
      title: title,
      content: content,
    }));
    setShowReportModal(true);
  };

  // modal + form state
  const [treatmentModalOpen, setTreatmentModalOpen] = useState(false);
  const [treatmentSaving, setTreatmentSaving] = useState(false);
  const [treatmentForm, setTreatmentForm] = useState({
    patientId: 0 as number,
    date: new Date().toISOString().split('T')[0],
    diagnosis: '',
    notes: '',
    medications: '', // comma-separated entry in UI; backend expects array
  });

  const openTreatmentModal = (patientId: number) => {
    setTreatmentForm({
      patientId,
      date: new Date().toISOString().split('T')[0],
      diagnosis: '',
      notes: '',
      medications: '',
    });
    setTreatmentModalOpen(true);
  };

  const handleSubmitTreatment = async () => {
    if (!treatmentForm.patientId || !treatmentForm.date) return;
    try {
      setTreatmentSaving(true);
      const payload = {
        patientId: treatmentForm.patientId,
        veterinarianId: currentUser?.id, // Add the current user's ID as veterinarianId
        date: treatmentForm.date,
        diagnosis: treatmentForm.diagnosis || undefined,
        notes: treatmentForm.notes || undefined,
        medications: treatmentForm.medications
          .split(',')
          .map(m => m.trim())
          .filter(Boolean),
      };

      const res = await fetch(`${getApiUrl()}/api/v1/treatments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to save treatment');
      }

      toast({ title: 'Treatment Saved', description: 'Treatment recorded successfully.' });
      setTreatmentModalOpen(false);

      // If the details panel is open for this patient, refresh its treatments
      if (viewingPatientId === treatmentForm.patientId) {
        const tRes = await fetch(`${getApiUrl()}/api/v1/treatments/patient/${treatmentForm.patientId}`, {
          headers: getAuthHeaders(),
        });
        const tData = tRes.ok ? await tRes.json() : [];
        setViewingTreatments(Array.isArray(tData) ? tData : []);
      }
    } catch (e: unknown) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to save treatment',
        variant: 'destructive',
      });
    } finally {
      setTreatmentSaving(false);
    }
  };

  // Auto-update report title when type changes in the modal
  useEffect(() => {
    if (showReportModal) {
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const typeText = reportForm.reportType.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
      const newTitle = `${typeText} Report - ${dateStr}`;
      if (reportForm.title !== newTitle) {
        setReportForm(prev => ({ ...prev, title: newTitle }));
      }
    }
  }, [reportForm.reportType, showReportModal]);

  const loadMedicines = useCallback(async () => {
    if (!currentUser?.id) return;
    setMedicineLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/v1/medicines`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        // Filter medicines by the current veterinarian's ID
        const filteredMedicines = data.filter((m: Medicine) => m.veterinarianId === Number(currentUser.id));
        setMedicines(filteredMedicines);
      } else {
        // Handle HTTP errors like 500
        const errorData = await res.json().catch(() => ({ message: 'Failed to load medicines. The server returned an error.' }));
        console.error("Failed to load medicines:", errorData);
        toast({
          title: `Error: ${res.status}`,
          description: errorData.message || "An unknown error occurred.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to load medicines:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "A network error occurred.",
        variant: "destructive",
      });
    } finally {
      setMedicineLoading(false);
    }
  }, [currentUser?.id, toast]);

  // Load medicines from API
  useEffect(() => {
    loadMedicines();
  }, [loadMedicines]);

  const reloadMedicines = async () => {
    await loadMedicines();
  };

  // Effect to load medicine details when viewingMedicineData changes
  useEffect(() => {
    if (viewingMedicineData) {
      // No need to fetch, as we already have the full medicine object
    }
  }, [viewingMedicineData]);

  // Load single medicine for details view
  useEffect(() => {
    const loadMedicineDetails = async () => {
      if (!viewingMedicineData) return;
      setMedicineLoading(true);
      try {
        const res = await fetch(`${getApiUrl()}/api/v1/medicines/${viewingMedicineData.id}`, { headers: getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          setViewingMedicineData(data);
        } else {
          setViewingMedicineData(null);
        }
      } catch (error) {
        console.error("Failed to load medicine details:", error);
        setViewingMedicineData(null);
      } finally {
        setMedicineLoading(false);
      }
    };

    loadMedicineDetails();
  }, [viewingMedicineData]);

  const openDocumentPreview = (url: string, title?: string) => {
    if (url) {
      window.open(url, '__blank', 'noopener,noreferrer');
    } else {
      toast({
        title: "Document Not Available",
        description: `The ${title || 'document'} is not available.`, // Use provided title or a generic message
        variant: "destructive"
      });
    }
  };

  // This is now fetched from the database, but we can keep the license type dependency logic if needed,
  // or simplify it to show all fields for all license types.
  // For now, let's assume the fields are not dependent on the license type and we show all of them.
  // If there's a dependency, the backend should handle filtering or the frontend can have a mapping.
  
  // The old static options are removed.
  /*
    const fieldOfPracticeOptions = {
    VETERINARY_PROFESSIONAL: [
      "Clinic",
      "Pharmacy",
      "Bovine artificial insemination",
      "Swine artificial insemination",
      "Hygiene and quality of animal products",
      "Wild animal medicine"
    ],
    ANIMAL_SCIENTIST_A0: [
      "Animal feeds and feeding",
      "Research",
      "Pharmacy",
      "Veterinary consultancy"
    ],
    VETERINARY_PARAPROFESSIONAL_A1: [
      "Advisory services to farmers",
      "Education"
    ],
    ASSISTANT_ANIMAL_SCIENTIST_A1: [
      "Animal feeds and feeding",
      "Research assistance"
    ],
    VETERINARY_PARAPROFESSIONAL_A2: [
      "Routine animal care",
      " Artificial insemination support"
    ]
  }; 
  */

  useEffect(() => {
    // Only connect socket after user is loaded
    if (!currentUser?.id) return;
    const socketInstance = io(getApiUrl() + '/medicines', {
      transports: ['websocket'],
      forceNew: true,
    });
    setSocket(socketInstance);
    // When medicine update is received, update the medicines list in state
    socketInstance.on('medicineUpdate', (updatedMed) => {
      setMedicines((prev) => prev.map((m) => (m.id === updatedMed.id ? { ...m, ...updatedMed } : m)));
    });
    return () => {
      socketInstance.disconnect();
    };
  }, [currentUser?.id]);

  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Header */}
      <section className="bg-gradient-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">Basic Veterinarian Dashboard</h1>
              {userLoading ? (
                <p className="text-primary-foreground/90">Loading...</p>
              ) : currentUser ? (
                <p className="text-primary-foreground/90">
                  {currentUser.firstName} {currentUser.lastName} - {currentUser.sector} Sector
                </p>
              ) : (
                <p className="text-primary-foreground/90">Dr. Sarah Johnson - VET-RW-2024-001</p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">
                <PawPrint className="h-3 w-3 mr-1" />
                Basic Vet
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
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full lg:w-fit grid-cols-2 lg:grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="medicines">Medicines</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="track-reports">Track Reports</TabsTrigger>
            <TabsTrigger value="license">License Application</TabsTrigger>
          </TabsList>          

          {/* Overview Tab */}

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">

              <Card className="border-l-4 border-l-success cursor-pointer hover:bg-muted/30 transition"
                onClick={() => setSelectedTab('reports')}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Treatments</CardTitle>
                  <Stethoscope className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-success">{recentActivities.length}</div>
                  <p className="text-xs text-muted-foreground">Treatment records</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-warning cursor-pointer hover:bg-muted/30 transition"
                onClick={() => setSelectedTab('patients')}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">{recentPatients.length}</div>
                  <p className="text-xs text-muted-foreground">Registered patients</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-info cursor-pointer hover:bg-muted/30 transition"
                onClick={() => setSelectedTab('reports')}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Records</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-info">{recentActivities.length + recentPatients.length}</div>
                  <p className="text-xs text-muted-foreground">All records</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <Button 
                    onClick={() => setSelectedTab('license')}
                    className="h-auto p-6 flex flex-col items-center space-y-2 bg-gradient-primary text-primary-foreground hover:bg-primary/90"
                  >
                    <Award className="h-8 w-8" />
                    <span className="font-semibold">Create License</span>
                    <span className="text-xs opacity-90">Apply for veterinary license</span>
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => setShowPatientForm(true)}
                    className="h-auto p-6 flex flex-col items-center space-y-2"
                  >
                    <PawPrint className="h-8 w-8" />
                    <span className="font-semibold">Add Patient</span>
                    <span className="text-xs text-muted-foreground">Register new patient</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity (dynamic) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <span>Recent Activities</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(recentActivities.length ? recentActivities : activityRecords).slice(0, 3).map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="space-y-1">
                        <h4 className="font-medium">{activity.description || activity.diagnosis || 'Treatment record'}</h4>
                        <p className="text-sm text-muted-foreground">{activity.patientName} - {activity.ownerName}</p>
                        <p className="text-sm text-muted-foreground">{activity.date} at {activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patients Tab */}
          <TabsContent value="patients" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <PawPrint className="h-5 w-5 text-primary" />
                    <span>Patient Management</span>
                  </CardTitle>
                  <Button onClick={() => setShowPatientForm(true)}>
                    <PawPrint className="h-4 w-4 mr-2" />
                    Add New Patient
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentPatients.map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium">{patient.animalName}</h4>
                        <p className="text-sm text-muted-foreground">Owner: {patient.owner}</p>
                        <p className="text-sm text-muted-foreground">Last Visit: {patient.lastVisit}</p>
                        <p className="text-sm text-muted-foreground">Condition: {patient.condition}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openTreatmentModal(Number(patient.id))}
                        >
                          <Stethoscope className="h-4 w-4 mr-2" />
                          Record Treatment
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            setViewingPatientId(Number(patient.id));
                            setViewingLoading(true);
                            try {
                              const [pRes, tRes] = await Promise.all([
                                fetch(`${getApiUrl()}/api/v1/patients/${patient.id}`, { headers: getAuthHeaders() }),
                                fetch(`${getApiUrl()}/api/v1/treatments/patient/${patient.id}`, { headers: getAuthHeaders() }),
                              ]);
                              const pData = pRes.ok ? await pRes.json() : null;
                              const tData = tRes.ok ? await tRes.json() : [];
                              setViewingPatientData(pData);
                              setViewingTreatments(Array.isArray(tData) ? tData : []);
                            } finally {
                              setViewingLoading(false);
                            }
                          }}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View Details
                        </Button>
                        <Button 
                          size="sm" 
                          variant="default"
                          onClick={async () => {
                            try {
                              const res = await fetch(`${getApiUrl()}/api/v1/patients/${patient.id}`, { headers: getAuthHeaders() });
                              const data = res.ok ? await res.json() : null;
                              if (data) {
                                setEditingPatient({
                                  animalName: data.animalName || '',
                                  ownerName: data.ownerName || '',
                                  ownerPhone: data.ownerPhone || '',
                                  ownerEmail: data.ownerEmail || '',
                                  ownerIdNumber: data.ownerIdNumber || '',
                                  province: data.province || 'Kigali',
                                  district: data.district || '',
                                  sector: data.sector || '',
                                  cell: data.cell || '',
                                  village: data.village || '',
                                  previousConditions: data.previousConditions || '',
                                  id: data.id,
                                } as Patient);
                                setShowPatientForm(true);
                              }
                            } catch {
                              // Intentionally ignored error while updating patient
                            }
                          }}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Update Record
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medicines Tab */}
          <TabsContent value="medicines" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Syringe className="h-5 w-5 text-primary" />
                    <span>Medicine Inventory</span>
                  </CardTitle>
                  <Button onClick={() => setShowMedicineForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Medicine
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {medicineLoading ? (
                    <p>Loading medicines...</p>
                  ) : medicines.length === 0 ? (
                    <p className="text-muted-foreground">No medicines found. Add a new medicine to get started.</p>
                  ) : (
                    medicines.map((medicine) => (
                      <div key={medicine.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="space-y-1">
                          <h4 className="font-medium">{medicine.name}</h4>
                          <p className="text-sm text-muted-foreground">Current Stock: {medicine.currentStock} {medicine.unit}</p>
                          {medicine.expiryDate && (
                            <p className="text-sm text-muted-foreground">Expiry: {new Date(medicine.expiryDate).toLocaleDateString()}</p>
                          )}
                          <p className="text-sm text-muted-foreground">Total Stocked In: {medicine.stockIn || 0} {medicine.unit}</p>
                          <p className="text-sm text-muted-foreground">Total Stocked Out: {medicine.stockOut || 0} {medicine.unit}</p>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <Badge variant={medicine.currentStock > 10 ? "default" : "destructive"} className={medicine.currentStock > 10 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                            {medicine.currentStock > 10 ? "In Stock" : "Low Stock"}
                          </Badge>
                          <Button size="sm" variant="outline" onClick={() => setViewingMedicineData(medicine)}>
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                          <Button size="sm" onClick={() => { 
                            setSelectedMedicineForStock(medicine);
                            setShowStockInModal(true);
                          }}>
                            <Plus className="h-3 w-3 mr-1" />
                            Stock In
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => { 
                            setSelectedMedicineForStock(medicine);
                            setShowStockOutModal(true);
                          }}>
                            <Package className="h-3 w-3 mr-1" />
                            Stock Out
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => { setEditingMedicine(medicine); setShowMedicineForm(true); }}>
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <AlertTriangle>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Delete
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the
                                    medicine and remove its data from our servers.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => deleteMedicine(medicine.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </AlertTriangle>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileCheck className="h-5 w-5 text-primary" />
                  <span>Activity Reports</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Filters */}
                <div className="p-4 border rounded-lg bg-muted/50">
                  <h4 className="font-medium mb-4">Report Filters</h4>
                  <div className="grid md:grid-cols-3 gap-4 items-end">
                    <div className="space-y-2">
                      <Label htmlFor="reportPatient">Select Patient</Label>
                      <Select value={reportFilters.patientId} onValueChange={(value) => handleFilterChange('patientId', value)}>
                        <SelectTrigger id="reportPatient">
                          <SelectValue placeholder="Select a patient" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Patients</SelectItem>
                          {recentPatients.map(p => (
                            <SelectItem key={p.id} value={String(p.id)}>{p.animalName}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reportPeriod">Time Period</Label>
                      <Select value={reportFilters.period} onValueChange={(value) => handleFilterChange('period', value)}>
                        <SelectTrigger id="reportPeriod">
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="date">Specific Date</SelectItem>
                          <SelectItem value="week">This Week</SelectItem>
                          <SelectItem value="month">This Month</SelectItem>
                          <SelectItem value="year">This Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {reportFilters.period === 'date' && (
                      <div className="space-y-2">
                        <Label htmlFor="reportDate">Select Date</Label>
                        <Input 
                          id="reportDate" 
                          type="date" 
                          value={reportFilters.date}
                          onChange={(e) => handleFilterChange('date', e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Report Summary */}
                <div className="space-y-4">
                  <h4 className="font-medium">Filtered Activity Summary</h4>
                  <div className="p-4 border rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Treatments</p>
                        <p className="text-2xl font-bold">{reportSummary.totalActivities}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Patients Treated</p>
                        <p className="text-2xl font-bold">{reportSummary.patientsAttended}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Medicines Used</p>
                        <p className="text-2xl font-bold">{reportSummary.uniquePatients}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Treatments Recorded</p>
                        <p className="text-2xl font-bold">{reportSummary.uniquePatients}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Treatment Records Table */}
                <div>
                  <h4 className="font-medium mb-2">Treatment Records in Selected Period</h4>
                  <div className="border rounded-lg overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-muted">
                        <tr>
                          <th className="border px-3 py-2 text-left text-sm font-medium">Patient ID</th>
                          <th className="border px-3 py-2 text-left text-sm font-medium">Animal Name</th>
                          <th className="border px-3 py-2 text-left text-sm font-medium">Owner Name</th>
                          <th className="border px-3 py-2 text-left text-sm font-medium">Owner Phone</th>
                          <th className="border px-3 py-2 text-left text-sm font-medium">Owner Email</th>
                          <th className="border px-3 py-2 text-left text-sm font-medium">Owner ID</th>
                          <th className="border px-3 py-2 text-left text-sm font-medium">Province</th>
                          <th className="border px-3 py-2 text-left text-sm font-medium">District</th>
                          <th className="border px-3 py-2 text-left text-sm font-medium">Sector</th>
                          <th className="border px-3 py-2 text-left text-sm font-medium">Cell</th>
                          <th className="border px-3 py-2 text-left text-sm font-medium">Village</th>
                          <th className="border px-3 py-2 text-left text-sm font-medium">Previous Treatment</th>
                          <th className="border px-3 py-2 text-left text-sm font-medium">Date</th>
                          <th className="border px-3 py-2 text-left text-sm font-medium">Medicines</th>
                          <th className="border px-3 py-2 text-left text-sm font-medium">Diagnosis & Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredActivities.length > 0 ? (
                          filteredActivities.map((activity, index) => (
                            <tr key={`${activity.id}-${index}`} className="hover:bg-muted/50">
                              <td className="border px-3 py-2 text-sm">{activity.patientId}</td>
                              <td className="border px-3 py-2 text-sm font-medium">{activity.patientName}</td>
                              <td className="border px-3 py-2 text-sm">{activity.ownerName}</td>
                              <td className="border px-3 py-2 text-sm">{activity.ownerPhone}</td>
                              <td className="border px-3 py-2 text-sm">{activity.ownerEmail || '-'}</td>
                              <td className="border px-3 py-2 text-sm">{activity.ownerIdNumber || '-'}</td>
                              <td className="border px-3 py-2 text-sm">{activity.province || '-'}</td>
                              <td className="border px-3 py-2 text-sm">{activity.district || '-'}</td>
                              <td className="border px-3 py-2 text-sm">{activity.sector || '-'}</td>
                              <td className="border px-3 py-2 text-sm">{activity.cell || '-'}</td>
                              <td className="border px-3 py-2 text-sm">{activity.village || '-'}</td>
                              <td className="border px-3 py-2 text-sm">{activity.previousConditions || 'None'}</td>
                              <td className="border px-3 py-2 text-sm">{new Date(activity.date).toLocaleDateString()}</td>
                              <td className="border px-3 py-2 text-sm">{Array.isArray(activity.medications) ? activity.medications.join(', ') : (activity.medications || '-')}</td>
                              <td className="border px-3 py-2 text-sm">{activity.diagnosis || activity.notes || '-'}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={14} className="border px-3 py-8 text-center text-muted-foreground">
                              No treatment records found for the selected filters.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button className="w-full" onClick={handlePrepareReport}>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Report to Sector Vet
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Track Reports Tab */}
          <TabsContent value="track-reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span>My Submitted Reports</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingReports ? (
                  <div className="text-sm text-muted-foreground">Loading...</div>
                ) : myReports.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No reports submitted yet.</div>
                ) : (
                  <div className="border rounded-lg overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="border px-3 py-2 text-left">Title</th>
                          <th className="border px-3 py-2 text-left">Type</th>
                          <th className="border px-3 py-2 text-left">Status</th>
                          <th className="border px-3 py-2 text-left">Submitted</th>
                          <th className="border px-3 py-2 text-left">Target Sector</th>
                          <th className="border px-3 py-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myReports.map((r) => (
                          <tr key={r.id} className="hover:bg-muted/50">
                            <td className="border px-3 py-2">{r.title}</td>
                            <td className="border px-3 py-2">{String(r.reportType || '').replace('_', ' ')}</td>
                            <td className="border px-3 py-2">
                              <Badge variant="outline">{r.status}</Badge>
                            </td>
                            <td className="border px-3 py-2">{new Date(r.createdAt).toLocaleDateString()}</td>
                            <td className="border px-3 py-2">{r.sector}</td>
                            <td className="border px-3 py-2">
                              <div className="flex gap-2">
                                {r.status === 'REQUIRES_REVISION' && (
                                  <Button size="sm" variant="outline" onClick={() => handleOpenEditReport(r)}>
                                    <Edit className="h-3 w-3 mr-1" />
                                    Edit & Resubmit
                                  </Button>
                                )}
                                {r.status === 'REJECTED' && (
                                  <Button size="sm" variant="destructive" onClick={() => handleDeleteReport(r.id)}>
                                    <Trash2 className="h-3 w-3 mr-1" />
                                    Delete
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <div className="pt-4">
                  <Button variant="outline" onClick={() => setSelectedTab('reports')}>
                    <FileCheck className="h-4 w-4 mr-2" />
                    Create New Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* License Application Tab */}
          <TabsContent value="license" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-primary" />
                  <span>License Application</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="font-medium">Personal Information (Auto-filled)</h3>
                  <div className="grid md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                    <div>
                      <Label>Full Name</Label>
                      <p className="font-semibold">{currentUser?.firstName} {currentUser?.lastName}</p>
                    </div>
                    <div>
                      <Label>Email</Label>
                      <p className="font-semibold">{currentUser?.email}</p>
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <p className="font-semibold">{currentUser?.phone}</p>
                    </div>
                    <div>
                      <Label>Location</Label>
                      <p className="font-semibold">{currentUser?.sector}, {currentUser?.district}</p>
                    </div>
                  </div>
                </div>

                {/* Application Status */}
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Application Status</h3>
                    {loadingLicense ? (
                      <Badge variant="outline">Loading...</Badge>
                    ) : (
                      <Badge variant={
                        myLicenseApp?.status === 'APPROVED' ? 'default' : 
                        myLicenseApp?.status === 'REJECTED' ? 'destructive' :
                        myLicenseApp?.status ? 'secondary' : 'outline'
                      }>
                        {myLicenseApp?.status || 'Not Submitted'}
                      </Badge>
                    )}
                  </div>
                  {myLicenseApp?.status === 'APPROVED' && myLicenseApp?.licenseNumber && (
                    <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md flex items-center justify-between">
                      <p className="font-bold">License Number:</p>
                      <p className="font-semibold">{myLicenseApp.licenseNumber}</p>
                      <div>
                        <p className="font-bold">Issued On:</p>
                        <p className="font-semibold">{myLicenseApp.createdAt ? new Date(myLicenseApp.createdAt).toLocaleDateString() : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="font-bold">Expires On:</p>
                        <p className="font-semibold">{addYears(new Date(myLicenseApp.createdAt), 1).toLocaleDateString()}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={handleDownloadLicenseCard}
                        className="ml-4 bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Card
                      </Button>
                    </div>
                  )}
                  {myLicenseApp?.status === 'APPROVED' && myLicenseApp?.licenseNumber && currentUser && (
                    <div className="hidden">
                      <LicenseCard
                        ref={licenseCardRef}
                        user={currentUser}
                        licenseNumber={myLicenseApp.licenseNumber}
                        fieldOfPractice={myLicenseApp.fieldOfPractice}
                        licenseType={myLicenseApp.licenseType}
                        issuedDate={myLicenseApp.createdAt} // Pass createdAt as issuedDate
                        expiryDate={addYears(new Date(myLicenseApp.createdAt), 1).toLocaleDateString()} // Calculate expiryDate
                      />
                    </div>
                  )}
                  {myLicenseApp?.status === 'REJECTED' && (
                    <div className="text-red-700 bg-red-100 p-3 rounded-md"><p className="font-bold">Rejection Reason:</p><p>{myLicenseApp.reviewNotes || 'No reason provided.'}</p></div>
                  )}
                  <p className="text-sm text-muted-foreground">
                    Complete all sections below and submit your application for review.
                  </p>
                </div>

                {/* Required Documents */}
                <div className="space-y-4">
                  <h3 className="font-medium">Required Documents</h3>
                  
                  <div className="space-y-2">
                      <Label htmlFor="paymentReceipt">Payment Receipt</Label>
                      <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 text-center">
                        <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                        <input
                          type="file"
                          id="paymentReceipt"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => handleFileUpload('paymentReceipt', e.target.files?.[0] || null)}
                          className="hidden"
                          title="Upload payment receipt"
                          placeholder="Select payment receipt file"
                        />
                        <Label htmlFor="paymentReceipt" className="cursor-pointer text-primary hover:underline text-sm">
                          Upload payment receipt
                        </Label>
                        {licenseApplication.paymentReceipt && (
                          <p className="text-xs text-success mt-2">✓ {licenseApplication.paymentReceipt.name}</p>
                        )}
                      </div>
                    </div>
                </div>

                {/* Application Details */}
                <div className="space-y-4">
                  <h3 className="font-medium">Application Details</h3>
                  <div className="space-y-2">
                    <Label htmlFor="licenseType">License Type *</Label>
                    <Select 
                      value={licenseApplication.licenseType}
                      onValueChange={(value) => setLicenseApplication(prev => ({ ...prev, licenseType: value, specialization: '' }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select license type" />
                      </SelectTrigger>
                      <SelectContent>
                        {licenseOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label} (Rwf {option.price.toLocaleString()})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fieldOfPractice">Field of practice</Label>
                    <Select
                      value={licenseApplication.specialization}
                      onValueChange={value => setLicenseApplication(prev => ({ ...prev, specialization: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select field of practice" />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldsOfPractice.map(field => (
                          <SelectItem key={field.id} value={field.name}>{field.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex space-x-4 wd-half">
                  {!myLicenseApp || myLicenseApp.status === 'REJECTED' ? (
                    <Button 
                      onClick={submitLicenseApplication}
                      className="flex-1"
                      disabled={loadingLicense}
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      {myLicenseApp?.status === 'REJECTED' ? 'Resubmit Application' : 'Submit Application'}
                    </Button>
                  ) : (
                    <Button disabled className="flex-1">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Application Submitted
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Patient Details Modal (live from API) */}
      {viewingPatientId && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border rounded-lg shadow-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">Patient Details</h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setViewingPatientId(null);
                  setViewingPatientData(null);
                  setViewingTreatments([]);
                }}
              >
                Close
              </Button>
            </div>
            <div className="p-6 space-y-6">
              {viewingLoading ? (
                <div className="text-sm text-muted-foreground">Loading...</div>
              ) : viewingPatientData ? (
                <>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <h3 className="font-medium">Animal Info</h3>
                      <p className="text-sm"><span className="text-muted-foreground">Name:</span> {viewingPatientData.animalName}</p>
                      <p className="text-sm"><span className="text-muted-foreground">Existing Condition:</span> {viewingPatientData.previousConditions || '—'}</p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-medium">Owner Info</h3>
                      <p className="text-sm"><span className="text-muted-foreground">Name:</span> {viewingPatientData.ownerName}</p>
                      <p className="text-sm"><span className="text-muted-foreground">Phone:</span> {viewingPatientData.ownerPhone}</p>
                      <p className="text-sm"><span className="text-muted-foreground">Email:</span> {viewingPatientData.ownerEmail || '—'}</p>
                      <p className="text-sm"><span className="text-muted-foreground">ID:</span> {viewingPatientData.ownerIdNumber || '—'}</p>
                      <p className="text-sm"><span className="text-muted-foreground">Address:</span> {`${viewingPatientData.province || ''} ${viewingPatientData.district || ''} ${viewingPatientData.sector || ''} ${viewingPatientData.cell || ''} ${viewingPatientData.village || ''}`.trim()}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Treatments</h3>
                    <table className="min-w-full border">
                      <thead>
                        <tr>
                          <th className="border px-2 py-1">Date</th>
                          <th className="border px-2 py-1">Medicines & Prescription</th>
                          <th className="border px-2 py-1">Diagnosis & Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewingTreatments.map((treatment) => (
                          <tr key={treatment.id}>
                            <td className="border px-2 py-1">
                              {new Date(treatment.date).toLocaleDateString()}
                            </td>
                            <td className="border px-2 py-1">
                              {treatment.medicinesAndPrescription || '-'}
                            </td>
                            <td className="border px-2 py-1">
                              {treatment.diagnosisAndNotes || '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Patient not found.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Forms */}
      {showPatientForm && (
        <PatientForm 
          onClose={() => {
            setShowPatientForm(false);
            setEditingPatient(undefined);
          }}
          editingPatient={editingPatient}
        />
      )}

      {/* Add/Edit Activity Modal removed */}

      {/* Activity Details Modal */}
      {viewingActivity && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-background border rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">Activity Details - {viewingActivity.description}</h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setViewingActivity(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6 space-y-6">
              {/* Activity Header */}
              <div className="flex items-start space-x-4 p-4 bg-primary/5 rounded-lg">
                <div className={`p-3 rounded-full ${getActivityTypeColor(viewingActivity.type)}`}>
                  {getActivityTypeIcon(viewingActivity.type)}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{viewingActivity.description}</h3>
                  <p className="text-muted-foreground">
                    {viewingActivity.patientName} - {viewingActivity.ownerName}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    {getStatusBadge(viewingActivity.status)}
                    <Badge variant="outline" className="capitalize">
                      {viewingActivity.type}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Activity Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-primary mb-3">Activity Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Date & Time</p>
                        <p className="text-sm text-muted-foreground">{viewingActivity.date} at {viewingActivity.time}</p>
                      </div>
                    </div>
                    {viewingActivity.diagnosis && (
                      <div className="flex items-center space-x-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Diagnosis</p>
                          <p className="text-sm text-muted-foreground">{viewingActivity.diagnosis}</p>
                        </div>
                      </div>
                    )}
                    {viewingActivity.treatment && (
                      <div className="flex items-center space-x-3">
                        <StethoscopeIcon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Treatment</p>
                          <p className="text-sm text-muted-foreground">{viewingActivity.treatment}</p>
                        </div>
                      </div>
                    )}
                    {viewingActivity.medications && viewingActivity.medications.length > 0 && (
                      <div className="flex items-center space-x-3">
                        <Syringe className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Medications</p>
                          <p className="text-sm text-muted-foreground">{viewingActivity.medications.join(', ')}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-primary mb-3">Owner Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Owner Name</p>
                        <p className="text-sm text-muted-foreground">{viewingActivity.ownerName}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <p className="text-sm text-muted-foreground">{viewingActivity.ownerPhone}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-sm text-muted-foreground">{viewingActivity.ownerEmail}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Address</p>
                        <p className="text-sm text-muted-foreground">{`${viewingPatientData.province || ''} ${viewingPatientData.district || ''} ${viewingPatientData.sector || ''} ${viewingPatientData.cell || ''} ${viewingPatientData.village || ''}`.trim()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {viewingActivity.notes && (
                <div>
                  <h4 className="font-medium text-primary mb-3">Notes</h4>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">{viewingActivity.notes}</p>
                  </div>
                </div>
              )}

              {/* Attachments */}
              {viewingActivity.attachments && viewingActivity.attachments.length > 0 && (
                <div>
                  <h4 className="font-medium text-primary mb-3">Attachments</h4>
                  <div className="flex flex-wrap gap-2">
                    {viewingActivity.attachments.map((attachment, index) => (
                      <Badge key={index} variant="outline" className="cursor-pointer hover:bg-primary hover:text-primary-foreground">
                        <FileText className="h-3 w-3 mr-1" />
                        {attachment}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button 
                  variant="outline"
                  onClick={() => {
                    handleEditActivity(viewingActivity);
                    setViewingActivity(null);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Activity
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setViewingActivity(null);
                    handleDeleteActivity(viewingActivity.id);
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
      
      {/* Report Submission Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <span>Submit Report to Sector Vet</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reportTitle">Report Title *</Label>
                <Input
                  id="reportTitle"
                  placeholder="Enter report title"
                  value={reportForm.title}
                  onChange={(e) => setReportForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reportType">Report Type *</Label>
                <Select
                  value={reportForm.reportType}
                  onValueChange={(value) => setReportForm(prev => ({ ...prev, reportType: value as ReportTypeString }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Monthly Report</SelectItem>
                    <SelectItem value="QUARTERLY">Quarterly Report</SelectItem>
                    <SelectItem value="ANNUAL">Annual Report</SelectItem>
                    <SelectItem value="EMERGENCY">Emergency Report</SelectItem>
                    <SelectItem value="INCIDENT">Incident Report</SelectItem>
                    <SelectItem value="VACCINATION_CAMPAIGN">Vaccination Campaign</SelectItem>
                    <SelectItem value="DISEASE_OUTBREAK">Disease Outbreak</SelectItem>
                    <SelectItem value="PHARMACEUTICAL">Pharmaceutical Report</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reportContent">Report Content *</Label>
                <Textarea
                  id="reportContent"
                  placeholder="Enter detailed report content..."
                  rows={8}
                  value={reportForm.content}
                  onChange={(e) => setReportForm(prev => ({ ...prev, content: e.target.value }))}
                />
              </div>

              {reportForm.reportType === 'PHARMACEUTICAL' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={reportForm.startDate}
                      onChange={(e) => setReportForm(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={reportForm.endDate}
                      onChange={(e) => setReportForm(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </div>
                </div>
              )}

              <div className="flex space-x-4 pt-4">
                <Button onClick={handleSubmitReport} className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  Submit Report
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowReportModal(false)} 
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {editReport && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Edit className="h-5 w-5 text-primary" />
                <span>Edit Report (Resubmit)</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="editTitle">Title</Label>
                <Input
                  id="editTitle"
                  value={editReportForm.title}
                  onChange={(e) => setEditReportForm((p) => ({ ...p, title: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="editContent">Content</Label>
                <Textarea
                  id="editContent"
                  rows={6}
                  value={editReportForm.content}
                  onChange={(e) => setEditReportForm((p) => ({ ...p, content: e.target.value }))}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleResubmitReport} className="flex-1">
                  <Send className="h-4 w-4 mr-2" />
                  Resubmit (set to Pending)
                </Button>
                <Button variant="outline" onClick={() => setEditReport(null)} className="flex-1">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {treatmentModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Record Treatment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="treatDate">Date *</Label>
                  <Input
                    id="treatDate"
                    type="date"
                    value={treatmentForm.date}
                    onChange={(e) => setTreatmentForm({ ...treatmentForm, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Patient ID</Label>
                  <Input value={treatmentForm.patientId} readOnly />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagnosis">Diagnosis</Label>
                <Input
                  id="diagnosis"
                  placeholder="e.g., Wound infection"
                  value={treatmentForm.diagnosis}
                  onChange={(e) => setTreatmentForm({ ...treatmentForm, diagnosis: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Additional notes..."
                  value={treatmentForm.notes}
                  onChange={(e) => setTreatmentForm({ ...treatmentForm, notes: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medications">Medications (comma-separated)</Label>
                <Input
                  id="medications"
                  placeholder="Amoxicillin 500mg, Paracetamol 1g"
                  value={treatmentForm.medications}
                  onChange={(e) => setTreatmentForm({ ...treatmentForm, medications: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Separate multiple medications with commas.</p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={handleSubmitTreatment} disabled={treatmentSaving} className="flex-1">
                  {treatmentSaving ? 'Saving...' : 'Save Treatment'}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setTreatmentModalOpen(false)}
                  disabled={treatmentSaving}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* User Profile Modal */}
      {currentUser?.email && (
        <UserProfileDropdown
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          currentEmail={currentUser.email}
          onProfileUpdated={handleProfileUpdated}
          passportPhotoUrl={currentUser.passportPhoto}
        />
      )}

      {/* Medicine Form Modal */}
      {showMedicineForm && currentUser?.id && (
        <MedicineForm
          onClose={() => {
            setShowMedicineForm(false);
            setEditingMedicine(undefined);
          }}
          editingMedicine={editingMedicine}
          onSuccess={reloadMedicines}
          veterinarianId={Number(currentUser.id)}
        />
      )}

      {/* Medicine Details Modal */}
      {viewingMedicineData && (
        <MedicineDetails
          medicine={viewingMedicineData}
          onClose={() => setViewingMedicineData(null)}
          onUpdateStock={(med) => {
            setSelectedMedicineForStock(med);
            setShowStockInModal(true); // Default to stock in, user can choose stock out from the modal
          }}
        />
      )}

      {/* User Profile Modal */}
      {currentUser?.email && (
        <UserProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          currentEmail={currentUser.email}
          onProfileUpdated={handleProfileUpdated}
          currentPassportPhotoUrl={currentUser.passportPhoto}
        />
      )}


      {/* Stock In Modal */}
      {showStockInModal && selectedMedicineForStock && (
        <Dialog open={showStockInModal} onOpenChange={setShowStockInModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Stock In {selectedMedicineForStock.name}</DialogTitle>
              <DialogDescription>
                Enter the quantity of medicine to add to stock.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stock-in-quantity" className="text-right">
                  Quantity
                </Label>
                <Input
                  id="stock-in-quantity"
                  type="number"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(Number(e.target.value))}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowStockInModal(false)}>Cancel</Button>
              <Button onClick={handleStockIn}>Stock In</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Stock Out Modal */}
      {showStockOutModal && selectedMedicineForStock && (
        <Dialog open={showStockOutModal} onOpenChange={setShowStockOutModal}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Stock Out {selectedMedicineForStock.name}</DialogTitle>
              <DialogDescription>
                Enter the quantity of medicine to dispense from stock.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stock-out-quantity" className="text-right">
                  Quantity
                </Label>
                <Input
                  id="stock-out-quantity"
                  type="number"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(Number(e.target.value))}
                  className="col-span-3"
                />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                Current available stock: {selectedMedicineForStock.currentStock} {selectedMedicineForStock.unit}
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowStockOutModal(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleStockOut}>Stock Out</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Report Form Modal */}
      {showReportForm && currentUser && (
        <ReportForm
          onClose={() => setShowReportForm(false)}
          onSuccess={loadReports}
          veterinarianId={currentUser.id}
        />
      )}

      {/* View Report Details Modal */}
      {viewingReportId !== null && (
        <ReportDetails
          reportId={viewingReportId}
          onClose={() => setViewingReportId(null)}
        />
      )}

    </div>
  );
};

export default BasicDashboard;
