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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Truck, 
  MapPin, 
  Key,
  CheckCircle,
  Clock,
  Phone
} from 'lucide-react';
import api from '@/lib/api';

export default function AdminDeliveriesPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState(null);
  const [vCode, setVCode] = useState('');

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const data = await api.getAdminDeliveries();
      setDeliveries(data.results || data);
    } catch (err) {
      console.error('Failed to fetch admin deliveries', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (deliveryId) => {
    if (!vCode) return;
    try {
      await api.verifyDelivery(deliveryId, vCode);
      setVCode('');
      setVerifyingId(null);
      fetchDeliveries();
      alert('Delivery verified and completed successfully!');
    } catch (err) {
      console.error('Verification failed', err);
      alert(err.error || 'Invalid verification code.');
    }
  };

  if (loading) return <div>Loading Deliveries...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Delivery Hub</h1>
        <p className="text-slate-500 mt-1">Manage assignments and verify successful deliveries.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {deliveries.map((delivery) => (
          <Card key={delivery.id} className={`border-none shadow-sm ${delivery.status === 'delivered' ? 'opacity-60' : ''}`}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-blue-600">Order #{delivery.order_number}</Badge>
                      <span className="text-xs text-slate-400">Assigned: {new Date(delivery.assigned_at).toLocaleString()}</span>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`capitalize ${
                        delivery.status === 'delivered' ? 'text-green-600 border-green-200 bg-green-50' : 'text-blue-600 border-blue-200 bg-blue-50'
                      }`}
                    >
                      {delivery.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold">Delivery Address</p>
                        <p className="text-sm text-slate-600">{delivery.delivery_address || 'Address not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold">Contact Customer</p>
                        <p className="text-sm text-slate-600">{delivery.customer_phone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-64 flex flex-col justify-center border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6 gap-3">
                  {delivery.status !== 'delivered' && delivery.status !== 'completed' ? (
                    <>
                      {verifyingId === delivery.id ? (
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Enter Code</p>
                          <div className="flex gap-2">
                            <Input 
                              placeholder="6-digit code" 
                              value={vCode}
                              onChange={(e) => setVCode(e.target.value)}
                              className="font-mono text-center tracking-widest"
                              maxLength={6}
                            />
                            <Button size="icon" className="bg-green-600 shrink-0" onClick={() => handleVerify(delivery.id)}>
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setVerifyingId(null)}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button className="w-full bg-blue-700" onClick={() => setVerifyingId(delivery.id)}>
                          <Key className="mr-2 h-4 w-4" /> Verify Delivery
                        </Button>
                      )}
                    </>
                  ) : (
                    <div className="text-center text-green-600 font-bold flex flex-col items-center gap-1">
                      <CheckCircle className="h-8 w-8" />
                      <span>Successfully Delivered</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {deliveries.length === 0 && (
          <div className="text-center py-20 bg-white rounded-lg border border-dashed text-slate-400">
            <Truck className="mx-auto h-12 w-12 mb-4 opacity-20" />
            <p>No active deliveries assigned to you.</p>
          </div>
        )}
      </div>
    </div>
  );
}
