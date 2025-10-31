import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { PawPrint, User, MapPin } from 'lucide-react';
import { useToast } from '../../hooks/use-toast';
import { getApiUrl, getAuthHeaders } from '../../lib/api';

export interface Patient {
  animalName: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  ownerIdNumber: string;
  province: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
  previousConditions?: string;
}

interface PatientFormProps {
  onClose: () => void;
  editingPatient?: Patient & { id?: number };
}

const PatientForm = ({ onClose, editingPatient }: PatientFormProps) => {
  const [formData, setFormData] = useState({
    // Animal Information
    animalName: editingPatient?.animalName || '',
    
    // Owner Information
    ownerName: editingPatient?.ownerName || '',
    ownerPhone: editingPatient?.ownerPhone || '',
    ownerEmail: editingPatient?.ownerEmail || '',
    ownerIdNumber: editingPatient?.ownerIdNumber || '',
    
    // Location Information
    province: 'Southern',
    district: 'Huye',
    sector: editingPatient?.sector || '',
    cell: editingPatient?.cell || '',
    village: editingPatient?.village || '',
    
    // Medical History
    previousConditions: editingPatient?.previousConditions || '',
  });
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [limitMsgPhone, setLimitMsgPhone] = useState('');
  const [limitMsgId, setLimitMsgId] = useState('');

  const { toast } = useToast();

  const provinces = ['Kigali', 'Northern', 'Southern', 'Eastern', 'Western'];

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.animalName) newErrors.animalName = 'Required';
    if (!formData.ownerName) newErrors.ownerName = 'Required';
    if (!formData.ownerPhone) newErrors.ownerPhone = 'Required';
    else if (!/^\d{10}$/.test(formData.ownerPhone)) newErrors.ownerPhone = 'Must be exactly 10 digits';
    if (!formData.ownerEmail) newErrors.ownerEmail = 'Required';
    if (!formData.ownerIdNumber) newErrors.ownerIdNumber = 'Required';
    else if (!/^\d{16}$/.test(formData.ownerIdNumber)) newErrors.ownerIdNumber = 'Must be exactly 16 digits';
    if (!formData.sector) newErrors.sector = 'Required';
    if (!formData.cell) newErrors.cell = 'Required';
    if (!formData.village) newErrors.village = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast({ title: 'Validation Error', description: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    try {
      const isEditing = Boolean(editingPatient?.id);
      const url = isEditing ? `${getApiUrl()}/api/v1/patients/${editingPatient?.id}` : `${getApiUrl()}/api/v1/patients`;
      const method = isEditing ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Failed to save patient');
      }
      const saved = await res.json();
      toast({ title: 'Success', description: isEditing ? 'Patient updated successfully' : 'New patient registered successfully' });
      onClose();
      window.dispatchEvent(new CustomEvent(isEditing ? 'patient:changed' : 'patient:created', { detail: saved }));
    } catch (error: unknown) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to save patient', variant: 'destructive' });
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PawPrint className="h-5 w-5 text-primary" />
            <span>{editingPatient ? 'Edit Patient' : 'Register New Patient'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Animal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <PawPrint className="h-4 w-4" />
                <span>Animal Information</span>
              </h3>
              
              <div className="space-y-2">
                <Label htmlFor="animalName">Animal Name *</Label>
                <Input
                  id="animalName"
                  placeholder="Enter animal name"
                  value={formData.animalName}
                  onChange={(e) => setFormData({...formData, animalName: e.target.value})}
                  required
                />
                {errors.animalName && <span className="text-red-500 text-xs">{errors.animalName}</span>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="previousConditions">Existing Illness/Condition</Label>
                <Textarea
                  id="previousConditions"
                  placeholder="Describe any existing illnesses or conditions..."
                  value={formData.previousConditions}
                  onChange={(e) => setFormData({...formData, previousConditions: e.target.value})}
                />
              </div>
            </div>

            {/* Owner Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Owner Information</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Owner Name *</Label>
                  <Input
                    id="ownerName"
                    placeholder="Full name"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                    required
                  />
                  {errors.ownerName && <span className="text-red-500 text-xs">{errors.ownerName}</span>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerPhone">Phone Number *</Label>
                  <Input
                    id="ownerPhone"
                    placeholder="e.g. 0781234567"
                    value={formData.ownerPhone}
                    onChange={e => {
                      let val = e.target.value.replace(/\D/g, '');
                      if (val.length > 10) {
                        val = val.slice(0, 10);
                        setLimitMsgPhone('Maximum 10 digits allowed');
                      } else {
                        setLimitMsgPhone('');
                      }
                      setFormData({ ...formData, ownerPhone: val });
                    }}
                    required
                  />
                  {errors.ownerPhone && <span className="text-red-500 text-xs">{errors.ownerPhone}</span>}
                  {limitMsgPhone && <span className="text-red-500 text-xs">{limitMsgPhone}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ownerEmail">Email Address</Label>
                  <Input
                    id="ownerEmail"
                    type="email"
                    placeholder="owner@email.com"
                    value={formData.ownerEmail}
                    onChange={(e) => setFormData({...formData, ownerEmail: e.target.value})}
                  />
                  {errors.ownerEmail && <span className="text-red-500 text-xs">{errors.ownerEmail}</span>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerIdNumber">ID Number *</Label>
                  <Input
                    id="ownerIdNumber"
                    placeholder="National ID"
                    value={formData.ownerIdNumber}
                    onChange={e => {
                      let val = e.target.value.replace(/\D/g, '');
                      if (val.length > 16) {
                        val = val.slice(0, 16);
                        setLimitMsgId('Maximum 16 digits allowed');
                      } else {
                        setLimitMsgId('');
                      }
                      setFormData({ ...formData, ownerIdNumber: val });
                    }}
                    required
                  />
                  {errors.ownerIdNumber && <span className="text-red-500 text-xs">{errors.ownerIdNumber}</span>}
                  {limitMsgId && <span className="text-red-500 text-xs">{limitMsgId}</span>}
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Location Information</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="province">Province *</Label>
                  <select id="province" className="w-full p-2 border border-input rounded-md bg-background" value={formData.province} disabled={true}>
                    <option value="Southern">Southern</option>
                    <option value="Kigali" disabled>Kigali</option>
                    <option value="Northern" disabled>Northern</option>
                    <option value="Eastern" disabled>Eastern</option>
                    <option value="Western" disabled>Western</option>
                  </select>
                  {errors.province && <span className="text-red-500 text-xs">{errors.province}</span>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">District *</Label>
                  <Input id="district" value="Huye" disabled className="bg-gray-100" />
                  {errors.district && <span className="text-red-500 text-xs">{errors.district}</span>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sector">Sector *</Label>
                  <Input id="sector" placeholder="Sector" value={formData.sector} onChange={e => setFormData({ ...formData, sector: e.target.value })} />
                  {errors.sector && <span className="text-red-500 text-xs">{errors.sector}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cell">Cell *</Label>
                  <Input id="cell" placeholder="Cell" value={formData.cell} onChange={e => setFormData({ ...formData, cell: e.target.value })} />
                  {errors.cell && <span className="text-red-500 text-xs">{errors.cell}</span>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="village">Village *</Label>
                  <Input id="village" placeholder="Village" value={formData.village} onChange={e => setFormData({ ...formData, village: e.target.value })} />
                  {errors.village && <span className="text-red-500 text-xs">{errors.village}</span>}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex space-x-4 pt-6">
              <Button type="submit" className="flex-1">
                {editingPatient ? 'Update Patient' : 'Register Patient'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientForm;