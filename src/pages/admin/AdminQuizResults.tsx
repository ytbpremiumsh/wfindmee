import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  Loader2,
  X
} from 'lucide-react';
import { useQuiz } from '@/hooks/useQuizzes';
import { useQuizResults } from '@/hooks/useQuizResults';
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface ResultForm {
  personality_type: string;
  title: string;
  description: string;
  strengths: string[];
  weaknesses: string[];
  min_score: number;
  max_score: number;
  image_url: string;
}

const AdminQuizResults = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const { data: quiz, isLoading: isQuizLoading } = useQuiz(quizId);
  const { data: results, isLoading: isResultsLoading } = useQuizResults(quizId);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<any>(null);
  const [deleteResultId, setDeleteResultId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [formData, setFormData] = useState<ResultForm>({
    personality_type: '',
    title: '',
    description: '',
    strengths: ['', '', ''],
    weaknesses: ['', '', ''],
    min_score: 0,
    max_score: 100,
    image_url: '',
  });

  const isLoading = isQuizLoading || isResultsLoading;

  const handleAddResult = () => {
    setEditingResult(null);
    setFormData({
      personality_type: `type${(results?.length ?? 0) + 1}`,
      title: '',
      description: '',
      strengths: ['', '', ''],
      weaknesses: ['', '', ''],
      min_score: 0,
      max_score: 100,
      image_url: '',
    });
    setIsEditorOpen(true);
  };

  const handleEditResult = (result: any) => {
    setEditingResult(result);
    setFormData({
      personality_type: result.personality_type,
      title: result.title,
      description: result.description || '',
      strengths: result.strengths?.length ? result.strengths : ['', '', ''],
      weaknesses: result.weaknesses?.length ? result.weaknesses : ['', '', ''],
      min_score: result.min_score || 0,
      max_score: result.max_score || 100,
      image_url: result.image_url || '',
    });
    setIsEditorOpen(true);
  };

  const handleDeleteResult = async () => {
    if (!deleteResultId) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('quiz_results')
        .delete()
        .eq('id', deleteResultId);
      
      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['quiz_results', quizId] });
      toast({
        title: 'Berhasil!',
        description: 'Hasil quiz berhasil dihapus.',
      });
    } catch (error: any) {
      toast({
        title: 'Gagal menghapus',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setDeleteResultId(null);
    }
  };

  const handleStrengthChange = (index: number, value: string) => {
    const newStrengths = [...formData.strengths];
    newStrengths[index] = value;
    setFormData({ ...formData, strengths: newStrengths });
  };

  const handleWeaknessChange = (index: number, value: string) => {
    const newWeaknesses = [...formData.weaknesses];
    newWeaknesses[index] = value;
    setFormData({ ...formData, weaknesses: newWeaknesses });
  };

  const handleAddStrength = () => {
    setFormData({ ...formData, strengths: [...formData.strengths, ''] });
  };

  const handleAddWeakness = () => {
    setFormData({ ...formData, weaknesses: [...formData.weaknesses, ''] });
  };

  const handleRemoveStrength = (index: number) => {
    const newStrengths = formData.strengths.filter((_, i) => i !== index);
    setFormData({ ...formData, strengths: newStrengths });
  };

  const handleRemoveWeakness = (index: number) => {
    const newWeaknesses = formData.weaknesses.filter((_, i) => i !== index);
    setFormData({ ...formData, weaknesses: newWeaknesses });
  };

  const handleSaveResult = async () => {
    if (!quizId) return;
    
    if (!formData.personality_type.trim() || !formData.title.trim()) {
      toast({
        title: 'Data tidak lengkap',
        description: 'Tipe kepribadian dan judul wajib diisi.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const resultData = {
        quiz_id: quizId,
        personality_type: formData.personality_type,
        title: formData.title,
        description: formData.description,
        strengths: formData.strengths.filter(s => s.trim()),
        weaknesses: formData.weaknesses.filter(w => w.trim()),
        min_score: formData.min_score,
        max_score: formData.max_score,
        image_url: formData.image_url || null,
      };

      if (editingResult) {
        const { error } = await supabase
          .from('quiz_results')
          .update(resultData)
          .eq('id', editingResult.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('quiz_results')
          .insert(resultData);
        
        if (error) throw error;
      }

      queryClient.invalidateQueries({ queryKey: ['quiz_results', quizId] });
      setIsEditorOpen(false);
      toast({
        title: 'Berhasil!',
        description: editingResult ? 'Hasil quiz berhasil diperbarui.' : 'Hasil quiz berhasil ditambahkan.',
      });
    } catch (error: any) {
      toast({
        title: 'Gagal menyimpan',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout title={quiz?.title ? `Hasil: ${quiz.title}` : 'Kelola Hasil Quiz'}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/admin/quizzes')}
          className="gap-2 self-start"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Daftar Quiz
        </Button>
        <Button variant="hero" className="gap-2" onClick={handleAddResult}>
          <Plus className="h-4 w-4" />
          Tambah Hasil
        </Button>
      </div>

      {/* Quiz Info */}
      {isQuizLoading ? (
        <div className="bg-card rounded-2xl p-6 shadow-sm mb-6">
          <Skeleton className="h-6 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
      ) : quiz ? (
        <div className="bg-card rounded-2xl p-6 shadow-sm mb-6">
          <h2 className="text-xl font-semibold mb-2">{quiz.title}</h2>
          <p className="text-muted-foreground">{quiz.description || 'Tidak ada deskripsi'}</p>
          <div className="flex gap-4 mt-4 text-sm">
            <span className="text-muted-foreground">
              Total Tipe Hasil: <strong>{results?.length ?? 0}</strong>
            </span>
          </div>
        </div>
      ) : null}

      {/* Results List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isResultsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))
        ) : results?.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">Belum ada hasil/tipe kepribadian. Tambahkan yang pertama!</p>
              <Button onClick={handleAddResult} className="gap-2">
                <Plus className="h-4 w-4" />
                Tambah Hasil
              </Button>
            </CardContent>
          </Card>
        ) : (
          results?.map((result: any) => (
            <Card key={result.id} className="group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase tracking-wider">
                      {result.personality_type}
                    </span>
                    <CardTitle className="text-lg">{result.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleEditResult(result)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteResultId(result.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {result.description || 'Tidak ada deskripsi'}
                </p>
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>Skor: {result.min_score} - {result.max_score}</span>
                  <span>Kelebihan: {result.strengths?.length || 0}</span>
                  <span>Kekurangan: {result.weaknesses?.length || 0}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Result Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingResult ? 'Edit Hasil Quiz' : 'Tambah Hasil Quiz Baru'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="personality_type">Tipe Kepribadian *</Label>
                <Input
                  id="personality_type"
                  value={formData.personality_type}
                  onChange={(e) => setFormData({ ...formData, personality_type: e.target.value })}
                  placeholder="contoh: INTJ, type1, dll"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Judul Hasil *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="contoh: Si Pemikir"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi lengkap tentang tipe kepribadian ini..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="min_score">Skor Minimum</Label>
                <Input
                  id="min_score"
                  type="number"
                  value={formData.min_score}
                  onChange={(e) => setFormData({ ...formData, min_score: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_score">Skor Maksimum</Label>
                <Input
                  id="max_score"
                  type="number"
                  value={formData.max_score}
                  onChange={(e) => setFormData({ ...formData, max_score: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">URL Gambar (opsional)</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            {/* Strengths */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Kelebihan</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddStrength}>
                  <Plus className="h-4 w-4 mr-1" />
                  Tambah
                </Button>
              </div>
              {formData.strengths.map((strength, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={strength}
                    onChange={(e) => handleStrengthChange(index, e.target.value)}
                    placeholder={`Kelebihan ${index + 1}`}
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleRemoveStrength(index)}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Weaknesses */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Kekurangan</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddWeakness}>
                  <Plus className="h-4 w-4 mr-1" />
                  Tambah
                </Button>
              </div>
              {formData.weaknesses.map((weakness, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={weakness}
                    onChange={(e) => handleWeaknessChange(index, e.target.value)}
                    placeholder={`Kekurangan ${index + 1}`}
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleRemoveWeakness(index)}
                    className="shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditorOpen(false)}>Batal</Button>
            <Button onClick={handleSaveResult} disabled={isSaving} className="gap-2">
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              <Save className="h-4 w-4" />
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteResultId} onOpenChange={() => setDeleteResultId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Hasil Quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini tidak dapat dibatalkan. Tipe kepribadian ini akan dihapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteResult}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
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

export default AdminQuizResults;
