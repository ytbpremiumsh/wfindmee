import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2 } from 'lucide-react';
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
import { useQuiz, useCreateQuiz, useUpdateQuiz } from '@/hooks/useQuizzes';
import { useAuth } from '@/contexts/AuthContext';

interface QuizEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quizId: string | null;
}

const categories = [
  { value: 'kepribadian', label: 'Kepribadian' },
  { value: 'fun', label: 'Fun' },
  { value: 'mbti', label: 'MBTI' },
  { value: 'karir', label: 'Karir' },
  { value: 'hubungan', label: 'Hubungan' },
  { value: 'kesehatan', label: 'Kesehatan' },
  { value: 'lainnya', label: 'Lainnya' },
];

export function QuizEditorDialog({ open, onOpenChange, quizId }: QuizEditorDialogProps) {
  const { user } = useAuth();
  const { data: quiz, isLoading } = useQuiz(quizId ?? undefined);
  const createQuiz = useCreateQuiz();
  const updateQuiz = useUpdateQuiz();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    short_description: '',
    thumbnail_url: '',
    banner_url: '',
    category: 'kepribadian' as string,
    status: 'draft' as 'draft' | 'published',
    estimated_time: 5,
    is_featured: false,
    is_iframe: false,
    iframe_url: '',
  });

  useEffect(() => {
    if (quiz) {
      setFormData({
        title: quiz.title,
        description: quiz.description ?? '',
        short_description: quiz.short_description ?? '',
        thumbnail_url: quiz.thumbnail_url ?? '',
        banner_url: quiz.banner_url ?? '',
        category: quiz.category ?? 'kepribadian',
        status: quiz.status ?? 'draft',
        estimated_time: quiz.estimated_time ?? 5,
        is_featured: quiz.is_featured ?? false,
        is_iframe: quiz.is_iframe ?? false,
        iframe_url: quiz.iframe_url ?? '',
      });
    } else if (!quizId) {
      setFormData({
        title: '',
        description: '',
        short_description: '',
        thumbnail_url: '',
        banner_url: '',
        category: 'kepribadian',
        status: 'draft',
        estimated_time: 5,
        is_featured: false,
        is_iframe: false,
        iframe_url: '',
      });
    }
  }, [quiz, quizId]);

  const handleSave = () => {
    if (quizId) {
      updateQuiz.mutate({
        id: quizId,
        ...formData,
        category: formData.category as any,
      }, {
        onSuccess: () => onOpenChange(false),
      });
    } else {
      createQuiz.mutate({
        ...formData,
        category: formData.category as any,
        created_by: user?.id,
      }, {
        onSuccess: () => onOpenChange(false),
      });
    }
  };

  const isSaving = createQuiz.isPending || updateQuiz.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{quizId ? 'Edit Quiz' : 'Buat Quiz Baru'}</DialogTitle>
        </DialogHeader>

        {isLoading && quizId ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Judul Quiz *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Contoh: Tes Kepribadian MBTI"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="short_description">Deskripsi Singkat</Label>
              <Input
                id="short_description"
                value={formData.short_description}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                placeholder="Deskripsi singkat untuk card"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi Lengkap</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi lengkap quiz"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Kategori</Label>
                <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimated_time">Waktu (menit)</Label>
                <Input
                  id="estimated_time"
                  type="number"
                  value={formData.estimated_time}
                  onChange={(e) => setFormData({ ...formData, estimated_time: parseInt(e.target.value) || 5 })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="thumbnail_url">URL Thumbnail</Label>
                <Input
                  id="thumbnail_url"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="banner_url">URL Banner</Label>
                <Input
                  id="banner_url"
                  value={formData.banner_url}
                  onChange={(e) => setFormData({ ...formData, banner_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                />
                <Label htmlFor="is_featured">Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="status"
                  checked={formData.status === 'published'}
                  onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? 'published' : 'draft' })}
                />
                <Label htmlFor="status">Published</Label>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is_iframe"
                checked={formData.is_iframe}
                onCheckedChange={(checked) => setFormData({ ...formData, is_iframe: checked })}
              />
              <Label htmlFor="is_iframe">Quiz via iFrame</Label>
            </div>

            {formData.is_iframe && (
              <div className="space-y-2">
                <Label htmlFor="iframe_url">iFrame URL</Label>
                <Input
                  id="iframe_url"
                  value={formData.iframe_url}
                  onChange={(e) => setFormData({ ...formData, iframe_url: e.target.value })}
                  placeholder="https://embed.example.com/quiz"
                />
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={handleSave} disabled={isSaving || !formData.title}>
            {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {quizId ? 'Simpan' : 'Buat Quiz'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
