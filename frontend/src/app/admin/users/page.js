'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, ShieldAlert, Truck, User, Plus, MoreVertical, Edit2, UserX, UserCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // New Staff Form State
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'warehouse_manager',
    vehicle_type: '',
  });

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = roleFilter !== 'all' ? { role: roleFilter } : {};
      const data = await api.getUsers(params);
      setUsers(data.results || data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      const newStaff = await api.createStaff(formData);
      setUsers([newStaff.user, ...users]);
      setIsDialogOpen(false);
      setFormData({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        phone: '',
        role: 'warehouse_manager',
        vehicle_type: '',
      });
    } catch (err) {
      console.error('Failed to create staff', err);
      alert('Failed to create staff account. Please verify inputs and ensure username is unique.');
    }
  };

  const handleToggleActive = async (user) => {
    try {
      const updated = await api.manageUser(user.id, { is_active: !user.is_active });
      setUsers(users.map(u => u.id === user.id ? { ...u, is_active: updated.is_active } : u));
    } catch (err) {
      console.error('Failed to toggle active status', err);
      alert('Failed to update user status.');
    }
  };

  const handleChangeRole = async (role) => {
    if (!selectedUser) return;
    try {
      const updated = await api.manageUser(selectedUser.id, { role });
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, role: updated.role } : u));
      setIsRoleDialogOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Failed to change role', err);
      alert('Failed to update user role.');
    }
  };

  const getRoleIcon = (role) => {
    switch(role) {
      case 'admin': return <ShieldAlert className="h-4 w-4 text-red-500" />;
      case 'content_manager':
      case 'warehouse_manager': return <ShieldAlert className="h-4 w-4 text-blue-500" />;
      case 'delivery_partner': return <Truck className="h-4 w-4 text-orange-500" />;
      default: return <User className="h-4 w-4 text-slate-400" />;
    }
  };

  const getRoleBadge = (role) => {
    switch(role) {
      case 'admin': return <Badge className="bg-red-100 text-red-700 border-none">Admin</Badge>;
      case 'content_manager': return <Badge className="bg-blue-100 text-blue-700 border-none">Content Manager</Badge>;
      case 'warehouse_manager': return <Badge className="bg-blue-100 text-blue-700 border-none">Warehouse Manager</Badge>;
      case 'delivery_partner': return <Badge className="bg-orange-100 text-orange-700 border-none">Delivery</Badge>;
      default: return <Badge className="bg-slate-100 text-slate-700 border-none">Customer</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-slate-900 font-bold">User Management</h1>
          <p className="text-slate-500">Manage platform users, roles, and access.</p>
        </div>
        
        <div className="flex gap-4 w-full sm:w-auto">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="bg-white w-48">
              <SelectValue placeholder="Filter by Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
              <SelectItem value="warehouse_manager">Warehouse</SelectItem>
              <SelectItem value="content_manager">Content</SelectItem>
              <SelectItem value="delivery_partner">Delivery</SelectItem>
              <SelectItem value="customer">Customers</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger render={
              <Button className="bg-brand-green hover:bg-brand-forest rounded-full shadow-lg shadow-brand-green/20 h-10 px-6" />
            }>
              <Plus className="mr-2 h-4 w-4" /> Create Staff
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] rounded-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-serif font-bold text-center mb-4">New Staff Account</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateStaff} className="space-y-4">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(val) => setFormData(prev => ({ ...prev, role: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="warehouse_manager">Warehouse Manager</SelectItem>
                      <SelectItem value="content_manager">Content Manager</SelectItem>
                      <SelectItem value="delivery_partner">Delivery Partner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input required value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input required value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                </div>
                
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                
                <div className="space-y-2">
                  <Label>Temporary Password</Label>
                  <Input type="password" required minLength={8} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>

                {formData.role === 'delivery_partner' && (
                  <div className="space-y-2">
                    <Label>Vehicle Type (Optional)</Label>
                    <Input placeholder="e.g. Motorcycle, Van" value={formData.vehicle_type} onChange={e => setFormData({...formData, vehicle_type: e.target.value})} />
                  </div>
                )}

                <Button type="submit" className="w-full bg-brand-green hover:bg-brand-forest rounded-xl h-12 mt-4">
                  Register Account
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden min-h-[500px]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4 rounded-tl-2xl">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined Date</th>
                <th className="px-6 py-4 rounded-tr-2xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    <Users className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                          {getRoleIcon(u.role)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{u.first_name ? `${u.first_name} ${u.last_name || ''}` : u.username}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getRoleBadge(u.role)}</td>
                    <td className="px-6 py-4">
                      {u.is_active ? (
                        <Badge className="bg-green-100 text-green-700 border-none">Active</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700 border-none">Suspended</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(u.date_joined).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="ghost" className="h-8 w-8 p-0" />}>
                          <MoreVertical className="h-4 w-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel>Manage User</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => {
                            setSelectedUser(u);
                            setIsRoleDialogOpen(true);
                          }}>
                            <Edit2 className="h-4 w-4 mr-2" /> Change Role
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleToggleActive(u)}
                            className={u.is_active ? 'text-red-600 focus:text-red-600' : 'text-green-600 focus:text-green-600'}
                          >
                            {u.is_active ? (
                              <><UserX className="h-4 w-4 mr-2" /> Suspend User</>
                            ) : (
                              <><UserCheck className="h-4 w-4 mr-2" /> Activate User</>
                            )}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Role Change Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif font-bold">Change User Role</DialogTitle>
            <p className="text-sm text-slate-500">Update role for {selectedUser?.username}</p>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Select 
              value={selectedUser?.role} 
              onValueChange={handleChangeRole}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select new role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="customer">Customer</SelectItem>
                <SelectItem value="admin">Administrator</SelectItem>
                <SelectItem value="warehouse_manager">Warehouse Manager</SelectItem>
                <SelectItem value="content_manager">Content Manager</SelectItem>
                <SelectItem value="delivery_partner">Delivery Partner</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
