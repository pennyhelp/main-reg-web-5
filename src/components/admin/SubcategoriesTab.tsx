import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Subcategory {
  id: string;
  category_id: string;
  name_english: string;
  name_malayalam: string;
  description: string | null;
  is_active: boolean;
  display_order: number;
}

interface Category {
  id: string;
  name_english: string;
  name_malayalam: string;
}

const SubcategoriesTab = () => {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [formData, setFormData] = useState({
    category_id: '',
    name_english: '',
    name_malayalam: '',
    description: '',
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('categories')
        .select('id, name_english, name_malayalam')
        .eq('is_active', true)
        .order('name_english');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const fetchSubcategories = async () => {
    try {
      const { data, error } = await (supabase as any)
        .from('subcategories')
        .select('*')
        .order('category_id')
        .order('display_order');

      if (error) throw error;
      setSubcategories(data || []);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      toast.error('Failed to load subcategories');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      category_id: '',
      name_english: '',
      name_malayalam: '',
      description: '',
      display_order: 0,
      is_active: true,
    });
    setEditingSubcategory(null);
  };

  const handleAddNew = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleEdit = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setFormData({
      category_id: subcategory.category_id,
      name_english: subcategory.name_english,
      name_malayalam: subcategory.name_malayalam,
      description: subcategory.description || '',
      display_order: subcategory.display_order,
      is_active: subcategory.is_active,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category_id || !formData.name_english || !formData.name_malayalam) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingSubcategory) {
        const { error } = await (supabase as any)
          .from('subcategories')
          .update(formData)
          .eq('id', editingSubcategory.id);

        if (error) throw error;
        toast.success('Subcategory updated successfully');
      } else {
        const { error } = await (supabase as any)
          .from('subcategories')
          .insert([formData]);

        if (error) throw error;
        toast.success('Subcategory created successfully');
      }

      setDialogOpen(false);
      resetForm();
      fetchSubcategories();
    } catch (error) {
      console.error('Error saving subcategory:', error);
      toast.error('Failed to save subcategory');
    }
  };

  const toggleSubcategoryStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await (supabase as any)
        .from('subcategories')
        .update({ is_active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      toast.success('Subcategory status updated');
      fetchSubcategories();
    } catch (error) {
      console.error('Error updating subcategory status:', error);
      toast.error('Failed to update subcategory status');
    }
  };

  const deleteSubcategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this subcategory?')) return;

    try {
      const { error } = await (supabase as any)
        .from('subcategories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Subcategory deleted successfully');
      fetchSubcategories();
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      toast.error('Failed to delete subcategory');
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name_english || 'Unknown Category';
  };

  const groupedSubcategories = subcategories.reduce((acc, subcategory) => {
    const categoryId = subcategory.category_id;
    if (!acc[categoryId]) {
      acc[categoryId] = [];
    }
    acc[categoryId].push(subcategory);
    return acc;
  }, {} as Record<string, Subcategory[]>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Subcategories</CardTitle>
              <CardDescription>Manage subcategories under job categories</CardDescription>
            </div>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" />
              Add Subcategory
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-muted-foreground">Loading subcategories...</p>
          ) : Object.keys(groupedSubcategories).length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No subcategories added yet.</p>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedSubcategories).map(([categoryId, categorySubcategories]) => (
                <div key={categoryId} className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">{getCategoryName(categoryId)}</h3>
                  <div className="space-y-2">
                    {categorySubcategories.map((subcategory) => (
                      <div
                        key={subcategory.id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium">{subcategory.name_english}</p>
                          <p className="text-sm text-muted-foreground">{subcategory.name_malayalam}</p>
                          {subcategory.description && (
                            <p className="text-xs text-muted-foreground mt-1">{subcategory.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={subcategory.is_active}
                            onCheckedChange={() => toggleSubcategoryStatus(subcategory.id, subcategory.is_active)}
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(subcategory)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => deleteSubcategory(subcategory.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingSubcategory ? 'Edit Subcategory' : 'Add New Subcategory'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name_english}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="name_english">English Name *</Label>
              <Input
                id="name_english"
                value={formData.name_english}
                onChange={(e) => setFormData({ ...formData, name_english: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="name_malayalam">Malayalam Name *</Label>
              <Input
                id="name_malayalam"
                value={formData.name_malayalam}
                onChange={(e) => setFormData({ ...formData, name_malayalam: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                {editingSubcategory ? 'Update' : 'Create'} Subcategory
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubcategoriesTab;
