import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, GripVertical, Edit, Trash2, Loader2, Image } from 'lucide-react';
import { useBanners, useCreateBanner, useUpdateBanner, useDeleteBanner } from '@/hooks/useBanners';
import { useQuizzes, useUpdateQuiz } from '@/hooks/useQuizzes';
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

interface BannerFormData {
  title: string;
  subtitle: string;
  image_url: string;
  link_url: string;
  is_active: boolean;
}

const AdminContent = () => {
  const { data: banners, isLoading: loadingBanners } = useBanners();
  const { data: quizzes, isLoading: loadingQuizzes } = useQuizzes();
  const createBanner = useCreateBanner();
  const updateBanner = useUpdateBanner();
  const deleteBanner = useDeleteBanner();
  const updateQuiz = useUpdateQuiz();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [deleteBannerId, setDeleteBannerId] = useState<string | null>(null);
  const [formData, setFormData] = useState<BannerFormData>({
    title: '',
    subtitle: '',
    image_url: '',
    link_url: '',
    is_active: true,
  });

  const featuredQuizzes = quizzes?.filter(q => q.is_featured) ?? [];

  const handleOpenDialog = (banner?: typeof banners extends (infer T)[] ? T : never) => {
    if (banner) {
      setEditingBannerId(banner.id);
      setFormData({
        title: banner.title,
        subtitle: banner.subtitle ?? '',
        image_url: banner.image_url ?? '',
        link_url: banner.link_url ?? '',
        is_active: banner.is_active ?? true,
      });
    } else {
      setEditingBannerId(null);
      setFormData({
        title: '',
        subtitle: '',
        image_url: '',
        link_url: '',
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveBanner = () => {
    if (editingBannerId) {
      updateBanner.mutate({
        id: editingBannerId,
        ...formData,
      }, {
        onSuccess: () => setIsDialogOpen(false),
      });
    } else {
      createBanner.mutate(formData, {
        onSuccess: () => setIsDialogOpen(false),
      });
    }
  };

  const handleDeleteBanner = () => {
    if (deleteBannerId) {
      deleteBanner.mutate(deleteBannerId, {
        onSuccess: () => setDeleteBannerId(null),
      });
    }
  };

  const handleToggleFeatured = (quizId: string, currentFeatured: boolean) => {
    updateQuiz.mutate({
      id: quizId,
      is_featured: !currentFeatured,
    });
  };

  const isSaving = createBanner.isPending || updateBanner.isPending;

  return (
    <AdminLayout title="Konten Home">
      <div className="space-y-8">
        {/* Banner Slider */}
        <section className="bg-card rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Banner Slider</h2>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4" />
              Tambah Banner
            </Button>
          </div>
          
          <div className="space-y-3">
            {loadingBanners ? (
              Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-xl border border-border bg-muted/30">
                  <Skeleton className="h-5 w-5" />
                  <Skeleton className="w-24 h-14 rounded-lg" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-8 w-16" />
                </div>
              ))
            ) : banners && banners.length > 0 ? (
              banners.map((banner) => (
                <div 
                  key={banner.id}
                  className="flex items-center gap-4 p-3 rounded-xl border border-border bg-muted/30"
                >
                  <button className="cursor-grab hover:bg-muted rounded p-1">
                    <GripVertical className="h-5 w-5 text-muted-foreground" />
                  </button>
                  {banner.image_url ? (
                    <img 
                      src={banner.image_url} 
                      alt={banner.title}
                      className="w-24 h-14 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-24 h-14 rounded-lg bg-muted flex items-center justify-center">
                      <Image className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="font-medium">{banner.title}</p>
                    {banner.subtitle && (
                      <p className="text-xs text-muted-foreground">{banner.subtitle}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      banner.is_active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                      {banner.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(banner)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteBannerId(banner.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Belum ada banner. Tambahkan banner untuk ditampilkan di halaman utama.
              </p>
            )}
          </div>
        </section>

        {/* Featured Quiz */}
        <section className="bg-card rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Quiz Pilihan (Featured)</h2>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            Pilih quiz mana yang ingin ditampilkan di bagian "Quiz Populer" pada halaman utama.
          </p>

          <div className="space-y-2">
            {loadingQuizzes ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-xl border border-border">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-6 w-10" />
                </div>
              ))
            ) : quizzes && quizzes.length > 0 ? (
              quizzes.filter(q => q.status === 'published').map((quiz) => (
                <div 
                  key={quiz.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-border hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {quiz.thumbnail_url ? (
                      <img 
                        src={quiz.thumbnail_url} 
                        alt={quiz.title}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <Image className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                    <span className="font-medium">{quiz.title}</span>
                  </div>
                  <Switch
                    checked={quiz.is_featured ?? false}
                    onCheckedChange={() => handleToggleFeatured(quiz.id, quiz.is_featured ?? false)}
                    disabled={updateQuiz.isPending}
                  />
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Belum ada quiz yang dipublish. Buat dan publish quiz terlebih dahulu.
              </p>
            )}
          </div>
        </section>
      </div>

      {/* Banner Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingBannerId ? 'Edit Banner' : 'Tambah Banner'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Judul</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Judul banner"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle (opsional)</Label>
              <Input
                id="subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Deskripsi singkat"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image_url">URL Gambar</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link_url">URL Link (opsional)</Label>
              <Input
                id="link_url"
                value={formData.link_url}
                onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                placeholder="https://example.com/quiz"
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Aktif</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSaveBanner} disabled={isSaving || !formData.title}>
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {editingBannerId ? 'Simpan' : 'Tambah'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteBannerId} onOpenChange={() => setDeleteBannerId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Banner?</AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini tidak dapat dibatalkan. Banner akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBanner}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteBanner.isPending ? (
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

export default AdminContent;
