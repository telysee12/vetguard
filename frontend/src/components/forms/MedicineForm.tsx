import { useEffect, useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Plus, Pill, Package, Calendar, AlertTriangle } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { getApiUrl, getAuthHeaders } from '../../lib/api';
import type { Medicine } from '../../pages/BasicDashboard';

interface MedicineFormProps {
  // Legacy props for BasicDashboard
  onClose?: () => void;
  editingMedicine?: Medicine;
  onSuccess?: () => void;
  veterinarianId?: number;
  
  // New props for PharmacyDashboard
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCompleted?: () => void;
}

const MedicineForm = ({ onClose, editingMedicine, onSuccess, veterinarianId, open, onOpenChange, onCompleted }: MedicineFormProps) => {
  // Determine which set of props to use
  const isNewInterface = open !== undefined;
  
  // Get veterinarianId from localStorage if not provided
  const getVeterinarianId = () => {
    if (veterinarianId) return veterinarianId;
    const userStr = localStorage.getItem('vgms_user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return Number(user.id);
    }
    return null;
  };
  
  const vetId = getVeterinarianId();
  
  // Use appropriate handlers
  const handleClose = () => {
    if (isNewInterface && onOpenChange) {
      onOpenChange(false);
    } else if (onClose) {
      onClose();
    }
  };
  
  const handleSuccess = () => {
    if (isNewInterface && onCompleted) {
      onCompleted();
    } else if (onSuccess) {
      onSuccess();
    }
  };
  const [formData, setFormData] = useState<Partial<Medicine>>({
    name: editingMedicine?.name || '',
    description: editingMedicine?.description || '',
    totalStock: editingMedicine?.totalStock || 0,
    currentStock: editingMedicine?.currentStock || 0,
    unit: editingMedicine?.unit || 'vials',
    expiryDate: editingMedicine?.expiryDate ? new Date(editingMedicine.expiryDate).toISOString().split('T')[0] : '',
  });

  const { toast } = useToast();

  const units = [
    'vials', 'bottles', 'tablets', 'capsules', 'ml', 'grams', 'sachets', 'doses'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.totalStock || !formData.unit) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Name, Initial Stock, Unit)",
        variant: "destructive"
      });
      return;
    }

    if (!vetId) {
      toast({
        title: "Error",
        description: "Unable to identify veterinarian. Please refresh the page.",
        variant: "destructive"
      });
      return;
    }

    try {
      
      const payload = {
        ...formData,
        totalStock: Number(formData.totalStock),
        currentStock: Number(formData.totalStock), // Initial current stock is same as total stock
        veterinarianId: vetId,
        // Ensure expiryDate is sent as a proper date string if it exists
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : undefined,
      };

      let res;
      if (editingMedicine) {
        res = await fetch(`${getApiUrl()}/api/v1/medicines/${editingMedicine.id}`, {
          method: 'PATCH',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${getApiUrl()}/api/v1/medicines`, {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to save medicine');
      }

      toast({
        title: "Success",
        description: editingMedicine ? "Medicine updated successfully" : "New medicine added successfully",
      });
      handleSuccess();
      handleClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive"
      });
    }
  };

  const getDaysUntilExpiry = () => {
    if (!formData.expiryDate) return null;
    const today = new Date();
    const expiry = new Date(formData.expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpiryStatus = () => {
    const days = getDaysUntilExpiry();
    if (days === null) return null;
    if (days < 0) return { status: 'expired', color: 'destructive' };
    if (days <= 30) return { status: 'expiring_soon', color: 'warning' };
    return { status: 'good', color: 'default' };
  };

  // Sync form data with editingMedicine prop
  useEffect(() => {
    if (editingMedicine) {
      setFormData({
        name: editingMedicine.name || '',
        description: editingMedicine.description || '',
        totalStock: editingMedicine.totalStock || 0,
        currentStock: editingMedicine.currentStock || 0,
        unit: editingMedicine.unit || 'vials',
        expiryDate: editingMedicine.expiryDate ? new Date(editingMedicine.expiryDate).toISOString().split('T')[0] : '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        totalStock: 0,
        currentStock: 0,
        unit: 'vials',
        expiryDate: '',
      });
    }
  }, [editingMedicine]);

  // Don't render if using new interface and open is false
  if (isNewInterface && !open) {
    return null;
  }
  
  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Pill className="h-5 w-5 text-primary" />
            <span>{editingMedicine ? 'Update Medicine' : 'Add New Medicine'}</span>
            {formData.expiryDate && getDaysUntilExpiry() !== null && (
              <Badge variant={getExpiryStatus()?.color as any}>
                {getDaysUntilExpiry()! > 0 
                  ? `${getDaysUntilExpiry()} days to expiry`
                  : 'Expired'
                }
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Pill className="h-4 w-4" />
                <span>Medicine Details</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Medicine Name *</Label>
                  <Input
                    id="name"
                    placeholder="Enter medicine name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="e.g., For bacterial infections"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
              </div>
            </div>

            {/* Stock Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span>Stock & Expiry</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalStock">Initial Stock *</Label>
                  <Input
                    id="totalStock"
                    type="number"
                    placeholder="0"
                    value={formData.totalStock}
                    onChange={(e) => setFormData({...formData, totalStock: Number(e.target.value)})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit *</Label>
                  <select
                    id="unit"
                    className="w-full p-2 border border-input rounded-md bg-background"
                    value={formData.unit}
                    onChange={(e) => setFormData({...formData, unit: e.target.value})}
                    required
                  >
                    {units.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                  />
                  {formData.expiryDate && getExpiryStatus()?.status === 'expiring_soon' && (
                    <div className="flex items-center text-sm text-orange-600">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Expires in {getDaysUntilExpiry()} days
                    </div>
                  )}
                  {formData.expiryDate && getExpiryStatus()?.status === 'expired' && (
                    <div className="flex items-center text-sm text-red-600">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Expired!
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex space-x-4 pt-6">
              <Button type="submit" className="flex-1">
                {editingMedicine ? 'Update Medicine' : 'Add Medicine'}
              </Button>
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default MedicineForm;