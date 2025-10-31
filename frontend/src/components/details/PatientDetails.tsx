import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { 
  Heart, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  Stethoscope,
  FileText,
  Shield,
  Edit,
  Trash2,
  Plus,
  Clock
} from "lucide-react";

interface Owner {
  name: string;
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
}

interface VaccinationRecord {
  id: string;
  vaccine: string;
  date: string;
  nextDue?: string;
  veterinarian: string;
}

interface TreatmentRecord {
  id: string;
  date: string;
  diagnosis: string;
  treatment: string;
  medications: string[];
  veterinarian: string;
  cost: number;
  followUpDate?: string;
}

interface Patient {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  gender: string;
  weight: number;
  color: string;
  microchipId?: string;
  profileImage?: string;
  owner: Owner;
  medicalHistory: string;
  allergies: string;
  currentMedications: string[];
  vaccinations: VaccinationRecord[];
  treatments: TreatmentRecord[];
  lastVisit: string;
  nextAppointment?: string;
  status: 'active' | 'inactive' | 'deceased';
  notes: string;
  dateRegistered: string;
}

interface PatientDetailsProps {
  patient: Patient;
  onEdit?: (patient: Patient) => void;
  onDelete?: (patientId: string) => void;
  onAddTreatment?: (patientId: string) => void;
  onScheduleAppointment?: (patientId: string) => void;
}

export const PatientDetails: React.FC<PatientDetailsProps> = ({
  patient,
  onEdit,
  onDelete,
  onAddTreatment,
  onScheduleAppointment
}) => {
  const getStatusColor = (status: string): "secondary" | "destructive" | "default" => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'deceased': return 'destructive';
      default: return 'secondary';
    }
  };

  const getGenderIcon = (gender: string) => {
    return gender.toLowerCase() === 'male' ? '♂' : '♀';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={patient.profileImage} alt={patient.name} />
            <AvatarFallback className="text-2xl">
              {patient.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
              {patient.name}
              <span className="text-muted-foreground text-xl">
                {getGenderIcon(patient.gender)}
              </span>
            </h2>
            <p className="text-lg text-muted-foreground">
              {patient.breed} • {patient.species} • {patient.age} years old
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={getStatusColor(patient.status)}>
                {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
              </Badge>
              {patient.microchipId && (
                <Badge variant="outline">Microchipped</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {onScheduleAppointment && (
            <Button onClick={() => onScheduleAppointment(patient.id)} size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule
            </Button>
          )}
          {onAddTreatment && (
            <Button onClick={() => onAddTreatment(patient.id)} variant="secondary" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Treatment
            </Button>
          )}
          {onEdit && (
            <Button onClick={() => onEdit(patient)} variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button onClick={() => onDelete(patient.id)} variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Species</label>
                <p className="text-foreground">{patient.species}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Breed</label>
                <p className="text-foreground">{patient.breed}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Age</label>
                <p className="text-foreground">{patient.age} years</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Gender</label>
                <p className="text-foreground">{patient.gender}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Weight</label>
                <p className="text-foreground">{patient.weight} kg</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Color</label>
                <p className="text-foreground">{patient.color}</p>
              </div>
            </div>
            {patient.microchipId && (
              <>
                <Separator />
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Microchip ID</label>
                  <p className="text-foreground font-mono">{patient.microchipId}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Owner Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Owner Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="text-foreground font-medium">{patient.owner.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Phone</label>
              <p className="text-foreground flex items-center gap-2">
                <Phone className="h-4 w-4" />
                {patient.owner.phone}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-foreground">{patient.owner.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Address</label>
              <p className="text-foreground flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5" />
                {patient.owner.address}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Emergency Contact</label>
              <p className="text-foreground">{patient.owner.emergencyContact}</p>
            </div>
          </CardContent>
        </Card>

        {/* Medical History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Medical History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Medical History</label>
              <p className="text-foreground">{patient.medicalHistory}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Allergies</label>
              <p className="text-foreground">{patient.allergies || 'None known'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Current Medications</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {patient.currentMedications.length > 0 ? (
                  patient.currentMedications.map((med, index) => (
                    <Badge key={index} variant="outline">{med}</Badge>
                  ))
                ) : (
                  <p className="text-muted-foreground">None</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Visit Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Visit Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Last Visit</label>
              <p className="text-foreground">{new Date(patient.lastVisit).toLocaleDateString()}</p>
            </div>
            {patient.nextAppointment && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Next Appointment</label>
                <p className="text-foreground">{new Date(patient.nextAppointment).toLocaleDateString()}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-muted-foreground">Date Registered</label>
              <p className="text-foreground">{new Date(patient.dateRegistered).toLocaleDateString()}</p>
            </div>
          </CardContent>
        </Card>

        {/* Vaccinations */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Vaccination Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            {patient.vaccinations.length > 0 ? (
              <div className="space-y-4">
                {patient.vaccinations.map((vaccine) => (
                  <div key={vaccine.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{vaccine.vaccine}</p>
                      <p className="text-sm text-muted-foreground">
                        Administered: {new Date(vaccine.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        By: {vaccine.veterinarian}
                      </p>
                    </div>
                    {vaccine.nextDue && (
                      <Badge variant="outline">
                        Next due: {new Date(vaccine.nextDue).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No vaccination records available</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Treatments */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5" />
              Recent Treatments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {patient.treatments && patient.treatments.length > 0 ? (
              <div className="space-y-4">
                {patient.treatments.slice(0, 5).map((treatment) => (
                  <div key={treatment.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">
                          {treatment.diagnosisAndNotes?.split(' - ')[0] || 'Treatment'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(treatment.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-foreground mb-2">
                      {treatment.diagnosisAndNotes?.split(' - ')[1] || treatment.diagnosisAndNotes || '—'}
                    </p>
                    {treatment.medicinesAndPrescription && (
                      <div className="flex flex-wrap gap-1">
                        {treatment.medicinesAndPrescription.split(',').map((med, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {med.trim()}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No treatment records available</p>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        {patient.notes && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground">{patient.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};