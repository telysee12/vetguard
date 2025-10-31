import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { 
  Package, 
  Calendar, 
  AlertTriangle, 
  Info, 
  Thermometer,
  DollarSign,
  Building,
  Hash,
  Edit,
  Trash2,
  History
} from "lucide-react";
import type { Medicine } from '../../pages/BasicDashboard'; // Import Medicine interface from BasicDashboard

interface MedicineStockMovement {
  id: number;
  medicineId: number;
  quantity: number;
  type: 'STOCK_IN' | 'STOCK_OUT';
  createdAt: string;
}

interface MedicineDetailsProps {
  medicine: Medicine;
  onClose: () => void;
  onUpdateStock: (medicine: Medicine) => void; // Pass the whole medicine object for updating
}

export const MedicineDetails: React.FC<MedicineDetailsProps> = ({
  medicine,
  onClose,
  onUpdateStock
}) => {
  const isLowStock = medicine.currentStock <= 10; // Assuming low stock is <= 10
  const isExpiringSoon = medicine.expiryDate ? new Date(medicine.expiryDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : false;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Info className="h-5 w-5 text-primary" />
              <span>Medicine Details</span>
            </CardTitle>
            <Button variant="outline" onClick={onClose} size="sm">
              Close
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-3xl font-bold text-foreground">{medicine.name}</h2>
                {medicine.description && <p className="text-lg text-muted-foreground mt-1">{medicine.description}</p>}
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant={medicine.currentStock > 10 ? "default" : "destructive"} className={medicine.currentStock > 10 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {medicine.currentStock > 10 ? "In Stock" : "Low Stock"}
                  </Badge>
                  {isExpiringSoon && medicine.expiryDate && (new Date(medicine.expiryDate) > new Date()) && <Badge variant="warning">Expiring Soon</Badge>}
                  {medicine.expiryDate && (new Date(medicine.expiryDate) < new Date()) && <Badge variant="destructive">Expired</Badge>}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => onUpdateStock(medicine)} variant="secondary" size="sm">
                  <Package className="h-4 w-4 mr-2" />
                  Update Stock
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Stock Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Stock Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Current Stock</label>
                      <p className={`text-lg font-semibold ${isLowStock ? 'text-destructive' : 'text-foreground'}`}>
                        {medicine.currentStock} {medicine.unit}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Total Stocked In</label>
                      <p className="text-foreground">{medicine.stockIn || 0} {medicine.unit}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Total Stocked Out</label>
                      <p className="text-foreground">{medicine.stockOut || 0} {medicine.unit}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Total Stock</label>
                      <p className="text-foreground">{medicine.totalStock} {medicine.unit}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Unit</label>
                      <p className="text-foreground">{medicine.unit}</p>
                    </div>
                    {medicine.expiryDate && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Expiry Date</label>
                        <p className={`flex items-center gap-2 ${(isExpiringSoon && (new Date(medicine.expiryDate) > new Date())) || (new Date(medicine.expiryDate) < new Date()) ? 'text-destructive' : 'text-foreground'}`}>
                          <Calendar className="h-4 w-4" />
                          {new Date(medicine.expiryDate).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Stock Movement History */}
              {medicine.stockMovements && medicine.stockMovements.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5" />
                      Stock Movement History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {medicine.stockMovements
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((movement) => (
                          <div key={movement.id} className="flex items-center justify-between text-sm">
                            <span className="font-medium">
                              {movement.type === 'STOCK_IN' ? 'Stock In' : 'Stock Out'}:
                            </span>
                            <span>{movement.quantity} {medicine.unit}</span>
                            <span className="text-muted-foreground">
                              {new Date(movement.createdAt).toLocaleString()}
                            </span>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Record Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Record Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Date Added</label>
                      <p className="text-foreground">{new Date(medicine.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                      <p className="text-foreground">{new Date(medicine.updatedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};