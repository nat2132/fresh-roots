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
  Plus, 
  Search, 
  Tractor, 
  MapPin, 
  Phone,
  MoreVertical,
  Eye,
  ChevronRight
} from 'lucide-react';
import api from '@/lib/api';
import FarmerForm from '@/components/admin/FarmerForm';
import Link from 'next/link';

export default function FarmersPage() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchFarmers();
  }, []);

  const fetchFarmers = async () => {
    try {
      const data = await api.getAdminFarmers();
      setFarmers(data.results || data);
    } catch (err) {
      console.error('Failed to fetch farmers', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredFarmers = farmers.filter(f => 
    f.farm_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.farmer_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div>Loading Farmers...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Farmers</h1>
          <p className="text-slate-500 mt-1">Manage your network of agricultural partners.</p>
        </div>
        <Button 
          className="bg-green-700 hover:bg-green-800"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Farmer
        </Button>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <FarmerForm 
            onCancel={() => setShowAddModal(false)} 
            onSuccess={() => {
              setShowAddModal(false);
              fetchFarmers();
            }}
          />
        </div>
      )}

      <Card className="border-none shadow-sm">
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search by farm name or code..." 
              className="pl-10 max-w-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Farmer Code</TableHead>
                <TableHead>Farm Name</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFarmers.map((farmer) => (
                <TableRow key={farmer.id} className="hover:bg-slate-50">
                  <TableCell className="font-mono text-xs font-bold text-slate-500">
                    {farmer.farmer_code}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-slate-100">
                        <Tractor className="h-4 w-4 text-slate-600" />
                      </div>
                      <span className="font-medium">{farmer.farm_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    <div className="flex items-center">
                      <MapPin className="mr-2 h-3 w-3 text-slate-400" />
                      {farmer.farm_location}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Phone className="mr-2 h-3 w-3 text-slate-400" />
                      {farmer.user_details?.phone || 'N/A'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className={farmer.is_active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100'}
                    >
                      {farmer.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" asChild className="rounded-lg h-9 border-slate-200">
                        <Link href={`/admin/farmers/${farmer.farmer_code}`}>
                          <Eye className="mr-2 h-4 w-4 text-slate-500" /> History
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" className="rounded-lg h-9 w-9">
                        <MoreVertical className="h-4 w-4 text-slate-400" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredFarmers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                    No farmers found matching your search.
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
