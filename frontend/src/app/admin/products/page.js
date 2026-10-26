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
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { 
  Store, 
  Eye, 
  EyeOff, 
  Edit,
  ExternalLink,
  Plus
} from 'lucide-react';
import api from '@/lib/api';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    unit: 'kg',
    category_name: '',
    in_stock: true,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await api.getAdminProducts();
      setProducts(data.results || data);
    } catch (err) {
      console.error('Failed to fetch admin products', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        unit: formData.unit,
        category_name: formData.category_name || 'Uncategorized',
        in_stock: formData.in_stock,
        is_visible: false, // New products are hidden by default until reviewed
      };

      const newProduct = await api.createAdminProduct(payload);
      setProducts([newProduct, ...products]);
      setIsDialogOpen(false);
      setFormData({
        name: '',
        description: '',
        price: '',
        unit: 'kg',
        category_name: '',
        in_stock: true,
      });
    } catch (err) {
      console.error('Failed to create product', err);
      alert('Failed to create product. Check inputs.');
    }
  };

  const toggleVisibility = async (slug, currentVisibility) => {
    try {
      await api.updateAdminProduct(slug, { is_visible: !currentVisibility });
      setProducts(products.map(p => p.slug === slug ? { ...p, is_visible: !currentVisibility } : p));
    } catch (err) {
      console.error('Failed to toggle visibility', err);
    }
  };

  if (loading) return <div className="p-12 text-center text-slate-500">Loading Products...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Product Catalog</h1>
          <p className="text-slate-500 mt-1">Manage public product listings, visibility, and pricing.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={
            <Button className="bg-brand-green hover:bg-brand-forest rounded-full shadow-lg shadow-brand-green/20 h-11 px-6">
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          } />
          <DialogContent className="sm:max-w-[425px] rounded-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-serif font-bold text-center mb-4">New Product Listing</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="space-y-2">
                <Label>Product Name</Label>
                <Input required placeholder="e.g. Organic Red Tomatoes" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.category_name} onValueChange={(val) => setFormData({...formData, category_name: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vegetables">Vegetables</SelectItem>
                      <SelectItem value="Fruits">Fruits</SelectItem>
                      <SelectItem value="Dairy">Dairy</SelectItem>
                      <SelectItem value="Grains">Grains</SelectItem>
                    </SelectContent>
                  </Select>
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
                      <SelectItem value="pack">Packs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Retail Price (ETB)</Label>
                <Input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  placeholder="Describe the product for customers..." 
                  rows={3} 
                  value={formData.description} 
                  onChange={e => setFormData({...formData, description: e.target.value})} 
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-xl bg-slate-50">
                <div className="space-y-0.5">
                  <Label>In Stock Availability</Label>
                  <p className="text-xs text-slate-500">Is this item currently available to purchase?</p>
                </div>
                <Switch 
                  checked={formData.in_stock} 
                  onCheckedChange={checked => setFormData({...formData, in_stock: checked})} 
                />
              </div>

              <Button type="submit" className="w-full bg-brand-green hover:bg-brand-forest rounded-xl h-12 mt-4">
                Create Listing
              </Button>
            </form>
          </DialogContent>
        </Dialog>

      </div>

      <Card className="border-none shadow-sm min-h-[500px]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6">Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock Status</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id} className="hover:bg-slate-50">
                  <TableCell className="pl-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded bg-slate-100 flex items-center justify-center text-xl">
                        🥦
                      </div>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-slate-400 font-mono">{product.slug}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-slate-50 font-normal">
                      {product.category_name || 'Uncategorized'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {parseFloat(product.price).toFixed(0)} ETB <span className="text-xs text-slate-400 font-normal">/ {product.unit}</span>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={product.in_stock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}
                    >
                      {product.in_stock ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => toggleVisibility(product.slug, product.is_visible)}
                      className={product.is_visible ? 'text-blue-600' : 'text-slate-400'}
                    >
                      {product.is_visible ? (
                        <><Eye className="mr-2 h-4 w-4" /> Visible</>
                      ) : (
                        <><EyeOff className="mr-2 h-4 w-4" /> Hidden</>
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4 text-slate-500" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <a href={`/products/${product.slug}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 text-slate-500" />
                        </a>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                    No products in the catalog yet.
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
