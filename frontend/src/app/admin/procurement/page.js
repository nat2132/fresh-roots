'use client';

import { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Plus, 
  Calendar,
  User,
  ArrowRight,
  PackageSearch
} from 'lucide-react';
import api from '@/lib/api';

export default function ProcurementPage() {
  const [batches, setBatches] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    farmer_code: '',
    product_type: '',
    quantity: '',
    unit: 'kg',
    unit_price: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [batchesData, farmersData] = await Promise.all([
        api.getProcurementBatches(),
        api.getAdminFarmers(),
      ]);
      setBatches(batchesData.results || batchesData);
      setFarmers(farmersData.results || farmersData);
    } catch (err) {
      console.error('Failed to fetch procurement data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    try {
      // Find the farmer ID from the code since API expects farmer ID
      const selectedFarmer = farmers.find(f => f.farmer_code === formData.farmer_code);
      if (!selectedFarmer) throw new Error('Invalid farmer');

      const quantityVal = parseFloat(formData.quantity);
      const unitPriceVal = parseFloat(formData.unit_price);
      const totalCostVal = quantityVal * unitPriceVal;

      const payload = {
        farmer: selectedFarmer.id,
        purchase_date: new Date().toISOString().split('T')[0],
        total_cost: totalCostVal.toFixed(2),
        notes: `Procured: ${formData.product_type}`,
        items: [
          {
            product_name: formData.product_type,
            quantity: quantityVal,
            unit: formData.unit,
            unit_cost: unitPriceVal,
            quality_grade: 'B'
          }
        ]
      };

      const newBatch = await api.createProcurementBatch(payload);
      setBatches([newBatch, ...batches]);
      setIsDialogOpen(false);
      setFormData({
        farmer_code: '',
        product_type: '',
        quantity: '',
        unit: 'kg',
        unit_price: '',
      });
    } catch (err) {
      console.error('Failed to create batch', err);
      alert('Failed to create procurement batch. Check inputs.');
    }
  };

  const handlePayBatch = async (batchNumber) => {
    try {
      const updated = await api.updateProcurementBatch(batchNumber, { payment_status: 'paid' });
      setBatches(batches.map(b => b.batch_number === batchNumber ? updated : b));
    } catch (err) {
      console.error('Failed to update batch payment status', err);
      alert('Failed to update batch payment status.');
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-500">Loading Procurement Batches...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Procurement</h1>
          <p className="text-slate-500 mt-1">Track batches of fresh produce purchased from farmers.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={
            <Button className="bg-brand-green hover:bg-brand-forest rounded-full shadow-lg shadow-brand-green/20 h-11 px-6">
              <Plus className="mr-2 h-4 w-4" /> New Batch
            </Button>
          } />
          <DialogContent className="sm:max-w-[425px] rounded-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif font-bold text-center mb-4">New Procurement</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateBatch} className="space-y-4">
              <div className="space-y-2">
                <Label>Farmer</Label>
                <Select value={formData.farmer_code} onValueChange={(val) => setFormData({...formData, farmer_code: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Farmer" />
                  </SelectTrigger>
                  <SelectContent>
                    {farmers.map(f => (
                      <SelectItem key={f.farmer_code} value={f.farmer_code}>
                        {f.full_name} ({f.farmer_code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Product Type</Label>
                <Input required placeholder="e.g. Tomatoes" value={formData.product_type} onChange={e => setFormData({...formData, product_type: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input type="number" step="0.01" required value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Select value={formData.unit} onValueChange={(val) => setFormData({...formData, unit: val})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilograms (kg)</SelectItem>
                      <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                      <SelectItem value="bunch">Bunches</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Unit Price (ETB)</Label>
                <Input type="number" step="0.01" required value={formData.unit_price} onChange={e => setFormData({...formData, unit_price: e.target.value})} />
              </div>

              <Button type="submit" className="w-full bg-brand-green hover:bg-brand-forest rounded-xl h-12 mt-4">
                Record Batch
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-none shadow-sm min-h-[500px]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent px-4">
                <TableHead className="pl-6">Batch #</TableHead>
                <TableHead>Farmer</TableHead>
                <TableHead>Product Type</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batches.map((batch) => (
                <TableRow key={batch.id} className="hover:bg-slate-50">
                  <TableCell className="pl-6 font-mono text-xs font-bold text-slate-500">
                    {batch.batch_number}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <User className="mr-2 h-3 w-3 text-slate-400" />
                      {batch.farmer_name || (batch.farmer_detail && batch.farmer_detail.full_name) || 'Unknown'}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {batch.product_type || (batch.items && batch.items.length > 0 ? batch.items.map(it => it.product_name).join(', ') : 'Unknown')}
                  </TableCell>
                  <TableCell>
                    {batch.quantity || (batch.items && batch.items.length > 0 ? batch.items.reduce((sum, it) => sum + parseFloat(it.quantity), 0) : 0)} {batch.unit || (batch.items && batch.items.length > 0 ? batch.items[0].unit : '')}
                  </TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-3 w-3 text-slate-400" />
                      {new Date(batch.procurement_date || batch.created_at).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className={
                        batch.payment_status === 'paid' ? 'bg-green-50 text-green-700 border-green-200' :
                        batch.payment_status === 'pending' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                        'bg-slate-100'
                      }
                    >
                      {batch.payment_status === 'paid' ? 'Paid' : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    {batch.payment_status === 'pending' && (
                      <Button variant="outline" size="sm" className="h-8" onClick={() => handlePayBatch(batch.batch_number)}>
                        Mark Paid <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {batches.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-slate-500">
                    <PackageSearch className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                    No procurement batches recorded yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
