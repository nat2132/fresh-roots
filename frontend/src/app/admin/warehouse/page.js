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
  Store, 
  AlertTriangle, 
  ArrowDownToLine,
  PackageSearch
} from 'lucide-react';
import api from '@/lib/api';

export default function WarehousePage() {
  const [inventory, setInventory] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    warehouse_id: '',
    batch_id: '',
    product_id: '',
    quantity: '',
    storage_location: '',
  });

  useEffect(() => {
    fetchWarehouseData();
  }, []);

  const fetchWarehouseData = async () => {
    try {
      const [invData, lowData, warehousesData, batchesData, productsData] = await Promise.all([
        api.getWarehouseInventory(),
        api.getLowStockAlerts(),
        api.getWarehouses(),
        api.getProcurementBatches(),
        api.getAdminProducts(),
      ]);
      setInventory(invData.results || invData);
      setLowStock(lowData.results || lowData);
      setWarehouses(warehousesData.results || warehousesData);
      setBatches(batchesData.results || batchesData);
      setProducts(productsData.results || productsData);
    } catch (err) {
      console.error('Failed to fetch warehouse data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReceiveStock = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        warehouse_id: parseInt(formData.warehouse_id),
        product_id: parseInt(formData.product_id),
        quantity: parseFloat(formData.quantity),
        storage_location: formData.storage_location,
      };
      
      // If batch is selected and not 'none', add it
      if (formData.batch_id && formData.batch_id !== 'none') {
        payload.batch_id = parseInt(formData.batch_id);
      }

      const newInvItem = await api.receiveWarehouseStock(payload);
      
      // Refresh inventory lists
      fetchWarehouseData();
      setIsDialogOpen(false);
      setFormData({
        warehouse_id: '',
        batch_id: '',
        product_id: '',
        quantity: '',
        storage_location: '',
      });
    } catch (err) {
      console.error('Failed to receive stock', err);
      alert('Failed to receive stock. Please verify the inputs.');
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-500">Loading Warehouse Inventory...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Warehouse</h1>
          <p className="text-slate-500 mt-1">Monitor real-time inventory levels and stock movements.</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger render={
              <Button className="bg-brand-green hover:bg-brand-forest">
                <ArrowDownToLine className="mr-2 h-4 w-4" /> Receive Batch
              </Button>
            } />
            <DialogContent className="sm:max-w-[425px] rounded-3xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-serif font-bold text-center mb-4">Receive Stock</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleReceiveStock} className="space-y-4">
                <div className="space-y-2">
                  <Label>Warehouse</Label>
                  <Select required value={formData.warehouse_id} onValueChange={(val) => setFormData({...formData, warehouse_id: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map(w => (
                        <SelectItem key={w.id} value={w.id.toString()}>
                          {w.name} ({w.location})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Product</Label>
                  <Select required value={formData.product_id} onValueChange={(val) => setFormData({...formData, product_id: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(p => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Procurement Batch (Optional)</Label>
                  <Select value={formData.batch_id} onValueChange={(val) => setFormData({...formData, batch_id: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Batch" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Batch</SelectItem>
                      {batches.map(b => (
                        <SelectItem key={b.id} value={b.id.toString()}>
                          {b.batch_number} - {b.items && b.items.length > 0 ? b.items.map(it => it.product_name).join(', ') : 'Unknown'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input type="number" step="0.01" required min="0.01" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Storage Location</Label>
                    <Input placeholder="e.g. Zone A-1" required value={formData.storage_location} onChange={e => setFormData({...formData, storage_location: e.target.value})} />
                  </div>
                </div>

                <Button type="submit" className="w-full bg-brand-green hover:bg-brand-forest rounded-xl h-12 mt-4">
                  Receive into Inventory
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {lowStock.length > 0 && (
        <Card className="border-red-200 bg-red-50/50 shadow-sm">
          <CardContent className="p-4 flex items-start gap-4">
            <div className="p-2 bg-red-100 rounded-full shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-red-900">Low Stock Alerts ({lowStock.length})</h3>
              <div className="mt-2 space-y-1">
                {lowStock.map(item => (
                  <div key={item.id} className="text-sm text-red-800 flex justify-between w-full max-w-md">
                    <span>{item.product_name || (item.product && item.product.name)}</span>
                    <span className="font-bold">{item.quantity} remaining</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-none shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6">Product</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Warehouse</TableHead>
                <TableHead>Batch Ref</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => (
                <TableRow key={item.id} className="hover:bg-slate-50">
                  <TableCell className="pl-6 font-medium">
                    {item.product_name || (item.product && item.product.name)}
                  </TableCell>
                  <TableCell className="text-slate-500 font-mono text-sm">
                    {item.storage_location}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Store className="mr-2 h-3 w-3 text-slate-400" />
                      {item.warehouse_name || (item.warehouse && item.warehouse.name)}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-mono text-slate-400">
                    {item.batch_number || (item.batch && item.batch.batch_number) || '-'}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {item.quantity}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={
                        item.quantity > 50 ? 'bg-green-100 text-green-700' : 
                        item.quantity > 10 ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }
                    >
                      {item.quantity > 50 ? 'Optimal' : item.quantity > 10 ? 'Low Stock' : 'Critical'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {inventory.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                    <PackageSearch className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                    No inventory items found.
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
