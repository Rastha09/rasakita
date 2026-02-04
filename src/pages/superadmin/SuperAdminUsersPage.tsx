import { useState } from 'react';
import { SuperAdminLayout } from '@/components/layouts/SuperAdminLayout';
import { useSuperAdmin, Profile, Store } from '@/hooks/useSuperAdmin';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Users, Pencil, Loader2, ShieldCheck, Store as StoreIcon, User, Plus, Trash2 } from 'lucide-react';
import { formatDateTime } from '@/lib/format-currency';

const roleLabels: Record<Profile['role'], string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin Toko',
  CUSTOMER: 'Customer',
};

const roleBadgeVariants: Record<Profile['role'], 'default' | 'secondary' | 'outline'> = {
  SUPER_ADMIN: 'default',
  ADMIN: 'secondary',
  CUSTOMER: 'outline',
};

export default function SuperAdminUsersPage() {
  const { 
    users, 
    usersLoading, 
    stores, 
    storeAdmins, 
    updateUserRole, 
    assignStoreAdmin, 
    removeStoreAdmin 
  } = useSuperAdmin();
  
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
  const [selectedRole, setSelectedRole] = useState<Profile['role']>('CUSTOMER');
  const [selectedStoreId, setSelectedStoreId] = useState<string>('');
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  // Find store admin entry for a user
  const getStoreAdminEntry = (userId: string) => {
    return storeAdmins.find(sa => sa.user_id === userId);
  };

  const handleOpenRoleEdit = (user: Profile) => {
    setEditingUser(user);
    setSelectedRole(user.role);
    setIsRoleDialogOpen(true);
  };

  const handleOpenAssign = () => {
    setSelectedUserId('');
    setSelectedStoreId('');
    setIsAssignDialogOpen(true);
  };

  const handleSubmitRole = async () => {
    if (!editingUser) return;

    await updateUserRole.mutateAsync({
      id: editingUser.id,
      role: selectedRole,
    });
    
    setIsRoleDialogOpen(false);
  };

  const handleAssignAdmin = async () => {
    if (!selectedUserId || !selectedStoreId) return;

    await assignStoreAdmin.mutateAsync({
      user_id: selectedUserId,
      store_id: selectedStoreId,
    });
    
    setIsAssignDialogOpen(false);
  };

  const handleRemoveAdmin = async (userId: string, storeId: string) => {
    await removeStoreAdmin.mutateAsync({ user_id: userId, store_id: storeId });
  };

  const getRoleIcon = (role: Profile['role']) => {
    switch (role) {
      case 'SUPER_ADMIN': return ShieldCheck;
      case 'ADMIN': return StoreIcon;
      default: return User;
    }
  };

  // Get users who are not yet store admins (for assignment dropdown)
  const availableUsers = users.filter(u => {
    const hasStoreAdmin = storeAdmins.some(sa => sa.user_id === u.id);
    return u.role !== 'SUPER_ADMIN' && !hasStoreAdmin;
  });

  return (
    <SuperAdminLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Kelola Users</h1>
            <p className="text-sm text-muted-foreground">Daftar semua pengguna di platform</p>
          </div>
          <Button onClick={handleOpenAssign} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Assign Admin
          </Button>
        </div>

        {/* Users Table */}
        {usersLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : users.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">Belum ada pengguna</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="hidden md:table-cell">Toko (Admin)</TableHead>
                  <TableHead className="hidden md:table-cell">Bergabung</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  const RoleIcon = getRoleIcon(user.role);
                  const storeAdminEntry = getStoreAdminEntry(user.id);
                  const isStoreAdmin = !!storeAdminEntry;
                  
                  return (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{user.full_name || 'Unnamed'}</p>
                            <p className="text-xs text-muted-foreground">{user.phone || '-'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Badge variant={roleBadgeVariants[user.role]} className="gap-1 w-fit">
                            <RoleIcon className="h-3 w-3" />
                            {roleLabels[user.role]}
                          </Badge>
                          {isStoreAdmin && (
                            <Badge variant="secondary" className="gap-1 w-fit">
                              <StoreIcon className="h-3 w-3" />
                              Store Admin
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {storeAdminEntry?.store?.name || '-'}
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">
                        {formatDateTime(user.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleOpenRoleEdit(user)}
                            title="Edit Role"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          {isStoreAdmin && storeAdminEntry && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleRemoveAdmin(user.id, storeAdminEntry.store_id)}
                              title="Hapus dari toko"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>

      {/* Edit Role Dialog */}
      <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ubah Role User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="font-medium">{editingUser?.full_name || 'Unnamed'}</p>
              <p className="text-sm text-muted-foreground">{editingUser?.phone || '-'}</p>
            </div>

            <div className="space-y-2">
              <Label>Role Global</Label>
              <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as Profile['role'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUSTOMER">Customer</SelectItem>
                  <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Untuk menjadikan Admin Toko, gunakan tombol "Assign Admin"
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
              Batal
            </Button>
            <Button 
              onClick={handleSubmitRole} 
              disabled={updateUserRole.isPending}
            >
              {updateUserRole.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Admin Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Admin ke Toko</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Pilih User</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih user" />
                </SelectTrigger>
                <SelectContent>
                  {availableUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name || 'Unnamed'} ({user.phone || '-'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Pilih Toko</Label>
              <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih toko" />
                </SelectTrigger>
                <SelectContent>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Batal
            </Button>
            <Button 
              onClick={handleAssignAdmin} 
              disabled={assignStoreAdmin.isPending || !selectedUserId || !selectedStoreId}
            >
              {assignStoreAdmin.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SuperAdminLayout>
  );
}
