import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Edit, Trash2, Eye, Loader2, ListOrdered, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuizzes, useDeleteQuiz } from '@/hooks/useQuizzes';
import { QuizEditorDialog } from '@/components/admin/QuizEditorDialog';
import { Skeleton } from '@/components/ui/skeleton';
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

const categoryLabels: Record<string, string> = {
  kepribadian: 'Kepribadian',
  fun: 'Fun',
  mbti: 'MBTI',
  karir: 'Karir',
  hubungan: 'Hubungan',
  kesehatan: 'Kesehatan',
  lainnya: 'Lainnya',
};

const AdminQuizzes = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  const [deleteQuizId, setDeleteQuizId] = useState<string | null>(null);
  
  const { data: quizzes, isLoading } = useQuizzes();
  const deleteQuiz = useDeleteQuiz();
  
  const filteredQuizzes = quizzes?.filter(quiz => 
    quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) ?? [];

  const handleCreateQuiz = () => {
    setEditingQuizId(null);
    setIsEditorOpen(true);
  };

  const handleEditQuiz = (quizId: string) => {
    setEditingQuizId(quizId);
    setIsEditorOpen(true);
  };

  const handleDeleteQuiz = () => {
    if (deleteQuizId) {
      deleteQuiz.mutate(deleteQuizId);
      setDeleteQuizId(null);
    }
  };

  return (
    <AdminLayout title="Kelola Quiz">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari quiz..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="hero" className="gap-2" onClick={handleCreateQuiz}>
          <Plus className="h-4 w-4" />
          Buat Quiz Baru
        </Button>
      </div>

      {/* Quiz Table */}
      <div className="bg-card rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Quiz</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Kategori</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Waktu</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="border-b border-border">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-12 h-12 rounded-lg" />
                        <div>
                          <Skeleton className="h-4 w-32 mb-1" />
                          <Skeleton className="h-3 w-48" />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <Skeleton className="h-6 w-20" />
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-6 w-20" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                        <Skeleton className="h-8 w-8" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : filteredQuizzes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    {searchQuery ? 'Tidak ada quiz yang ditemukan.' : 'Belum ada quiz. Buat quiz pertama Anda!'}
                  </td>
                </tr>
              ) : (
                filteredQuizzes.map((quiz) => (
                  <tr key={quiz.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {quiz.thumbnail_url ? (
                          <img 
                            src={quiz.thumbnail_url} 
                            alt={quiz.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                            <Eye className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-medium line-clamp-1">{quiz.title}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {quiz.short_description || 'Tidak ada deskripsi'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className={cn("category-badge", `category-badge-${quiz.category}`)}>
                        {categoryLabels[quiz.category ?? 'lainnya']}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <span className="text-sm">{quiz.estimated_time ?? 5} menit</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium",
                        quiz.status === 'published' 
                          ? "bg-primary/10 text-primary" 
                          : "bg-muted text-muted-foreground"
                      )}>
                        {quiz.status === 'published' ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          title="Lihat Pertanyaan"
                          onClick={() => navigate(`/admin/quizzes/${quiz.id}/questions`)}
                        >
                          <ListOrdered className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          title="Lihat Hasil"
                          onClick={() => navigate(`/admin/quizzes/${quiz.id}/results`)}
                        >
                          <Target className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => window.open(`/quiz/${quiz.id}`, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleEditQuiz(quiz.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteQuizId(quiz.id)}
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

      {/* Quiz Editor Dialog */}
      <QuizEditorDialog
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        quizId={editingQuizId}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteQuizId} onOpenChange={() => setDeleteQuizId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini tidak dapat dibatalkan. Quiz beserta semua pertanyaan dan hasil akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteQuiz}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteQuiz.isPending ? (
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

export default AdminQuizzes;
