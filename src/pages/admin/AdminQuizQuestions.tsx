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
  X,
  ImagePlus
} from 'lucide-react';
import { useQuiz } from '@/hooks/useQuizzes';
import { useQuizQuestions, useCreateQuestion, useUpdateQuestion, useDeleteQuestion } from '@/hooks/useQuizQuestions';
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
import { toast } from '@/hooks/use-toast';

interface QuestionOption {
  option_text: string;
  option_order: number;
  personality_scores: Record<string, number>;
}

interface QuestionForm {
  question_text: string;
  question_order: number;
  image_url: string;
  options: QuestionOption[];
}

const AdminQuizQuestions = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  
  const { data: quiz, isLoading: isQuizLoading } = useQuiz(quizId);
  const { data: questions, isLoading: isQuestionsLoading } = useQuizQuestions(quizId);
  const createQuestion = useCreateQuestion();
  const updateQuestion = useUpdateQuestion();
  const deleteQuestion = useDeleteQuestion();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<QuestionForm>({
    question_text: '',
    question_order: 1,
    image_url: '',
    options: [
      { option_text: '', option_order: 1, personality_scores: {} },
      { option_text: '', option_order: 2, personality_scores: {} },
      { option_text: '', option_order: 3, personality_scores: {} },
      { option_text: '', option_order: 4, personality_scores: {} },
    ],
  });

  const isLoading = isQuizLoading || isQuestionsLoading;

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setFormData({
      question_text: '',
      question_order: (questions?.length ?? 0) + 1,
      image_url: '',
      options: [
        { option_text: '', option_order: 1, personality_scores: {} },
        { option_text: '', option_order: 2, personality_scores: {} },
        { option_text: '', option_order: 3, personality_scores: {} },
        { option_text: '', option_order: 4, personality_scores: {} },
      ],
    });
    setIsEditorOpen(true);
  };

  const handleEditQuestion = (question: any) => {
    setEditingQuestion(question);
    setFormData({
      question_text: question.question_text,
      question_order: question.question_order || 1,
      image_url: question.image_url || '',
      options: question.quiz_options?.map((opt: any) => ({
        option_text: opt.option_text,
        option_order: opt.option_order || 1,
        personality_scores: opt.personality_scores || {},
      })) || [
        { option_text: '', option_order: 1, personality_scores: {} },
        { option_text: '', option_order: 2, personality_scores: {} },
      ],
    });
    setIsEditorOpen(true);
  };

  const handleDeleteQuestion = () => {
    if (deleteQuestionId && quizId) {
      deleteQuestion.mutate({ questionId: deleteQuestionId, quizId }, {
        onSuccess: () => {
          setDeleteQuestionId(null);
        },
      });
    }
  };

  const handleAddOption = () => {
    setFormData({
      ...formData,
      options: [
        ...formData.options,
        { option_text: '', option_order: formData.options.length + 1, personality_scores: {} },
      ],
    });
  };

  const handleRemoveOption = (index: number) => {
    if (formData.options.length <= 2) {
      toast({
        title: 'Minimal 2 pilihan',
        description: 'Setiap pertanyaan harus memiliki minimal 2 pilihan.',
        variant: 'destructive',
      });
      return;
    }
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      options: newOptions.map((opt, i) => ({ ...opt, option_order: i + 1 })),
    });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], option_text: value };
    setFormData({ ...formData, options: newOptions });
  };

  const handleScoreChange = (optionIndex: number, scoreKey: string, value: number) => {
    const newOptions = [...formData.options];
    newOptions[optionIndex] = {
      ...newOptions[optionIndex],
      personality_scores: {
        ...newOptions[optionIndex].personality_scores,
        [scoreKey]: value,
      },
    };
    setFormData({ ...formData, options: newOptions });
  };

  const handleSaveQuestion = () => {
    if (!quizId) return;
    
    if (!formData.question_text.trim()) {
      toast({
        title: 'Teks pertanyaan wajib diisi',
        variant: 'destructive',
      });
      return;
    }

    const validOptions = formData.options.filter(opt => opt.option_text.trim());
    if (validOptions.length < 2) {
      toast({
        title: 'Minimal 2 pilihan dengan teks',
        variant: 'destructive',
      });
      return;
    }

    if (editingQuestion) {
      updateQuestion.mutate({
        questionId: editingQuestion.id,
        quizId: quizId,
        question: {
          question_text: formData.question_text,
          question_order: formData.question_order,
          image_url: formData.image_url || null,
        },
        options: validOptions.map(opt => ({
          option_text: opt.option_text,
          option_order: opt.option_order,
          personality_scores: opt.personality_scores as any,
        })),
      }, {
        onSuccess: () => {
          setIsEditorOpen(false);
        },
      });
    } else {
      createQuestion.mutate({
        question: {
          quiz_id: quizId,
          question_text: formData.question_text,
          question_order: formData.question_order,
          image_url: formData.image_url || null,
        },
        options: validOptions.map(opt => ({
          option_text: opt.option_text,
          option_order: opt.option_order,
          personality_scores: opt.personality_scores as any,
        })),
      }, {
        onSuccess: () => {
          setIsEditorOpen(false);
        },
      });
    }
  };

  const isSaving = createQuestion.isPending || updateQuestion.isPending;

  return (
    <AdminLayout title={quiz?.title ? `Pertanyaan: ${quiz.title}` : 'Kelola Pertanyaan'}>
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
        <Button variant="hero" className="gap-2" onClick={handleAddQuestion}>
          <Plus className="h-4 w-4" />
          Tambah Pertanyaan
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
              Total Pertanyaan: <strong>{questions?.length ?? 0}</strong>
            </span>
            <span className="text-muted-foreground">
              Status: <strong>{quiz.status === 'published' ? 'Published' : 'Draft'}</strong>
            </span>
          </div>
        </div>
      ) : null}

      {/* Questions List */}
      <div className="space-y-4">
        {isQuestionsLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-5 w-full" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : questions?.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">Belum ada pertanyaan. Tambahkan pertanyaan pertama!</p>
              <Button onClick={handleAddQuestion} className="gap-2">
                <Plus className="h-4 w-4" />
                Tambah Pertanyaan
              </Button>
            </CardContent>
          </Card>
        ) : (
          questions?.map((question: any, index: number) => (
            <Card key={question.id} className="group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm shrink-0">
                      {index + 1}
                    </div>
                    <div className="space-y-2">
                      {question.image_url && (
                        <img 
                          src={question.image_url} 
                          alt="Question" 
                          className="max-h-24 rounded-lg object-cover"
                        />
                      )}
                      <CardTitle className="text-base font-medium leading-relaxed">
                        {question.question_text}
                      </CardTitle>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleEditQuestion(question)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteQuestionId(question.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {question.quiz_options?.map((option: any, optIndex: number) => (
                    <div 
                      key={option.id} 
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 text-sm"
                    >
                      <span className="w-5 h-5 rounded-full bg-background flex items-center justify-center text-xs font-medium shrink-0">
                        {String.fromCharCode(65 + optIndex)}
                      </span>
                      <span className="line-clamp-1">{option.option_text}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Question Editor Dialog */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? 'Edit Pertanyaan' : 'Tambah Pertanyaan Baru'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Optional Image */}
            <div className="space-y-2">
              <Label htmlFor="question_image" className="flex items-center gap-2">
                <ImagePlus className="h-4 w-4" />
                Gambar Pertanyaan (Opsional)
              </Label>
              <Input
                id="question_image"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://example.com/gambar.jpg"
              />
              <p className="text-xs text-muted-foreground">
                Masukkan URL gambar yang akan ditampilkan di atas pertanyaan.
              </p>
              {formData.image_url && (
                <div className="mt-2 p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                  <img 
                    src={formData.image_url} 
                    alt="Preview" 
                    className="max-h-32 rounded-lg object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="question_text">Teks Pertanyaan *</Label>
              <Textarea
                id="question_text"
                value={formData.question_text}
                onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
                placeholder="Masukkan pertanyaan..."
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Pilihan Jawaban</Label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddOption}>
                  <Plus className="h-4 w-4 mr-1" />
                  Tambah Pilihan
                </Button>
              </div>

              {formData.options.map((option, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary shrink-0">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <div className="flex-1 space-y-3">
                      <div className="flex gap-2">
                        <Input
                          value={option.option_text}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          placeholder={`Pilihan ${String.fromCharCode(65 + index)}`}
                          className="flex-1"
                        />
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleRemoveOption(index)}
                          className="shrink-0 text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Personality Scores */}
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Skor Kepribadian (opsional)</Label>
                        <div className="flex flex-wrap gap-2">
                          {['type1', 'type2', 'type3', 'type4'].map((scoreKey) => (
                            <div key={scoreKey} className="flex items-center gap-1">
                              <Label className="text-xs">{scoreKey}:</Label>
                              <Input
                                type="number"
                                min={0}
                                max={5}
                                value={option.personality_scores[scoreKey] || ''}
                                onChange={(e) => handleScoreChange(index, scoreKey, parseInt(e.target.value) || 0)}
                                className="w-14 h-7 text-xs"
                                placeholder="0"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditorOpen(false)}>Batal</Button>
            <Button onClick={handleSaveQuestion} disabled={isSaving} className="gap-2">
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              <Save className="h-4 w-4" />
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteQuestionId} onOpenChange={() => setDeleteQuestionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pertanyaan?</AlertDialogTitle>
            <AlertDialogDescription>
              Aksi ini tidak dapat dibatalkan. Pertanyaan beserta semua pilihan akan dihapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteQuestion}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteQuestion.isPending ? (
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

export default AdminQuizQuestions;
