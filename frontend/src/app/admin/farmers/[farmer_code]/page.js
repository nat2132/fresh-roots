'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Tractor, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  Package,
  CircleDollarSign,
  ClipboardList
} from 'lucide-react';
import api from '@/lib/api';

export default function FarmerDetailPage(props) {
  const params = use(props.params);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const result = await api.getFarmerHistory(params.farmer_code);
        setData(result);
      } catch (err) {
        console.error('Failed to fetch farmer history', err);
        setError('Farmer not found or failed to load history.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [params.farmer_code]);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading farmer profile...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  const { farmer, supply_history } = data;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/farmers">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-900 tracking-tight">Farmer Profile</h1>
          <p className="text-slate-500">Traceability and procurement history for {farmer.full_name}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Farmer Info Card */}
        <Card className="border-none shadow-sm h-fit">
          <CardHeader className="bg-slate-50 dark:bg-slate-900/50 rounded-t-3xl">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <Tractor className="h-8 w-8 text-green-700" />
              </div>
              <div>
                <CardTitle className="text-xl">{farmer.full_name}</CardTitle>
                <Badge variant="outline" className="mt-1 font-mono text-xs">
                  {farmer.farmer_code}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600 font-medium">{farmer.location}, {farmer.region}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600">{farmer.phone || 'No phone'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600">{farmer.email || 'No email'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600">Registered on {new Date(farmer.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Notes</h4>
              <p className="text-sm text-slate-500 leading-relaxed italic">
                {farmer.notes || "No additional notes for this farmer."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="bg-slate-50 p-4 rounded-2xl text-center">
                <p className="text-2xl font-bold text-slate-900">{farmer.total_batches || 0}</p>
                <p className="text-xs text-slate-400 font-bold uppercase">Batches</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl text-center">
                <p className="text-2xl font-bold text-slate-900">{farmer.total_products || 0}</p>
                <p className="text-xs text-slate-400 font-bold uppercase">Products</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* History Table */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm overflow-hidden">
            <CardHeader className="border-b border-slate-50">
              <CardTitle className="text-xl flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-green-700" /> Supply & Payment History
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow>
                    <TableHead>Batch #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Total Paid</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supply_history.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-48 text-center text-slate-400">
                        <Package className="h-8 w-8 mx-auto mb-2 opacity-20" />
                        No procurement history found for this farmer.
                      </TableCell>
                    </TableRow>
                  ) : (
                    supply_history.map((batch) => (
                      <TableRow key={batch.id}>
                        <TableCell className="font-mono text-xs font-bold">{batch.batch_number}</TableCell>
                        <TableCell className="text-slate-600 text-sm">
                          {new Date(batch.purchase_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="font-medium">{batch.product_name}</TableCell>
                        <TableCell>
                          {batch.quantity} {batch.unit}
                        </TableCell>
                        <TableCell className="font-bold text-slate-900">
                          {parseFloat(batch.total_price).toFixed(0)} ETB
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
                            Paid
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Quick Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm bg-brand-forest text-white overflow-hidden relative">
              <CircleDollarSign className="absolute -right-4 -bottom-4 h-24 w-24 text-white/10" />
              <CardContent className="p-6">
                <p className="text-white/60 text-sm font-bold uppercase tracking-wider mb-1">Total Lifetime Supply Value</p>
                <h3 className="text-3xl font-serif font-bold">
                  {supply_history.reduce((acc, b) => acc + parseFloat(b.total_price), 0).toFixed(0)} ETB
                </h3>
              </CardContent>
            </Card>
            
            <Card className="border-none shadow-sm bg-brand-green text-white overflow-hidden relative">
              <Package className="absolute -right-4 -bottom-4 h-24 w-24 text-white/10" />
              <CardContent className="p-6">
                <p className="text-white/60 text-sm font-bold uppercase tracking-wider mb-1">Total Items Supplied</p>
                <h3 className="text-3xl font-serif font-bold">
                  {supply_history.reduce((acc, b) => acc + parseFloat(b.quantity), 0).toFixed(0)} Units
                </h3>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
