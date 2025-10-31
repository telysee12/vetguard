import { useMemo, useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  Stethoscope, 
  Users, 
  FileCheck, 
  Activity,  
  LogOut,
  Eye,
  Download,
  MapPin,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  PawPrint,
  Shield,
  Send,
  User,
  Phone,
  Mail,
  Calendar,
  FileText,
  XCircle,
  Edit,
  Trash2
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { getApiUrl, getAuthHeaders } from '../lib/api';
import UserProfileDropdown from '../components/UserProfileDropdown';
import UserProfileModal from '../components/UserProfileModal';

// Data structures based on actual database schema
interface BasicVet {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  province: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  // Computed fields
  totalPatients?: number;
  totalTreatments?: number;
  lastActivity?: string;
}

interface Patient {
  id: number;
  animalName: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  ownerIdNumber?: string;
  province: string;
  district?: string;
  sector?: string;
  cell?: string;
  village?: string;
  previousConditions?: string;
  veterinarianId: number;
  veterinarian: BasicVet;
  createdAt: string;
  updatedAt: string;
  treatments: Treatment[];
}

interface Treatment {
  id: number;
  patientId: number;
  patient: Patient;
  veterinarianId: number;
  veterinarian: BasicVet;
  date: string;
  diagnosisAndNotes?: string;
  medicinesAndPrescription?: string;
  createdAt: string;
  updatedAt: string;
}

// Add Report interface
interface Report {
  id: number;
  title: string;
  content: string;
  reportType: string;
  status: string;
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
  submitter: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    sector: string;
    district: string;
  };
}

const SectorDashboard = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // User state management
  const [currentUser, setCurrentUser] = useState<BasicVet | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  
  // Data state
  const [basicVets, setBasicVets] = useState<BasicVet[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Add report state
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportNotes, setReportNotes] = useState('');
  const [reportStatus, setReportStatus] = useState('PENDING');

  // Vet details modal state
  const [selectedVet, setSelectedVet] = useState<BasicVet | null>(null);
  const [isVetDetailsModalOpen, setIsVetDetailsModalOpen] = useState(false);

  const [vetDetailsOpen, setVetDetailsOpen] = useState(false);
  const [vetDetails, setVetDetails] = useState<BasicVet | null>(null);

  // Reporting state
  const [reportPeriod, setReportPeriod] = useState<'week' | 'month' | 'custom'>('month');
  const [reportFrom, setReportFrom] = useState<string>(''); // YYYY-MM-DD
  const [reportTo, setReportTo] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  const [generatedTitle, setGeneratedTitle] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [sectorComments, setSectorComments] = useState('');

  // Period range helper
  const getDateRange = () => {
    const today = new Date();
    if (reportPeriod === 'week') {
      const start = new Date(today);
      start.setDate(today.getDate() - today.getDay());
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return [start, end] as const;
    }
    if (reportPeriod === 'month') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      return [start, end] as const;
    }
    // custom
    const start = reportFrom ? new Date(reportFrom + 'T00:00:00') : new Date(today.getFullYear(), today.getMonth(), 1);
    const end = reportTo ? new Date(reportTo + 'T23:59:59') : new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
    return [start, end] as const;
  };

  const formatNum = (n: number) => n.toLocaleString();

  // Build report content from current state
  const buildSectorReport = () => {
    const [start, end] = getDateRange();

    // Patients in range (by registration date)
    const inRangePatients = patients.filter(p => {
      const created = new Date(p.createdAt);
      return created >= start && created <= end;
    });

    // Per-vet patient counts in range
    const perVetPatientCounts: Record<number, number> = {};
    inRangePatients.forEach(p => {
      const vetId = p.veterinarianId || p.veterinarian?.id;
      if (vetId) perVetPatientCounts[Number(vetId)] = (perVetPatientCounts[Number(vetId)] || 0) + 1;
    });

    const totalVets = basicVets.length;

    // Title
    const [sY, sM, sD] = [start.getFullYear(), start.toLocaleString(undefined, { month: 'long' }), start.getDate()];
    const [eY, eM, eD] = [end.getFullYear(), end.toLocaleString(undefined, { month: 'long' }), end.getDate()];
    const periodLabel = reportPeriod === 'week'
      ? `Week of ${sM} ${sD}, ${sY} - ${eM} ${eD}, ${eY}`
      : reportPeriod === 'month'
        ? `${sM} ${sY}`
        : `${sM} ${sD}, ${sY} - ${eM} ${eD}, ${eY}`;
    const title = `Sector Veterinary Report — ${currentUser?.sector} Sector — ${periodLabel}`;

    const vetsList = basicVets
      .map(v => `- ${v.firstName} ${v.lastName} (${v.email}, ${v.phone})`)
      .join('\n') || '—';

    const perVetLines = basicVets
      .map(v => {
        const c = perVetPatientCounts[v.id] || 0;
        return `- ${v.firstName} ${v.lastName}: ${c} patients registered`;
      })
      .join('\n') || '—';

    const samplePatients = inRangePatients.slice(0, 10)
      .map(p => `- ${new Date(p.createdAt).toLocaleDateString()} | ${p.animalName} | Owner: ${p.ownerName} | Vet: ${p.veterinarian?.firstName || ''} ${p.veterinarian?.lastName || ''}`)
      .join('\n') || '—';

    const content = [
      `Total Basic Vets: ${totalVets}`,
      `Names of Basic Vets in this Sector: ${basicVets.map(v => `${v.firstName} ${v.lastName}`).join(', ') || 'N/A'}`,
      `Total Patients (in the selected period): ${inRangePatients.length}`,
      `Patients handled in this period: ${inRangePatients.map(p => p.previousConditions || 'N/A').join(', ') || 'N/A'}`,
      `Animals handled in this period: ${inRangePatients.map(p => p.animalName).join(', ') || 'N/A'}`,
    ].join('\n');

    setGeneratedTitle(title);
    setGeneratedContent(content);
  };

  const handleSubmitSectorReport = async () => {
    if (!currentUser) return;
    try {
      setGenerating(true);
      // Build latest content to ensure current filters
      buildSectorReport();

      const reportType =
        reportPeriod === 'week' ? 'OTHER' :
        reportPeriod === 'month' ? 'MONTHLY' : 'OTHER';

      // slight delay to ensure state is updated (or compute local var directly)
      const payload = {
        title: generatedTitle || `Sector Veterinary Report — ${currentUser.sector}`,
        content: generatedContent || '',
        reportType,
        sector: currentUser.sector,
        district: currentUser.district,
        province: currentUser.province,
        sectorVetNotes: sectorComments?.trim() || undefined,
      };

      const res = await fetch(`${getApiUrl()}/api/v1/reports`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to submit sector report');
      }
      toast({ title: 'Report Submitted', description: 'Sector report submitted successfully.' });
    } catch (e: unknown) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to submit sector report',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  const parseReportContent = (content: string) => {
    const lines = content.split('\n');
    const data: Record<string, string> = {};
    lines.forEach(line => {
      if (line.startsWith('Total Basic Vets:')) data.totalBasicVets = line.replace('Total Basic Vets: ', '');
      else if (line.startsWith('Names of Basic Vets in this Sector:')) data.basicVetNames = line.replace('Names of Basic Vets in this Sector: ', '');
      else if (line.startsWith('Total Patients (in the selected period):')) data.totalPatients = line.replace('Total Patients (in the selected period): ', '');
      else if (line.startsWith('Patients handled in this period:')) data.patientNames = line.replace('Patients handled in this period: ', '');
      else if (line.startsWith('Animals handled in this period:')) data.animalNames = line.replace('Animals handled in this period: ', '');
    });
    return data;
  };

  const { toast } = useToast();

  // Reports tab filters (period-based)
  const [reportFilters, setReportFilters] = useState<{ period: 'date' | 'week' | 'month' | 'year'; date: string }>({
    period: 'month',
    date: new Date().toISOString().split('T')[0],
  });
  const handleFilterChange = (field: 'period' | 'date', value: string) => {
    setReportFilters(prev => ({ ...prev, [field]: value }));
  };
  const getRangeFromFilters = (): [Date, Date] => {
    const today = new Date();
    switch (reportFilters.period) {
      case 'date': {
        const d = new Date(reportFilters.date + 'T00:00:00');
        const end = new Date(reportFilters.date + 'T23:59:59');
        return [d, end];
      }
      case 'week': {
        const start = new Date(today);
        start.setDate(today.getDate() - today.getDay());
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        return [start, end];
      }
      case 'year': {
        const start = new Date(today.getFullYear(), 0, 1);
        const end = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
        return [start, end];
      }
      case 'month':
      default: {
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
        return [start, end];
      }
    }
  };
  const filteredPatientsForReports = patients.filter(p => {
    const [start, end] = getRangeFromFilters();
    const created = new Date(p.createdAt);
    return created >= start && created <= end;
  });

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

  // Load sector data
  useEffect(() => {
    const loadData = async () => {
      if (!currentUser?.sector) {
        // If there's no user or sector, we can't load data.
        // If user is loading, we'll wait. If not, there's nothing to load.
        if (!userLoading) {
          setLoading(false);
        }
        return;
      }
      
      setLoading(true);
      try {
        const [vetsRes, patientsRes, treatmentsRes] = await Promise.all([
          fetch(`${getApiUrl()}/api/v1/register/sector/${currentUser.sector}`, { headers: getAuthHeaders() }),
          fetch(`${getApiUrl()}/api/v1/patients/sector/${currentUser.sector}`, { headers: getAuthHeaders() }),
          fetch(`${getApiUrl()}/api/v1/treatments/sector/${currentUser.sector}`, { headers: getAuthHeaders() }),
        ]);

        if (!vetsRes.ok || !patientsRes.ok || !treatmentsRes.ok) {
          throw new Error('Failed to fetch sector data');
        }

        const [vetsData, patientsData, treatmentsData] = await Promise.all([
          vetsRes.json(),
          patientsRes.json(),
          treatmentsRes.json(),
        ]);

        setPatients(patientsData || []);
        setTreatments(treatmentsData || []);

        const vetsWithCounts = (vetsData || [])
          .filter((vet: BasicVet) => vet.role === 'BASIC_VET')
          .map((vet: BasicVet) => {
            const vetPatients = (patientsData || []).filter(
              (p: Patient) => (p.veterinarianId ?? p.veterinarian?.id) === vet.id
            );

            // Last activity based on most recent patient's registration
            const lastActivity = vetPatients.length > 0
              ? vetPatients.reduce((latest: Date, p: Patient) => {
                  const d = new Date(p.createdAt);
                  return d > latest ? d : latest;
                }, new Date(0)).toISOString()
              : vet.createdAt;

            return {
              ...vet,
              totalPatients: vetPatients.length,
              lastActivity: lastActivity,
            };
          });

        setBasicVets(vetsWithCounts);
      } catch (error) {
        console.error('Failed to load sector data:', error);
        toast({
          title: "Error",
          description: "Failed to load sector data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser, userLoading, toast]);

  // Load reports
  useEffect(() => {
    const loadReports = async () => {
      if (currentUser?.sector) {
        try {
        const res = await fetch(`${getApiUrl()}/api/v1/reports/basic-vet-reports/sector/${currentUser.sector}`, {
            headers: getAuthHeaders()
          });
          if (res.ok) {
            const reportsData = await res.json();
            setReports(reportsData);
          }
        } catch (error) {
          console.error('Failed to load reports:', error);
        }
      }
    };

    loadReports();
  }, [currentUser?.sector]);

  const handleLogout = () => {
    // Clear stored user data and token
    localStorage.removeItem('vgms_user');
    localStorage.removeItem('vgms_token');
    window.location.href = '/login';
  };

  const handleProfileUpdated = (updatedUser: BasicVet) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('vgms_user', JSON.stringify(updatedUser));
  };

  // Filter basic vets
  const filteredVets = useMemo(() => {
    return basicVets.filter(vet => {
      const matchesSearch = 
        vet.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vet.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vet.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vet.phone.includes(searchTerm);
      
      const matchesStatus = filterStatus === 'all' || vet.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [basicVets, searchTerm, filterStatus]);

  // Calculate sector statistics
  const sectorStats = useMemo(() => {
    const totalPatients = patients.length;
    const totalTreatments = treatments.length;
    const activeVets = basicVets.filter(vet => vet.status === 'APPROVED').length;
    const totalVets = basicVets.length;
    
    // Calculate average treatments per vet
    const avgTreatmentsPerVet = totalVets > 0 ? (totalTreatments / totalVets).toFixed(1) : '0';
    
    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentTreatments = treatments.filter(treatment => 
      new Date(treatment.date) >= sevenDaysAgo
    ).length;

    return {
      totalVets,
      activeVets,
      totalPatients,
      totalTreatments,
      avgTreatmentsPerVet,
      recentTreatments
    };
  }, [basicVets, patients, treatments]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
      case 'PENDING':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive"><AlertCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleReviewReport = async (reportId: number) => {
    try {
      const res = await fetch(`${getApiUrl()}/api/v1/reports/${reportId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          status: reportStatus,
          sectorVetNotes: reportNotes,
          reviewedBy: currentUser?.id
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to update report');
      }

      toast({
        title: "Report Updated",
        description: "Report status has been updated successfully",
      });

      setShowReportModal(false);
      setSelectedReport(null);
      setReportNotes('');
      setReportStatus('PENDING');

      // Reload reports
      const reportsRes = await fetch(`${getApiUrl()}/api/v1/reports/basic-vet-reports/sector/${currentUser?.sector}`, {
        headers: getAuthHeaders()
      });
      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setReports(reportsData);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update report",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'REVIEWED': return 'bg-blue-100 text-blue-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'REQUIRES_REVISION': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />;
      case 'REVIEWED': return <Eye className="h-4 w-4" />;
      case 'APPROVED': return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED': return <XCircle className="h-4 w-4" />;
      case 'REQUIRES_REVISION': return <FileText className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const [mySectorReports, setMySectorReports] = useState<Report[]>([]);
  const [loadingSectorReports, setLoadingSectorReports] = useState(false);
  const [editSectorReport, setEditSectorReport] = useState<Report | null>(null);
  const [editSectorReportForm, setEditSectorReportForm] = useState({ title: '', content: '' });

  useEffect(() => {
    const loadSectorReports = async () => {
      if (!currentUser?.id) return;
      try {
        setLoadingSectorReports(true);
        const res = await fetch(`${getApiUrl()}/api/v1/reports/mine`, { headers: getAuthHeaders() });
        if (res.ok) {
          const data = await res.json();
          setMySectorReports(Array.isArray(data) ? data : []);
        }
      } finally {
        setLoadingSectorReports(false);
      }
    };
    loadSectorReports();
  }, [currentUser?.id]);

  const openEditSectorReport = (r: Report) => {
    setEditSectorReport(r);
    setEditSectorReportForm({ title: r.title || '', content: r.content || '' });
  };

  const handleResubmitSectorReport = async () => {
    if (!editSectorReport) return;
    try {
      const res = await fetch(`${getApiUrl()}/api/v1/reports/${editSectorReport.id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          submitterEdit: true,
          title: editSectorReportForm.title,
          content: editSectorReportForm.content,
        }),
      });
      if (!res.ok) throw new Error('Failed to resubmit report');
      toast({ title: 'Report Resubmitted', description: 'Report moved back to Pending' });
      setEditSectorReport(null);
      // reload list
      const list = await fetch(`${getApiUrl()}/api/v1/reports/mine`, { headers: getAuthHeaders() }).then(r => r.json());
      setMySectorReports(Array.isArray(list) ? list : []);
    } catch (e: unknown) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed', variant: 'destructive' });
    }
  };

  const handleDeleteSectorReport = async (id: number) => {
    if (!confirm('Delete this report?')) return;
    try {
      const res = await fetch(`${getApiUrl()}/api/v1/reports/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (!res.ok) throw new Error('Failed to delete report');
      toast({ title: 'Report Deleted' });
      setMySectorReports(prev => prev.filter(r => r.id !== id));
    } catch (e: unknown) {
      toast({ title: 'Error', description: e instanceof Error ? e.message : 'Failed', variant: 'destructive' });
    }
  };

  // Compute report counts for the summary
  const reportCounts = useMemo(() => {
    let approved = 0;
    let rejected = 0;
    let pending = 0;
    (reports || []).forEach((r) => {
      const s = (r.status || '').toUpperCase();
      if (s.includes('APPROVE')) {
        approved += 1;
      } else if (s.includes('REJECT')) {
        rejected += 1;
      } else if (s.includes('PENDING') || s.includes('REVIEWED') || s.includes('REVISION')) {
        pending += 1;
      } else {
        pending += 1; // Default to pending
      }
    });
    return { approved, rejected, pending };
  }, [reports]);

  const submitSectorReportFromReportsTab = async () => {
    // Map reports tab period filters to reportPeriod/reportFrom/reportTo
    const { period, date } = reportFilters;
    if (period === 'date') {
      setReportPeriod('custom');
      setReportFrom(date);
      setReportTo(date);
    } else if (period === 'week') {
      setReportPeriod('week');
      setReportFrom('');
      setReportTo('');
    } else if (period === 'month') {
      setReportPeriod('month');
      setReportFrom('');
      setReportTo('');
    } else if (period === 'year') {
      // Use custom for full year
      const start = `${new Date().getFullYear()}-01-01`;
      const end = `${new Date().getFullYear()}-12-31`;
      setReportPeriod('custom');
      setReportFrom(start);
      setReportTo(end);
    }
    // Build preview and submit
    buildSectorReport();
    await handleSubmitSectorReport();
  };

  if (userLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading sector data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Header */}
      <section className="bg-gradient-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">Sector Veterinary Dashboard</h1>
              {userLoading ? (
                <p className="text-primary-foreground/90">Loading...</p>
              ) : currentUser ? (
                <p className="text-primary-foreground/90">
                  {currentUser.firstName} {currentUser.lastName} - {currentUser.sector} Sector
                </p>
              ) : (
                <p className="text-primary-foreground/90">Sector Administration</p>
              )}
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">
                <Stethoscope className="h-3 w-3 mr-1" />
                Sector Level
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
            <TabsTrigger value="vets">Basic Vets</TabsTrigger>
            <TabsTrigger value="patients">Patient Records</TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Reports ({reports.length})</span>
            </TabsTrigger>
            <TabsTrigger value="generate-sector-report" className="flex items-center space-x-2">
              <FileCheck className="h-4 w-4" />
              <span>Generate Sector Report</span>
            </TabsTrigger>
            <TabsTrigger value="track-sector-reports" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Track Reports</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-l-4 border-l-primary cursor-pointer hover:bg-muted/30 transition"
                onClick={() => setSelectedTab('vets')}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Basic Vets</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">{basicVets.length}</div>
                  <p className="text-xs text-muted-foreground">{basicVets.filter(vet => vet.status === 'APPROVED').length} active</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-secondary cursor-pointer hover:bg-muted/30 transition"
                onClick={() => setSelectedTab('patients')}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                  <PawPrint className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-secondary">{patients.length}</div>
                  <p className="text-xs text-muted-foreground">Registered patients</p>
                </CardContent>
              </Card>

              
                          </div>

            {/* Recent Patients */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PawPrint className="h-5 w-5 text-primary" />
                  <span>Recent Patients</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patients.slice(0, 5).map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">
                          {patient.animalName} - {patient.ownerName}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Vet: {(patient.veterinarian?.firstName || 'Unknown')} {(patient.veterinarian?.lastName || '')} |
                          Phone: {patient.ownerPhone} |
                          Registered: {new Date(patient.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">Patient</Badge>
                        <Button size="sm" variant="outline" onClick={() => setSelectedTab('patients')}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                  {patients.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">No recent patients found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Basic Vets Tab */}
          <TabsContent value="vets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>Basic Veterinarians Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <Label htmlFor="search">Search Veterinarians</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="search"
                        placeholder="Search by name, email, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-48">
                    <Label htmlFor="status-filter">Status Filter</Label>
                    <select
                      id="status-filter"
                      aria-label="Status Filter"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="w-full p-2 border border-input rounded-md bg-background"
                    >
                      <option value="all">All Status</option>
                      <option value="APPROVED">Active</option>
                      <option value="PENDING">Pending</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                </div>

                {/* Veterinarian List */}
                <div className="space-y-4">
                  {filteredVets.map((vet) => (
                    <Card key={vet.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-3">
                              <div>
                                <h3 className="text-lg font-semibold">
                                  {vet.firstName} {vet.lastName}
                                </h3>
                                <p className="text-sm text-muted-foreground">{vet.email}</p>
                              </div>
                              {getStatusBadge(vet.status)}
                            </div>
                            
                            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                              <div>
                                <p className="text-sm text-muted-foreground">Phone</p>
                                <p className="font-medium">{vet.phone}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Location</p>
                                <p className="font-medium">{vet.cell}, {vet.village}</p>
                              </div>
                              <div>
                                <p className="text-sm text-muted-foreground">Patients</p>
                                <p className="font-medium">{vet.totalPatients || 0}</p>
                              </div>
                                                          </div>

                            <div className="text-sm text-muted-foreground">
                              <p>Registered: {new Date(vet.createdAt).toLocaleDateString()}</p>
                              {vet.lastActivity && (
                                <p>Last Activity: {new Date(vet.lastActivity).toLocaleDateString()}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col space-y-2 ml-4">
                            <Button size="sm" variant="outline" onClick={() => { setVetDetails(vet); setVetDetailsOpen(true); }}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {filteredVets.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No veterinarians found matching your criteria</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Patient Records Tab */}
          <TabsContent value="patients" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PawPrint className="h-5 w-5 text-primary" />
                  <span>Patient Records Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patients.map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium">{patient.animalName}</h4>
                        <p className="text-sm text-muted-foreground">
                          Owner: {patient.ownerName} | Phone: {patient.ownerPhone}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Vet: {(patient.veterinarian?.firstName || 'Unknown')} {(patient.veterinarian?.lastName || '')} | 
                          Location: {patient.cell}, {patient.village}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Registered: {new Date(patient.createdAt).toLocaleDateString()}
                        </p>
                        {patient.previousConditions && (
                          <p className="text-sm text-muted-foreground">
                            Conditions: {patient.previousConditions}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant="default">
                          Active
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  {patients.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No patients found in this sector</p>
                    </div>
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
                  <FileText className="h-5 w-5 text-primary" />
                  <span>Reports from Basic Vets</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Report Counts Summary */}
                <div className="flex items-center space-x-4 mb-6">
                  <div className="p-3 border rounded-md text-center flex-1">
                    <div className="text-sm text-muted-foreground">Approved</div>
                    <div className="text-xl font-semibold text-green-600">{reportCounts.approved}</div>
                  </div>
                  <div className="p-3 border rounded-md text-center flex-1">
                    <div className="text-sm text-muted-foreground">Rejected</div>
                    <div className="text-xl font-semibold text-red-600">{reportCounts.rejected}</div>
                  </div>
                  <div className="p-3 border rounded-md text-center flex-1">
                    <div className="text-sm text-muted-foreground">Pending</div>
                    <div className="text-xl font-semibold text-yellow-600">{reportCounts.pending}</div>
                  </div>
                </div>

                {reports.length > 0 ? (
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <div key={report.id} className="border rounded-lg p-4 hover:bg-muted/50">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg">{report.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              By: {report.submitter.firstName} {report.submitter.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Type: {report.reportType.replace('_', ' ')}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Submitted: {new Date(report.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(report.status)}`}>
                              {getStatusIcon(report.status)}
                              <span>{report.status}</span>
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedReport(report);
                                setReportNotes(report.sectorVetNotes || '');
                                setReportStatus(report.status);
                                setShowReportModal(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-foreground line-clamp-2">
                          {report.content.substring(0, 200)}...
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No reports submitted yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Generate Sector Report Tab */}
          <TabsContent value="generate-sector-report" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileCheck className="h-5 w-5 text-primary" />
                  <span>Generate Sector Report</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Period Selection */}
                <div className="p-4 border rounded-lg bg-muted/50 space-y-4">
                  <div className="grid md:grid-cols-3 gap-4 items-end">
                    <div className="space-y-2">
                      <Label htmlFor="period">Period</Label>
                      <select
                        id="period"
                        aria-label="Report Period"
                        value={reportPeriod}
                        onChange={(e) => setReportPeriod(e.target.value as typeof reportPeriod)}
                        className="w-full p-2 border rounded-md bg-background"
                      >
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                        <option value="custom">Custom Range</option>
                      </select>
                    </div>
                    {reportPeriod === 'custom' && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="from">From</Label>
                          <Input id="from" type="date" value={reportFrom} onChange={(e) => setReportFrom(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="to">To</Label>
                          <Input id="to" type="date" value={reportTo} onChange={(e) => setReportTo(e.target.value)} />
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={buildSectorReport}>
                      <Activity className="h-4 w-4 mr-2" />
                      Generate Preview
                    </Button>
                    <Button onClick={handleSubmitSectorReport} disabled={generating}>
                      <Send className="h-4 w-4 mr-2" />
                      {generating ? 'Submitting...' : 'Submit Sector Report'}
                    </Button>
                  </div>
                </div>

                {/* In-range dynamic stats */}
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="text-sm text-muted-foreground">Total Basic Vets</div>
                    <div className="text-xl font-semibold">{basicVets.length}</div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-sm text-muted-foreground">Total Patients in Range</div>
                    <div className="text-xl font-semibold">{patients.filter(p => { const [s,e] = getDateRange(); const d = new Date(p.createdAt); return d >= s && d <= e; }).length}</div>
                  </Card>
                </div>

                {/* Optional comments */}
                <div className="space-y-2">
                  <Label>Sector Vet Comments (optional)</Label>
                  <Textarea rows={4} placeholder="Add comments or suggestions based on the selected data..." value={sectorComments} onChange={(e) => setSectorComments(e.target.value)} />
                </div>

                {/* Auto-filled Title */}
                <div className="space-y-2">
                  <Label>Report Title</Label>
                  <Input value={generatedTitle} readOnly />
                </div>

                {/* Auto-filled Content */}
                <div className="space-y-2">
                  <Label>Report Content</Label>
                  <Textarea value={generatedContent} readOnly rows={18} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Track Sector Reports Tab */}
          <TabsContent value="track-sector-reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span>My Submitted Reports</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingSectorReports ? (
                  <div className="text-sm text-muted-foreground">Loading...</div>
                ) : mySectorReports.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No reports submitted yet.</div>
                ) : (
                  <div className="border rounded-lg overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="border px-3 py-2 text-left">Title</th>
                          <th className="border px-3 py-2 text-left">Status</th>
                          <th className="border px-3 py-2 text-left">Submitted</th>
                          <th className="border px-3 py-2 text-left">Review Notes</th>
                          <th className="border px-3 py-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mySectorReports.map((r) => (
                          <tr key={r.id} className="hover:bg-muted/50">
                            <td className="border px-3 py-2">{r.title}</td>
                            <td className="border px-3 py-2"><Badge variant="outline">{r.status}</Badge></td>
                            <td className="border px-3 py-2">{new Date(r.createdAt).toLocaleDateString()}</td>
                            <td className="border px-3 py-2">{r.sectorVetNotes || r.districtVetNotes || '—'}</td>
                            <td className="border px-3 py-2">
                              <div className="flex gap-2">
                                {r.status === 'REQUIRES_REVISION' && (
                                  <Button size="sm" variant="outline" onClick={() => openEditSectorReport(r)}>
                                    <Edit className="h-3 w-3 mr-1" />
                                    Edit & Resubmit
                                  </Button>
                                )}
                                {r.status === 'REJECTED' && (
                                  <Button size="sm" variant="destructive" onClick={() => handleDeleteSectorReport(r.id)}>
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
              </CardContent>
            </Card>

            {
              editSectorReport && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-2xl">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Edit className="h-5 w-5 text-primary" />
                      <span>Edit Sector Report (Resubmit)</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="editSectorTitle">Title</Label>
                      <Input id="editSectorTitle" value={editSectorReportForm.title} onChange={(e) => setEditSectorReportForm(p => ({ ...p, title: e.target.value }))} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="editSectorContent">Content</Label>
                      <Textarea
                        id="editSectorContent"
                        value={editSectorReportForm.content}
                        onChange={(e) => setEditSectorReportForm(p => ({ ...p, content: e.target.value }))}
                        rows={10} />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button onClick={handleResubmitSectorReport} className="flex-1">
                        <Send className="h-4 w-4 mr-2" />
                        Resubmit (set to Pending)
                      </Button>
                      <Button variant="outline" onClick={() => setEditSectorReport(null)} className="flex-1">
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Report Review Modal */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-primary" />
                <span>Review Report: {selectedReport.title}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Report Details */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <Label className="text-sm font-medium">Submitted By</Label>
                  <p className="text-sm">{selectedReport.submitter.firstName} {selectedReport.submitter.lastName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Report Type</Label>
                  <p className="text-sm">{selectedReport.reportType.replace('_', ' ')}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Submitted Date</Label>
                  <p className="text-sm">{new Date(selectedReport.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Current Status</Label>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 w-fit ${getStatusColor(selectedReport.status)}`}>
                    {getStatusIcon(selectedReport.status)}
                    <span>{selectedReport.status}</span>
                  </span>
                </div>
              </div>

              {/* Report Content */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Report Content</Label>
                <div className="p-4 border rounded-lg bg-background">
                  <p className="whitespace-pre-wrap">{selectedReport.content}</p>
                </div>
              </div>

              {/* Review Section */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reportStatus">Update Status</Label>
                  <Select
                    value={reportStatus}
                    onValueChange={setReportStatus}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="REVIEWED">Reviewed</SelectItem>
                      <SelectItem value="APPROVED">Approved</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                      <SelectItem value="REQUIRES_REVISION">Requires Revision</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reportNotes">Sector Vet Notes</Label>
                  <Textarea
                    id="reportNotes"
                    placeholder="Add your notes or feedback..."
                    rows={4}
                    value={reportNotes}
                    onChange={(e) => setReportNotes(e.target.value)}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <Button 
                  onClick={() => handleReviewReport(selectedReport.id)} 
                  className="flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Update Report
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowReportModal(false);
                    setSelectedReport(null);
                    setReportNotes('');
                    setReportStatus('PENDING');
                  }} 
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {vetDetailsOpen && vetDetails && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>
                  {vetDetails.firstName} {vetDetails.lastName} — {vetDetails.sector} Sector
                </span>
                <div className="text-sm text-muted-foreground">
                  {vetDetails.email} • {vetDetails.phone}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Patients</p>
                  <p className="text-2xl font-semibold">
                    {patients.filter(p => p.veterinarian?.id === vetDetails.id).length}
                  </p>
                </div>
                                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="text-2xl font-semibold">
                    {/* Assuming getStatusBadge returns a ReactNode, render it directly */}
                    {getStatusBadge(vetDetails.status)}
                  </p>
                </div>
              </div>

              {/* Patients Table */}
              <div>
                <h3 className="font-medium mb-2">Patients</h3>
                <div className="border rounded-lg overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-3 py-2 text-left border">Animal</th>
                        <th className="px-3 py-2 text-left border">Owner</th>
                        <th className="px-3 py-2 text-left border">Phone</th>
                        <th className="px-3 py-2 text-left border">Registered</th>
                                              </tr>
                    </thead>
                    <tbody>
                      {patients
                        .filter(p => p.veterinarian?.id === vetDetails.id)
                        .map(p => (
                          <tr key={p.id}>
                            <td className="px-3 py-2 border">{p.animalName}</td>
                            <td className="px-3 py-2 border">{p.ownerName}</td>
                            <td className="px-3 py-2 border">{p.ownerPhone}</td>
                            <td className="px-3 py-2 border">
                              {new Date(p.createdAt).toLocaleDateString()}
                            </td>
                                                      </tr>
                        ))}
                      {patients.filter(p => p.veterinarian?.id === vetDetails.id).length === 0 && (
                        <tr>
                          <td className="px-3 py-6 border text-center text-muted-foreground" colSpan={5}>
                            No patients found for this veterinarian.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              
              {/* Close */}
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setVetDetails(null);
                    setVetDetailsOpen(false);
                  }}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
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
    </div>
  );
};

export default SectorDashboard;