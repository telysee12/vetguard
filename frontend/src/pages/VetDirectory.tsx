import Header from '../components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { 
  Search, 
  MapPin, 
  Phone, 
  Mail,
  Award,
  Shield
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import { getApiUrl } from '../lib/api';

type Vet = {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  province?: string;
  district?: string;
  sector?: string;
  role: 'BASIC_VET' | 'SECTOR_VET' | 'ADMIN';
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  workplace?: string | null;
  license?: string | null;
};

const VetDirectory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedSector, setSelectedSector] = useState('');
  const [veterinarians, setVeterinarians] = useState<Vet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVets = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${getApiUrl()}/api/v1/register`);
        const data = res.ok ? await res.json() : [];
        const approvedVets = (Array.isArray(data) ? data : []).filter(
          (vet: Vet) => vet.role === 'BASIC_VET' && vet.status === 'APPROVED'
        );
        setVeterinarians(approvedVets);
      } catch (error) {
        console.error("Failed to fetch veterinarians", error);
        setVeterinarians([]);
      } finally {
        setLoading(false);
      }
    };
    loadVets();
  }, []);

  const provinces = useMemo(() => {
    const uniqueProvinces = [
      ...new Set(
        veterinarians
          .map(vet => vet.province)
          .filter((province): province is string => typeof province === 'string' && province.length > 0)
      )
    ];
    return uniqueProvinces.sort();
  }, [veterinarians]);

  const districts = useMemo(() => {
    const vetsInProvince = selectedProvince
      ? veterinarians.filter(vet => vet.province === selectedProvince)
      : veterinarians;
    
    const uniqueDistricts = [...new Set(
      vetsInProvince
        .map(vet => vet.district)
        .filter((district): district is string => typeof district === 'string' && district.length > 0)
    )];
    return uniqueDistricts.sort();
  }, [veterinarians, selectedProvince]);

  const sectors = useMemo(() => {
    let relevantVets = veterinarians;
    if (selectedProvince) {
      relevantVets = relevantVets.filter(vet => vet.province === selectedProvince);
    }
    if (selectedDistrict) {
      relevantVets = relevantVets.filter(vet => vet.district === selectedDistrict);
    }
    const uniqueSectors = [...new Set(
      relevantVets
        .map(vet => vet.sector)
        .filter((sector): sector is string => typeof sector === 'string' && sector.length > 0)
    )];
    return uniqueSectors.sort();
  }, [veterinarians, selectedProvince, selectedDistrict]);

  const filteredVets = veterinarians.filter(vet => 
    `${vet.firstName} ${vet.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedProvince ? vet.province === selectedProvince : true) &&
    (selectedDistrict ? vet.district === selectedDistrict : true) &&
    (selectedSector ? vet.sector === selectedSector : true)
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Page Header */}
      <section className="bg-gradient-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Find Approved Veterinarians
          </h1>
          <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
            Locate verified veterinary professionals in your area. 
            All veterinarians listed have been approved through our comprehensive licensing system.
          </p>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-muted/30 border-b">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search veterinarians..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedProvince} onValueChange={(value) => {
              setSelectedProvince(value === 'all-provinces' ? '' : value);
              setSelectedDistrict('');
              setSelectedSector('');
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select Province" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-provinces">All Provinces</SelectItem>
                {provinces.map(p => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDistrict} onValueChange={(value) => {
              setSelectedDistrict(value === 'all-districts' ? '' : value);
              setSelectedSector('');
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select District" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-districts">All Districts</SelectItem>
                {districts.map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedSector} onValueChange={(value) => setSelectedSector(value === 'all-sectors' ? '' : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-sectors">All Sectors</SelectItem>
                {sectors.map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={() => {
              setSearchTerm('');
              setSelectedProvince('');
              setSelectedDistrict('');
              setSelectedSector('');
            }}>
              Clear Filters
            </Button>
          </div>
        </div>
      </section>

      {/* Veterinarians Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">
              Available Veterinarians ({loading ? '...' : filteredVets.length})
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12"><p className="text-muted-foreground">Loading veterinarians...</p></div>
          ) : filteredVets.length > 0 ? (
            <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredVets.map((vet) => (
                <Card key={vet.id} className="hover:shadow-medium transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl mb-2">{vet.firstName} {vet.lastName}</CardTitle>
                        <p className="text-muted-foreground text-sm">{vet.workplace || 'General Practice'}</p>
                      </div>
                      {vet.status === 'APPROVED' && (
                        <Badge className="bg-success text-success-foreground">
                          <Shield className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{[vet.sector, vet.district, vet.province].filter(Boolean).join(', ')}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-sm">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span>License: {vet.license ? 'Available' : 'No license'}</span>
                    </div>

                    <div className="flex space-x-2 pt-4">
                      <Button size="sm" className="flex-1" asChild disabled={!vet.phone}>
                        <a href={vet.phone ? `tel:${vet.phone}` : undefined}>
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </a>
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1" asChild disabled={!vet.email}>
                        <a href={vet.email ? `mailto:${vet.email}`: undefined}>
                          <Mail className="h-4 w-4 mr-2" />
                          Email
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No veterinarians found matching your search criteria.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default VetDirectory;