import { useState } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { useAdminCategories } from '@/hooks/useAdminCategories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Pencil, Trash2, Loader2, Tags } from 'lucide-react';

export default function AdminCategoriesPage() {
  const { categories, isLoading, createCategory, updateCategory, deleteCategory } = useAdminCategories();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<{ id: string; name: string } | null>(null);
  const [categoryName, setCategoryName] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingCategory(null);
    setCategoryName('');
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (category: { id: string; name: string }) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setIsDialogOpen(true);
  };

  const handleOpenDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!categoryName.trim()) return;

    if (editingCategory) {
      await updateCategory.mutateAsync({ id: editingCategory.id, name: categoryName.trim() });
    } else {
      await createCategory.mutateAsync(categoryName.trim());
    }
    
    setIsDialogOpen(false);
    setCategoryName('');
    setEditingCategory(null);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    await deleteCategory.mutateAsync(deletingId);
    setIsDeleteDialogOpen(false);
    setDeletingId(null);
  };

  const isPending = createCategory.isPending || updateCategory.isPending;

  return (
    <AdminLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Kategori</h1>
            <p className="text-sm text-muted-foreground">Kelola kategori produk toko</p>
          </div>
          <Button onClick={handleOpenCreate} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Tambah
          </Button>
        </div>

        {/* Categories List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : categories.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Tags className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-center">
                Belum ada kategori.<br />
                Tambah kategori pertama untuk mengorganisir produk.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {categories.map((category) => (
              <Card key={category.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Tags className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleOpenEdit(category)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleOpenDelete(category.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? 'Edit Kategori' : 'Tambah Kategori'}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Nama kategori"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSubmit} disabled={isPending || !categoryName.trim()}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingCategory ? 'Simpan' : 'Tambah'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kategori?</AlertDialogTitle>
            <AlertDialogDescription>
              Kategori yang dihapus tidak dapat dikembalikan. Produk dengan kategori ini akan menjadi tanpa kategori.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteCategory.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
