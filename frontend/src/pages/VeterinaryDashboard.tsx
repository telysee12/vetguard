import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
 
  Pill,
  Award,
  Plus,
  Edit,
  Download,
  Upload,
  Activity,
  Stethoscope,
  IdCard,
  PawPrint,
  Syringe,
  FileText,
  Clock,
  CheckCircle,
} from 'lucide-react';

const VeterinaryDashboard = () => {
  const [selectedTab, setSelectedTab] = useState('overview');
  
  // Mock data
  const vetInfo = {
    name: 'Dr. Sarah Johnson',
    license: 'VET-RW-2024-001',
    location: 'Kigali, Gasabo District',
    specialization: 'Large Animal Medicine',
    status: 'Active',
    licenseExpiry: '2025-12-31'
  };

  const recentPatients = [
    {
      id: 1,
      animalName: 'Bella',
      species: 'Cattle',
      owner: 'John Uwimana',
      lastVisit: '2024-01-20',
      condition: 'Vaccination',
      status: 'Completed'
    },
    {
      id: 2,
      animalName: 'Rex',
      species: 'Dog',
      owner: 'Marie Claire',
      lastVisit: '2024-01-19',
      condition: 'Injury Treatment',
      status: 'Follow-up'
    }
  ];

  const medicines = [
    {
      id: 1,
      name: 'Penicillin Injectable',
      stock: 25,
      unit: 'vials',
      expiry: '2024-08-15',
      status: 'In Stock'
    },
    {
      id: 2,
      name: 'Ivermectin',
      stock: 5,
      unit: 'bottles',
      expiry: '2024-06-30',
      status: 'Low Stock'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Dashboard Header */}
      <section className="bg-gradient-primary text-primary-foreground py-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">Veterinary Dashboard</h1>
              <p className="text-primary-foreground/90">Welcome back, {vetInfo.name}</p>
            </div>
            <div className="text-right">
              <Badge variant="secondary" className="mb-2">
                <IdCard className="h-3 w-3 mr-1" />
                {vetInfo.license}
              </Badge>
              <p className="text-sm text-primary-foreground/80">{vetInfo.location}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full lg:w-fit grid-cols-2 lg:grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="treatments">Treatments</TabsTrigger>
            <TabsTrigger value="medicines">Medicines</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="license">License</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="border-l-4 border-l-primary">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                  <PawPrint className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">247</div>
                  <p className="text-xs text-muted-foreground">+12 this month</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-secondary">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Treatments</CardTitle>
                  <Syringe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-secondary">89</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-warning">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Follow-ups</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-warning">15</div>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-accent">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Medicine Stock</CardTitle>
                  <Pill className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-accent">24</div>
                  <p className="text-xs text-muted-foreground">Items available</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-primary" />
                  <span>Recent Patients</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentPatients.map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                      <div className="space-y-1">
                        <h4 className="font-medium">{patient.animalName} - {patient.species}</h4>
                        <p className="text-sm text-muted-foreground">Owner: {patient.owner}</p>
                        <p className="text-sm text-muted-foreground">Last Visit: {patient.lastVisit}</p>
                      </div>
                      <div className="text-right space-y-2">
                        <Badge variant={patient.status === 'Completed' ? 'default' : 'secondary'}>
                          {patient.status}
                        </Badge>
                        <p className="text-sm text-muted-foreground">{patient.condition}</p>
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
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <PawPrint className="h-5 w-5 text-primary" />
                  <span>Patient Management</span>
                </CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Patient
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="animalName">Animal Name</Label>
                  <Input id="animalName" placeholder="Enter animal name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="medicalHistory">Existing Illness/Condition</Label>
                  <Textarea id="medicalHistory" placeholder="Enter animal's medical history..." />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ownerName">Owner Name</Label>
                    <Input id="ownerName" placeholder="Enter owner name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ownerPhone">Owner Phone</Label>
                    <Input id="ownerPhone" placeholder="Enter phone number" />
                  </div>
                </div>
                <Button className="w-full">Register Patient</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Treatments Tab */}
          <TabsContent value="treatments" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  <span>Treatment Records</span>
                </CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Treatment
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="patientSelect">Select Patient</Label>
                    <Input id="patientSelect" placeholder="Search patient..." />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="treatmentDate">Treatment Date</Label>
                    <Input id="treatmentDate" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="diagnosis">Diagnosis</Label>
                    <Input id="diagnosis" placeholder="Enter diagnosis" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="treatment">Treatment Given</Label>
                    <Input id="treatment" placeholder="Enter treatment details" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prescription">Prescription & Notes</Label>
                  <Textarea id="prescription" placeholder="Enter prescription and additional notes..." />
                </div>
                <Button className="w-full">Save Treatment Record</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Medicines Tab */}
          <TabsContent value="medicines" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Pill className="h-5 w-5 text-primary" />
                  <span>Medicine Inventory</span>
                </CardTitle>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Medicine
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {medicines.map((medicine) => (
                    <div key={medicine.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <h4 className="font-medium">{medicine.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Stock: {medicine.stock} {medicine.unit} | Expires: {medicine.expiry}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant={medicine.status === 'Low Stock' ? 'destructive' : 'default'}>
                          {medicine.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
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
                  <span>Monthly Reports</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reportMonth">Report Month</Label>
                    <Input id="reportMonth" type="month" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="totalTreatments">Total Treatments</Label>
                    <Input id="totalTreatments" placeholder="Number of treatments" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reportSummary">Report Summary</Label>
                  <Textarea id="reportSummary" placeholder="Summarize your activities for this month..." />
                </div>
                <div className="flex space-x-4">
                  <Button className="flex-1">Generate Report</Button>
                  <Button variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* License Tab */}
          <TabsContent value="license" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-primary" />
                  <span>License Management</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current License Status */}
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">Current License Status</h3>
                    <Badge variant="default">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">License Number</p>
                      <p className="font-medium">{vetInfo.license}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Expiry Date</p>
                      <p className="font-medium">{vetInfo.licenseExpiry}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Specialization</p>
                      <p className="font-medium">{vetInfo.specialization}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-medium">{vetInfo.location}</p>
                    </div>
                  </div>
                </div>

                {/* License Renewal */}
                <div className="space-y-4">
                  <h3 className="font-medium">License Renewal / New Application</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="degree">Veterinary Degree</Label>
                      <div className="flex space-x-2">
                        <Input id="degree" placeholder="Upload degree certificate" readOnly />
                        <Button size="sm" variant="outline">
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="idDocument">ID Document</Label>
                      <div className="flex space-x-2">
                        <Input id="idDocument" placeholder="Upload ID document" readOnly />
                        <Button size="sm" variant="outline">
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experience">Experience Certificate</Label>
                      <div className="flex space-x-2">
                        <Input id="experience" placeholder="Upload experience certificate" readOnly />
                        <Button size="sm" variant="outline">
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="payment">Payment Proof</Label>
                      <div className="flex space-x-2">
                        <Input id="payment" placeholder="Upload payment receipt" readOnly />
                        <Button size="sm" variant="outline">
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="specialization">Specialization</Label>
                    <Input id="specialization" placeholder="Enter your specialization" />
                  </div>
                  <div className="flex space-x-4">
                    <Button className="flex-1">Submit Application</Button>
                    <Button variant="outline" className="flex-1">
                      <Download className="h-4 w-4 mr-2" />
                      Download Current License
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VeterinaryDashboard;