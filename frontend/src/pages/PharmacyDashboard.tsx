import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import UserProfileModal from '../components/UserProfileModal';
import UserProfileDropdown from '../components/UserProfileDropdown';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Card, CardHeader, CardContent, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Plus, Eye, Edit, Package, Trash2, Syringe, FilePlus, Award, Upload, Download, CreditCard, CheckCircle } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import MedicineForm from '../components/forms/MedicineForm';
import { MedicineDetails } from '../components/details/MedicineDetails';
import { getApiUrl, getAuthHeaders, getAuthHeadersForFormData, apiGet, apiPost } from '../lib/api';
import { useToast } from '../hooks/use-toast';
import LicenseCard from '../components/LicenseCard';
import { addYears } from 'date-fns';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface User {
  id: number | string;
  email: string;
  firstName?: string;
  lastName?: string;
  passportPhoto?: string;
  role?: string;
  sector?: string;
  [key: string]: any;
}

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
  stockMovements: any[];
}

const PharmacyDashboard: React.FC = () => {
  const { toast } = useToast();
  // User profile state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userLoading, setUserLoading] = useState(true);
  // Modals
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  // Tabs
  const [selectedTab, setSelectedTab] = useState('medicines');

  // Medicines tab state
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [medicineLoading, setMedicineLoading] = useState(false);
  const [showMedicineForm, setShowMedicineForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | undefined>(undefined);
  const [viewingMedicineData, setViewingMedicineData] = useState<Medicine | null>(null);
  const [selectedMedicineForStock, setSelectedMedicineForStock] = useState<Medicine | null>(null);
  const [showStockInModal, setShowStockInModal] = useState(false);
  const [showStockOutModal, setShowStockOutModal] = useState(false);
  const [stockQuantity, setStockQuantity] = useState<number>(1);

  // Report tab state
  const [reportRange, setReportRange] = useState('Custom Date Range');
  const [reportStart, setReportStart] = useState('');
  const [reportEnd, setReportEnd] = useState('');
  const [reportTitle, setReportTitle] = useState('');
  const [reportContent, setReportContent] = useState('');
  const [reportRecommendation, setReportRecommendation] = useState('');
  const [isSavingReport, setIsSavingReport] = useState(false);

  // License application state (mirrors BasicDashboard)
  interface LicenseOption { value: string; label: string; price: number }
  const licenseOptions: LicenseOption[] = [
    { value: 'VETERINARY_PROFESSIONAL', label: 'Veterinary professional', price: 30000 },
    { value: 'ANIMAL_SCIENTIST_A0', label: 'Animal Scientist (A0)', price: 30000 },
    { value: 'VETERINARY_PARAPROFESSIONAL_A1', label: 'Veterinary paraprofessional (Vet A1)', price: 20000 },
    { value: 'ASSISTANT_ANIMAL_SCIENTIST_A1', label: 'Assistant animal Scientist (A1)', price: 20000 },
    { value: 'VETERINARY_PARAPROFESSIONAL_A2', label: 'Veterinary paraprofessional (Vet A2)', price: 15000 },
  ];
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
  const licenseCardRef = useRef<HTMLDivElement>(null);

  // Fetch user info from localStorage and API
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setUserLoading(true);
        let user = null;
        const ustr = localStorage.getItem('vgms_user');
        if (ustr) user = JSON.parse(ustr);
        // Optionally refresh from backend
        const res = await fetch(`${getApiUrl()}/api/v1/auth/me`, { headers: getAuthHeaders() });
        if (res.ok) {
          const serverUser = await res.json();
          setCurrentUser(serverUser);
          localStorage.setItem('vgms_user', JSON.stringify(serverUser));
        } else if (user) {
          setCurrentUser(user);
        }
      } catch {
        setCurrentUser(null);
      } finally {
        setUserLoading(false);
      }
    };
    fetchUser();
  }, []);

  // Fetch user's medicines only
  const loadMedicines = async () => {
    if (!currentUser) return;
    setMedicineLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/v1/medicines`, { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        setMedicines(data.filter((m: Medicine) => m.veterinarianId === Number(currentUser.id)));
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load medicines.', variant: 'destructive' });
    } finally {
      setMedicineLoading(false);
    }
  };
  useEffect(() => { if (currentUser) loadMedicines(); }, [currentUser]);

  // Medicine logic handlers (delete, stock in/out, etc.)
  const handleDeleteMedicine = async (id: number) => {
    if (!window.confirm('Delete this medicine?')) return;
    try {
      const res = await fetch(`${getApiUrl()}/api/v1/medicines/${id}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (res.ok) {
        toast({ title: 'Deleted', description: 'Medicine deleted.' });
        loadMedicines();
      } else {
        toast({ title: 'Error', description: 'Could not delete medicine.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Could not delete medicine.', variant: 'destructive' });
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
      loadMedicines();
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Failed', variant: 'destructive' });
    }
  };
  const handleStockOut = async () => {
    if (!selectedMedicineForStock || stockQuantity <= 0) return;
    if (stockQuantity > (selectedMedicineForStock?.currentStock || 0)) {
      toast({ title: 'Error', description: 'Insufficient stock.', variant: 'destructive' });
      return;
    }
    try {
      const res = await fetch(`${getApiUrl()}/api/v1/medicines/${selectedMedicineForStock.id}/stock-out`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ quantity: stockQuantity }),
      });
      if (!res.ok) throw new Error('Failed to stock out');
      toast({ title: 'Stock Updated', description: `${stockQuantity} units removed.` });
      setShowStockOutModal(false);
      setSelectedMedicineForStock(null);
      setStockQuantity(1);
      loadMedicines();
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Failed', variant: 'destructive' });
    }
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('vgms_token');
    localStorage.removeItem('vgms_user');
    window.location.href = '/login';
  };
  // Profile update callback
  const handleProfileUpdated = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('vgms_user', JSON.stringify(updatedUser));
  };

  // Load fields of practice when License tab is selected
  useEffect(() => {
    const loadFields = async () => {
      try {
        const data = await apiGet<{ id: number; name: string }[]>('/api/v1/field-of-practice');
        setFieldsOfPractice(Array.isArray(data) ? data : []);
      } catch (error) {
        toast({ title: 'Error', description: 'Could not load fields of practice.', variant: 'destructive' });
      }
    };
    if (selectedTab === 'license') loadFields();
  }, [selectedTab, toast]);

  // Load current user's license application status (dynamic badges like basic-dashboard)
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
      } catch {
        setMyLicenseApp(null);
      } finally {
        setLoadingLicense(false);
      }
    };
    if (currentUser) loadMyApplication();
  }, [currentUser]);

  const handleFileUpload = (field: 'degree' | 'idDocument' | 'paymentReceipt', file: File | null) => {
    setLicenseApplication(prev => ({ ...prev, [field]: file }));
  };

  const submitLicenseApplication = async () => {
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
      toast({ title: 'Application Submitted', description: 'Your license application has been submitted for review.' });
    } catch (error: any) {
      toast({ title: 'Submission Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDownloadLicenseCard = async () => {
    if (!currentUser || !myLicenseApp?.licenseNumber) {
      toast({ title: 'Download Failed', description: 'License information is not available.', variant: 'destructive' });
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
    function waitForAllImagesToLoad(element: HTMLElement) {
      const images = Array.from(element.querySelectorAll('img')) as HTMLImageElement[];
      if (images.length === 0) return Promise.resolve();
      return Promise.all(images.map(img => (img.complete && img.naturalHeight !== 0) ? Promise.resolve() : new Promise(resolve => { img.onload = img.onerror = () => resolve(undefined); })));
    }
    try {
      await new Promise(r => setTimeout(r, 100));
      await waitForAllImagesToLoad(tempDiv);
      const canvas = await html2canvas(tempDiv, { scale: 2, useCORS: true, allowTaint: true });
      const imgData = canvas.toDataURL('image/png');
      const cardWidthPx = 324; // ~3.375in @96dpi
      const cardHeightPx = 204; // ~2.125in @96dpi
      const dpi = 96;
      const cardWidthMm = (cardWidthPx / dpi) * 25.4;
      const cardHeightMm = (cardHeightPx / dpi) * 25.4;
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [cardWidthMm + 10, cardHeightMm * 2 + 20] });
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * cardWidthMm) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 5, 5, cardWidthMm, imgHeight);
      pdf.save(`license_card_${myLicenseApp.licenseNumber}.pdf`);
      toast({ title: 'Download Complete', description: 'Your license card has been downloaded.' });
    } catch (err) {
      toast({ title: 'Download Failed', description: 'Could not generate license card. Please try again.', variant: 'destructive' });
    } finally {
      root.unmount();
      document.body.removeChild(tempDiv);
    }
  };

  // Generate pharmacy report dynamically (like BasicDashboard)
  const handleGeneratePharmacyReport = async () => {
    if (!reportRange) {
      toast({ title: 'Error', description: 'Please select a report range.', variant: 'destructive' });
      return;
    }

    let calculatedStartDate = '';
    let calculatedEndDate = '';
    let generatedTitle = '';
    const today = new Date();

    switch (reportRange) {
      case 'WEEK': {
        const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        const lastDayOfWeek = new Date(firstDayOfWeek);
        lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
        calculatedStartDate = firstDayOfWeek.toISOString().split('T')[0];
        calculatedEndDate = lastDayOfWeek.toISOString().split('T')[0];
        generatedTitle = `Pharmacy Report - ${firstDayOfWeek.toLocaleDateString()} to ${lastDayOfWeek.toLocaleDateString()}`;
        break;
      }
      case 'MONTH': {
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        calculatedStartDate = firstDayOfMonth.toISOString().split('T')[0];
        calculatedEndDate = lastDayOfMonth.toISOString().split('T')[0];
        generatedTitle = `Pharmacy Report - ${firstDayOfMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}`;
        break;
      }
      case 'Custom Date Range':
      case 'CUSTOM': {
        if (!reportStart || !reportEnd) {
          toast({ title: 'Error', description: 'Please select a start and end date.', variant: 'destructive' });
          return;
        }
        if (new Date(reportStart) > new Date(reportEnd)) {
          toast({ title: 'Error', description: 'Start date cannot be after end date.', variant: 'destructive' });
          return;
        }
        calculatedStartDate = reportStart;
        calculatedEndDate = reportEnd;
        generatedTitle = `Pharmacy Report - ${new Date(calculatedStartDate).toLocaleDateString()} to ${new Date(calculatedEndDate).toLocaleDateString()}`;
        break;
      }
      default:
        return;
    }

    setReportTitle(generatedTitle);
    setReportStart(calculatedStartDate);
    setReportEnd(calculatedEndDate);

    try {
      const response = await apiPost<{ content: string }>(
        '/api/v1/reports/pharmaceutical',
        {
          startDate: calculatedStartDate,
          endDate: calculatedEndDate,
        }
      );
      setReportContent(response.content);
      toast({ title: 'Report Generated', description: 'Pharmaceutical report has been generated.' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to generate report', variant: 'destructive' });
    }
  };

  // Save pharmacy report (like BasicDashboard)
  const handleSaveReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportContent) {
      toast({ title: 'Error', description: 'Please generate the report content first.', variant: 'destructive' });
      return;
    }
    if (!reportTitle) {
      toast({ title: 'Error', description: 'Please provide a report title.', variant: 'destructive' });
      return;
    }

    setIsSavingReport(true);
    try {
      const user: any = await apiGet('/api/v1/auth/profile');
      const payload: any = {
        title: reportTitle,
        content: reportContent,
        reportType: 'PHARMACEUTICAL',
        recommendation: reportRecommendation,
        submittedBy: user.id,
        sector: currentUser?.sector || '',
        district: currentUser?.district || '',
        province: (currentUser as any)?.province || '',
      };
      await apiPost('/api/v1/reports', payload);
      toast({ title: 'Report Saved', description: 'Pharmaceutical report has been saved.' });
      // optionally clear or keep values
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to save report', variant: 'destructive' });
    } finally {
      setIsSavingReport(false);
    }
  };

  // Auto-generate report only when on Reports tab and inputs are valid
  useEffect(() => {
    if (selectedTab !== 'reports') return;
    const isCustom = reportRange === 'CUSTOM' || reportRange === 'Custom Date Range';
    if (isCustom && (!reportStart || !reportEnd)) return;
    handleGeneratePharmacyReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTab, reportRange, reportStart, reportEnd]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section with profile dropdown and modal */}
      {/* Screenshot-style dashboard header (profile, role, dropdown) */}
      <section className="bg-gradient-primary text-primary-foreground py-6 mb-8">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1">Pharmacy Dashboard</h1>
            {currentUser ? (
              <p className="text-primary-foreground/90">
                {currentUser.firstName} {currentUser.lastName} - {currentUser.sector} Sector
              </p>
            ) : (
              <p className="text-primary-foreground/90">Loading user...</p>
            )}
          </div>
          <div className="flex items-center gap-4">
            {currentUser && (
              <Badge variant="secondary">
                {currentUser.role === "PHARMACY" ? 'Pharmacy Vet' : (currentUser.role || 'User')}
              </Badge>
            )}
            {currentUser && (
              <UserProfileDropdown
                userEmail={currentUser.email}
                userName={currentUser.firstName && currentUser.lastName ? `${currentUser.firstName} ${currentUser.lastName}` : undefined}
                passportPhotoUrl={currentUser.passportPhoto}
                onUpdateProfile={() => setProfileModalOpen(true)}
                onLogout={handleLogout}
              />
            )}
          </div>
        </div>
      </section>
      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        currentEmail={currentUser?.email || ''}
        currentPassportPhotoUrl={currentUser?.passportPhoto}
        onProfileUpdated={handleProfileUpdated}
      />
      <div className="container mx-auto px-4 pb-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 mb-2">
            <TabsTrigger value="medicines">Medicines</TabsTrigger>
            <TabsTrigger value="reports">Generate Pharmacy Report</TabsTrigger>
            <TabsTrigger value="license">License Application</TabsTrigger>
          </TabsList>
          {/* Medicines Tab */}
          <TabsContent value="medicines" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Syringe className="h-5 w-5 text-primary" />
                    <span>Medicine Inventory</span>
                  </CardTitle>
                  <Button onClick={() => { setShowMedicineForm(true); setEditingMedicine(undefined); }}>
                    <Plus className="h-4 w-4 mr-2"/>Add Medicine
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
                    medicines.map(medicine => (
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
                            <Eye className="h-3 w-3 mr-1"/>View Details
                          </Button>
                          <Button size="sm" onClick={() => { setSelectedMedicineForStock(medicine); setShowStockInModal(true); }}>
                            <Plus className="h-3 w-3 mr-1"/>Stock In
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => { setSelectedMedicineForStock(medicine); setShowStockOutModal(true); }}>
                            <Package className="h-3 w-3 mr-1"/>Stock Out
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => { setEditingMedicine(medicine); setShowMedicineForm(true); }}>
                            <Edit className="h-3 w-3 mr-1"/>Edit
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteMedicine(medicine.id)}>
                            <Trash2 className="h-3 w-3 mr-1"/>Delete
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
            {/* MedicineForm Modal */}
            {showMedicineForm && (
              <MedicineForm 
                open={showMedicineForm}
                onOpenChange={(open: boolean) => { setShowMedicineForm(open); if (!open) setEditingMedicine(undefined); }}
                editingMedicine={editingMedicine}
                onCompleted={() => { loadMedicines(); setShowMedicineForm(false); setEditingMedicine(undefined); }}
              />
            )}
            {/* Details Modal */}
            {viewingMedicineData && (
              <MedicineDetails 
                medicine={viewingMedicineData}
                open={!!viewingMedicineData}
                onOpenChange={() => setViewingMedicineData(null)}
              />
            )}
            {/* Stock In Modal */}
            {showStockInModal && selectedMedicineForStock && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm">
                  <h2 className="text-lg font-semibold mb-4">Stock In - {selectedMedicineForStock.name}</h2>
                  <input type="number" value={stockQuantity} min={1} onChange={e => setStockQuantity(Number(e.target.value))} className="w-full px-3 py-2 border rounded mb-4"/>
                  <div className="flex gap-2 justify-end">
                    <Button onClick={handleStockIn}>Add</Button>
                    <Button variant="outline" onClick={() => { setShowStockInModal(false); setSelectedMedicineForStock(null); }}>Cancel</Button>
                  </div>
                </div>
              </div>
            )}
            {/* Stock Out Modal */}
            {showStockOutModal && selectedMedicineForStock && (
              <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-sm">
                  <h2 className="text-lg font-semibold mb-4">Stock Out - {selectedMedicineForStock.name}</h2>
                  <input type="number" value={stockQuantity} min={1} max={selectedMedicineForStock.currentStock} onChange={e => setStockQuantity(Number(e.target.value))} className="w-full px-3 py-2 border rounded mb-4"/>
                  <div className="flex gap-2 justify-end">
                    <Button onClick={handleStockOut}>Remove</Button>
                    <Button variant="outline" onClick={() => { setShowStockOutModal(false); setSelectedMedicineForStock(null); }}>Cancel</Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Generate Pharmacy Report Tab (fully featured as per screenshot) */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FilePlus className="h-5 w-5 text-primary" />
                  <span>Generate Pharmacy Report</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4 w-full max-w-2xl mx-auto" onSubmit={handleSaveReport}>
                  <div>
                    <label className="font-medium block mb-1">Report Range *</label>
                    <select className="w-full border rounded p-2" value={reportRange} onChange={e => setReportRange(e.target.value)} required>
                      <option value="CUSTOM">Custom Date Range</option>
                      <option value="WEEK">This Week</option>
                      <option value="MONTH">This Month</option>
                    </select>
                  </div>
                  {(reportRange === 'CUSTOM' || reportRange === 'Custom Date Range') && (
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="font-medium block mb-1">Start Date *</label>
                        <input type="date" className="w-full border rounded p-2" value={reportStart} onChange={e => setReportStart(e.target.value)} required />
                      </div>
                      <div className="flex-1">
                        <label className="font-medium block mb-1">End Date *</label>
                        <input type="date" className="w-full border rounded p-2" value={reportEnd} onChange={e => setReportEnd(e.target.value)} required />
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="font-medium block mb-1">Report Title *</label>
                    <input type="text" className="w-full border rounded p-2" value={reportTitle} onChange={e => setReportTitle(e.target.value)} required readOnly />
                  </div>
                  <div>
                    <label className="font-medium block mb-1">Report Content</label>
                    <textarea className="w-full border rounded p-2 font-mono" value={reportContent} onChange={e => setReportContent(e.target.value)} rows={10} readOnly />
                  </div>
                  <div>
                    <label className="font-medium block mb-1">Recommendation (Optional)</label>
                    <textarea className="w-full border rounded p-2" value={reportRecommendation} onChange={e => setReportRecommendation(e.target.value)} rows={3} />
                  </div>
                  <div className="flex gap-3 items-center justify-end pt-3">
                    <Button type="button" variant="outline" onClick={() => { setReportTitle(''); setReportContent(''); setReportRecommendation(''); setReportStart(''); setReportEnd(''); }}>Cancel</Button>
                    <Button type="submit" disabled={isSavingReport || !reportContent}>{isSavingReport ? 'Saving...' : 'Save Report'}</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* License Application Tab (copied from BasicDashboard) */}
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
                      <p className="font-semibold">{(currentUser as any)?.phone}</p>
                    </div>
                    <div>
                      <Label>Location</Label>
                      <p className="font-semibold">{(currentUser as any)?.sector}, {(currentUser as any)?.district}</p>
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
                      <Button size="sm" onClick={handleDownloadLicenseCard} className="ml-4 bg-green-600 hover:bg-green-700 text-white">
                        <Download className="h-4 w-4 mr-2" />
                        Download Card
                      </Button>
                    </div>
                  )}
                  {myLicenseApp?.status === 'REJECTED' && (
                    <div className="text-red-700 bg-red-100 p-3 rounded-md"><p className="font-bold">Rejection Reason:</p><p>{myLicenseApp.reviewNotes || 'No reason provided.'}</p></div>
                  )}
                  <p className="text-sm text-muted-foreground">Complete all sections below and submit your application for review.</p>
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
                    <Button onClick={submitLicenseApplication} className="flex-1" disabled={loadingLicense}>
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
    </div>
  );
};

export default PharmacyDashboard;
