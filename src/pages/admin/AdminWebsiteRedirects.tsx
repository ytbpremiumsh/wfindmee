import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Loader2, 
  Globe,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useWebsiteRedirects,
  useCreateWebsiteRedirect,
  useUpdateWebsiteRedirect,
  useDeleteWebsiteRedirect,
  WebsiteRedirect,
} from '@/hooks/useWebsiteRedirects';
import { Skeleton } from '@/components/ui/skeleton';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const AdminWebsiteRedirects = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRedirect, setEditingRedirect] = useState<WebsiteRedirect | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const { data: redirects, isLoading } = useWebsiteRedirects();
  const createRedirect = useCreateWebsiteRedirect();
  const updateRedirect = useUpdateWebsiteRedirect();
  const deleteRedirect = useDeleteWebsiteRedirect();

  const [formData, setFormData] = useState({
    name: '',
    source_domain: '',
    target_url: '',
    redirect_type: 'permanent',
    is_active: true,
  });

  const filteredRedirects = redirects?.filter(redirect =>
    redirect.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    redirect.source_domain.toLowerCase().includes(searchQuery.toLowerCase())
  ) ?? [];

  const handleOpenCreate = () => {
    setEditingRedirect(null);
    setFormData({
      name: '',
      source_domain: '',
      target_url: '',
      redirect_type: 'permanent',
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (redirect: WebsiteRedirect) => {
    setEditingRedirect(redirect);
    setFormData({
      name: redirect.name,
      source_domain: redirect.source_domain,
      target_url: redirect.target_url,
      redirect_type: redirect.redirect_type,
      is_active: redirect.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.source_domain || !formData.target_url) {
      toast({
        title: 'Data tidak lengkap',
        description: 'Nama, domain sumber, dan URL tujuan wajib diisi.',
        variant: 'destructive',
      });
      return;
    }

    if (editingRedirect) {
      updateRedirect.mutate({
        id: editingRedirect.id,
        ...formData,
      }, {
        onSuccess: () => setIsDialogOpen(false),
      });
    } else {
      createRedirect.mutate({
        ...formData,
        created_by: user?.id || null,
      }, {
        onSuccess: () => setIsDialogOpen(false),
      });
    }
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteRedirect.mutate(deleteId);
      setDeleteId(null);
    }
  };

  const copyDomain = (domain: string) => {
    navigator.clipboard.writeText(domain);
    setCopiedId(domain);
    toast({ title: 'Domain disalin' });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isSaving = createRedirect.isPending || updateRedirect.isPending;

  return (
    <AdminLayout title="Website Redirects">
      {/* Info Banner */}
      <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mb-6">
        <div className="flex gap-3">
          <Globe className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-sm mb-1">Redirect Antar Website</h3>
            <p className="text-sm text-muted-foreground">
              Atur redirect otomatis dari satu domain ke domain lain. Cocok jika Anda memiliki beberapa domain 
              yang perlu mengarah ke website utama atau halaman tertentu.
            </p>
          </div>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari redirect..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="hero" className="gap-2" onClick={handleOpenCreate}>
          <Plus className="h-4 w-4" />
          Tambah Redirect
        </Button>
      </div>

      {/* Redirects Table */}
      <div className="bg-card rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Nama</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Domain Sumber</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground hidden md:table-cell">URL Tujuan</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Tipe</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <tr key={index} className="border-b border-border">
                    <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-40" /></td>
                    <td className="px-6 py-4 hidden md:table-cell"><Skeleton className="h-4 w-48" /></td>
                    <td className="px-6 py-4 hidden lg:table-cell"><Skeleton className="h-6 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-6 w-16" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-8 w-24 ml-auto" /></td>
                  </tr>
                ))
              ) : filteredRedirects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    {searchQuery ? 'Tidak ada redirect yang ditemukan.' : 'Belum ada website redirect. Tambahkan yang pertama!'}
                  </td>
                </tr>
              ) : (
                filteredRedirects.map((redirect) => (
                  <tr key={redirect.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-medium">{redirect.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {redirect.source_domain}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => copyDomain(redirect.source_domain)}
                        >
                          {copiedId === redirect.source_domain ? (
                            <Check className="h-3 w-3 text-primary" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {redirect.target_url}
                        </span>
                        <a
                          href={redirect.target_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                        redirect.redirect_type === 'permanent' 
                          ? "bg-blue-100 text-blue-700" 
                          : "bg-orange-100 text-orange-700"
                      )}>
                        {redirect.redirect_type === 'permanent' ? '301 Permanent' : '302 Temporary'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                        redirect.is_active 
                          ? "bg-primary/10 text-primary" 
                          : "bg-muted text-muted-foreground"
                      )}>
                        {redirect.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleOpenEdit(redirect)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteId(redirect.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRedirect ? 'Edit Redirect' : 'Tambah Website Redirect'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="contoh: Website Lama"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source_domain">Domain Sumber *</Label>
              <Input
                id="source_domain"
                value={formData.source_domain}
                onChange={(e) => setFormData({ ...formData, source_domain: e.target.value })}
                placeholder="contoh: oldsite.com"
              />
              <p className="text-xs text-muted-foreground">
                Domain yang akan di-redirect (tanpa http/https)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target_url">URL Tujuan *</Label>
              <Input
                id="target_url"
                value={formData.target_url}
                onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
                placeholder="contoh: https://newsite.com"
              />
              <p className="text-xs text-muted-foreground">
                URL lengkap tujuan redirect
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="redirect_type">Tipe Redirect</Label>
              <Select 
                value={formData.redirect_type} 
                onValueChange={(v) => setFormData({ ...formData, redirect_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="permanent">301 - Permanent Redirect</SelectItem>
                  <SelectItem value="temporary">302 - Temporary Redirect</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Aktif</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingRedirect ? 'Simpan' : 'Tambah'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Redirect?</AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini tidak dapat dibatalkan. Redirect akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteRedirect.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Hapus'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminWebsiteRedirects;
