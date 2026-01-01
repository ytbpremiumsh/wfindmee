import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, Eye, Loader2, FileText } from 'lucide-react';
import { useArticles, useCreateArticle, useUpdateArticle, useDeleteArticle } from '@/hooks/useArticles';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
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

const categories = ['umum', 'tips', 'psikologi', 'karir', 'lifestyle', 'hubungan'];

const AdminArticles = () => {
  const { user } = useAuth();
  const { data: articles, isLoading } = useArticles();
  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();
  const deleteArticle = useDeleteArticle();

  const [editorOpen, setEditorOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    thumbnail_url: '',
    banner_url: '',
    category: 'umum',
    status: 'draft' as 'draft' | 'published',
    is_featured: false,
  });

  const handleNew = () => {
    setEditingId(null);
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      thumbnail_url: '',
      banner_url: '',
      category: 'umum',
      status: 'draft',
      is_featured: false,
    });
    setEditorOpen(true);
  };

  const handleEdit = (article: any) => {
    setEditingId(article.id);
    setFormData({
      title: article.title,
      slug: article.slug,
      excerpt: article.excerpt || '',
      content: article.content || '',
      thumbnail_url: article.thumbnail_url || '',
      banner_url: article.banner_url || '',
      category: article.category || 'umum',
      status: article.status || 'draft',
      is_featured: article.is_featured || false,
    });
    setEditorOpen(true);
  };

  const handleSave = () => {
    const slug = formData.slug || formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    if (editingId) {
      updateArticle.mutate({ id: editingId, ...formData, slug }, {
        onSuccess: () => setEditorOpen(false),
      });
    } else {
      createArticle.mutate({ ...formData, slug, created_by: user?.id }, {
        onSuccess: () => setEditorOpen(false),
      });
    }
  };

  const handleDelete = () => {
    if (deletingId) {
      deleteArticle.mutate(deletingId, {
        onSuccess: () => setDeleteDialogOpen(false),
      });
    }
  };

  const isSaving = createArticle.isPending || updateArticle.isPending;

  return (
    <AdminLayout title="Kelola Artikel">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">
            {articles?.length || 0} artikel
          </p>
          <Button onClick={handleNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Buat Artikel Baru
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
        ) : articles?.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-2xl">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Belum ada artikel</h3>
            <p className="text-muted-foreground mb-4">Buat artikel pertama Anda</p>
            <Button onClick={handleNew}>
              <Plus className="h-4 w-4 mr-2" />
              Buat Artikel
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {articles?.map(article => (
              <div key={article.id} className="bg-card rounded-xl p-4 flex items-center gap-4">
                {article.thumbnail_url ? (
                  <img 
                    src={article.thumbnail_url} 
                    alt={article.title}
                    className="w-20 h-20 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center">
                    <FileText className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold truncate">{article.title}</h3>
                    <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                      {article.status}
                    </Badge>
                    {article.is_featured && (
                      <Badge variant="outline">Featured</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {article.excerpt || 'Tidak ada ringkasan'}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{article.category}</span>
                    <span>{article.views_count || 0} views</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(article)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => { setDeletingId(article.id); setDeleteDialogOpen(true); }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Editor Dialog */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Artikel' : 'Buat Artikel Baru'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Judul *</Label>
              <Input
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="Judul artikel"
              />
            </div>

            <div className="space-y-2">
              <Label>Slug (URL)</Label>
              <Input
                value={formData.slug}
                onChange={e => setFormData({ ...formData, slug: e.target.value })}
                placeholder="url-artikel (otomatis dari judul)"
              />
            </div>

            <div className="space-y-2">
              <Label>Ringkasan</Label>
              <Textarea
                value={formData.excerpt}
                onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Ringkasan singkat artikel"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Konten</Label>
              <Textarea
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
                placeholder="Isi artikel lengkap (mendukung Markdown)"
                rows={10}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>URL Thumbnail</Label>
                <Input
                  value={formData.thumbnail_url}
                  onChange={e => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_featured}
                  onCheckedChange={checked => setFormData({ ...formData, is_featured: checked })}
                />
                <Label>Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.status === 'published'}
                  onCheckedChange={checked => setFormData({ ...formData, status: checked ? 'published' : 'draft' })}
                />
                <Label>Published</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditorOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={isSaving || !formData.title}>
              {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingId ? 'Simpan' : 'Buat Artikel'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Artikel?</AlertDialogTitle>
            <AlertDialogDescription>
              Artikel ini akan dihapus permanen dan tidak dapat dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminArticles;
