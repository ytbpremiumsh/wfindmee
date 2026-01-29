import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Link, 
  Copy, 
  Trash2, 
  Edit, 
  BarChart3,
  ExternalLink,
  Monitor,
  Smartphone,
  Tablet,
  Globe
} from 'lucide-react';
import { 
  useShortlinks, 
  useCreateShortlink, 
  useUpdateShortlink, 
  useDeleteShortlink,
  useShortlinkClicks,
  Shortlink 
} from '@/hooks/useShortlinks';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

const AdminShortlinks = () => {
  const { data: shortlinks, isLoading } = useShortlinks();
  const createShortlink = useCreateShortlink();
  const updateShortlink = useUpdateShortlink();
  const deleteShortlink = useDeleteShortlink();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAnalyticsDialogOpen, setIsAnalyticsDialogOpen] = useState(false);
  const [selectedShortlink, setSelectedShortlink] = useState<Shortlink | null>(null);
  const [formData, setFormData] = useState({
    short_code: '',
    target_url: '',
    title: '',
    is_active: true,
  });

  const baseUrl = window.location.origin;

  const resetForm = () => {
    setFormData({
      short_code: '',
      target_url: '',
      title: '',
      is_active: true,
    });
    setSelectedShortlink(null);
  };

  const handleOpenDialog = (shortlink?: Shortlink) => {
    if (shortlink) {
      setSelectedShortlink(shortlink);
      setFormData({
        short_code: shortlink.short_code,
        target_url: shortlink.target_url,
        title: shortlink.title || '',
        is_active: shortlink.is_active,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedShortlink) {
      await updateShortlink.mutateAsync({
        id: selectedShortlink.id,
        ...formData,
      });
    } else {
      await createShortlink.mutateAsync(formData as any);
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (selectedShortlink) {
      await deleteShortlink.mutateAsync(selectedShortlink.id);
      setIsDeleteDialogOpen(false);
      setSelectedShortlink(null);
    }
  };

  const copyToClipboard = (shortCode: string) => {
    navigator.clipboard.writeText(`${baseUrl}/${shortCode}`);
    toast({ title: 'Link berhasil disalin!' });
  };

  const generateShortCode = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, short_code: code }));
  };

  return (
    <AdminLayout title="Shortlinks">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Link className="h-6 w-6" />
              Shortlinks
            </h1>
            <p className="text-muted-foreground">
              Kelola shortlinks dan lihat analitik klik
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Buat Shortlink
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {selectedShortlink ? 'Edit Shortlink' : 'Buat Shortlink Baru'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Judul (opsional)</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Nama untuk identifikasi"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target_url">URL Tujuan</Label>
                  <Input
                    id="target_url"
                    type="url"
                    required
                    value={formData.target_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, target_url: e.target.value }))}
                    placeholder="https://example.com/halaman-panjang"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="short_code">Kode Pendek</Label>
                  <div className="flex gap-2">
                    <Input
                      id="short_code"
                      required
                      value={formData.short_code}
                      onChange={(e) => setFormData(prev => ({ ...prev, short_code: e.target.value }))}
                      placeholder="abc123"
                    />
                    <Button type="button" variant="outline" onClick={generateShortCode}>
                      Generate
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    URL: {baseUrl}/{formData.short_code || '...'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active">Aktif</Label>
                </div>
                <Button type="submit" className="w-full">
                  {selectedShortlink ? 'Update' : 'Buat'} Shortlink
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Table */}
        <div className="bg-card rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Judul</TableHead>
                <TableHead>Short URL</TableHead>
                <TableHead>Tujuan</TableHead>
                <TableHead className="text-center">Klik</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Dibuat</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 mx-auto" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : shortlinks?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Belum ada shortlink. Buat shortlink pertama Anda!
                  </TableCell>
                </TableRow>
              ) : (
                shortlinks?.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell className="font-medium">
                      {link.title || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          /{link.short_code}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(link.short_code)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      <a 
                        href={link.target_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        {link.target_url}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{link.click_count}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={link.is_active ? 'default' : 'outline'}>
                        {link.is_active ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(link.created_at), { 
                        addSuffix: true, 
                        locale: localeId 
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedShortlink(link);
                            setIsAnalyticsDialogOpen(true);
                          }}
                        >
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(link)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedShortlink(link);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Delete Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Shortlink?</AlertDialogTitle>
              <AlertDialogDescription>
                Shortlink "{selectedShortlink?.title || selectedShortlink?.short_code}" akan dihapus permanen beserta semua data klik-nya.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Hapus</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Analytics Dialog */}
        <ShortlinkAnalyticsDialog 
          shortlink={selectedShortlink}
          open={isAnalyticsDialogOpen}
          onOpenChange={setIsAnalyticsDialogOpen}
        />
      </div>
    </AdminLayout>
  );
};

// Analytics Dialog Component
function ShortlinkAnalyticsDialog({ 
  shortlink, 
  open, 
  onOpenChange 
}: { 
  shortlink: Shortlink | null; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const { data: clicks, isLoading } = useShortlinkClicks(shortlink?.id);

  if (!shortlink) return null;

  const deviceStats = clicks?.reduce((acc, click) => {
    const device = click.device_type || 'Unknown';
    acc[device] = (acc[device] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const browserStats = clicks?.reduce((acc, click) => {
    const browser = click.browser || 'Unknown';
    acc[browser] = (acc[browser] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'Mobile': return <Smartphone className="h-4 w-4" />;
      case 'Tablet': return <Tablet className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analitik: {shortlink.title || shortlink.short_code}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-secondary/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">{shortlink.click_count}</div>
              <div className="text-sm text-muted-foreground">Total Klik</div>
            </div>
            <div className="bg-secondary/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">{Object.keys(deviceStats).length}</div>
              <div className="text-sm text-muted-foreground">Jenis Device</div>
            </div>
            <div className="bg-secondary/50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">{Object.keys(browserStats).length}</div>
              <div className="text-sm text-muted-foreground">Jenis Browser</div>
            </div>
          </div>

          {/* Device & Browser Stats */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Device</h3>
              <div className="space-y-2">
                {Object.entries(deviceStats).map(([device, count]) => (
                  <div key={device} className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {getDeviceIcon(device)}
                      {device}
                    </span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
                {Object.keys(deviceStats).length === 0 && (
                  <p className="text-muted-foreground text-sm">Belum ada data</p>
                )}
              </div>
            </div>
            <div className="bg-card border rounded-lg p-4">
              <h3 className="font-semibold mb-3">Browser</h3>
              <div className="space-y-2">
                {Object.entries(browserStats).map(([browser, count]) => (
                  <div key={browser} className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      {browser}
                    </span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
                {Object.keys(browserStats).length === 0 && (
                  <p className="text-muted-foreground text-sm">Belum ada data</p>
                )}
              </div>
            </div>
          </div>

          {/* Click History */}
          <div>
            <h3 className="font-semibold mb-3">Riwayat Klik Terbaru</h3>
            <div className="bg-card border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Browser</TableHead>
                    <TableHead>OS</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array(3).fill(0).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      </TableRow>
                    ))
                  ) : clicks?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Belum ada klik tercatat
                      </TableCell>
                    </TableRow>
                  ) : (
                    clicks?.slice(0, 20).map((click) => (
                      <TableRow key={click.id}>
                        <TableCell className="text-sm">
                          {formatDistanceToNow(new Date(click.clicked_at), { 
                            addSuffix: true, 
                            locale: localeId 
                          })}
                        </TableCell>
                        <TableCell>
                          <span className="flex items-center gap-1">
                            {getDeviceIcon(click.device_type || 'Unknown')}
                            {click.device_type || '-'}
                          </span>
                        </TableCell>
                        <TableCell>{click.browser || '-'}</TableCell>
                        <TableCell>{click.os || '-'}</TableCell>
                        <TableCell className="font-mono text-xs">
                          {click.ip_address || '-'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AdminShortlinks;
