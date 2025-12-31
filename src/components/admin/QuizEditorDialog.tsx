import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2, Sparkles, PenLine } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useSiteSettings } from '@/hooks/useSiteSettings';

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
  const { data: settings } = useSiteSettings();
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

  // AI Generation settings
  const [generationMode, setGenerationMode] = useState<'ai' | 'manual'>('ai');
  const [aiSettings, setAiSettings] = useState({
    questionCount: 10,
    optionCount: 4,
    resultCount: 4,
    provider: 'lovable' as 'lovable' | 'openrouter',
    model: '',
    openrouterApiKey: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // Load AI settings from site settings
  useEffect(() => {
    if (settings?.ai) {
      setAiSettings(prev => ({
        ...prev,
        provider: settings.ai.provider || 'lovable',
        model: settings.ai.model || '',
        openrouterApiKey: settings.ai.openrouter_api_key || '',
      }));
    }
  }, [settings]);

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
      setGenerationMode('manual');
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
      setGenerationMode('ai');
    }
  }, [quiz, quizId]);

  const handleSave = async () => {
    if (quizId) {
      updateQuiz.mutate({
        id: quizId,
        ...formData,
        category: formData.category as any,
      }, {
        onSuccess: () => onOpenChange(false),
      });
    } else {
      // Create new quiz
      createQuiz.mutate({
        ...formData,
        category: formData.category as any,
        created_by: user?.id,
      }, {
        onSuccess: async (data) => {
          if (generationMode === 'ai' && data?.id) {
            // Generate quiz content with AI
            setIsGenerating(true);
            try {
              const { data: funcData, error: funcError } = await supabase.functions.invoke('generate-quiz', {
                body: {
                  quizId: data.id,
                  title: formData.title,
                  category: formData.category,
                  questionCount: aiSettings.questionCount,
                  optionCount: aiSettings.optionCount,
                  resultCount: aiSettings.resultCount,
                  aiProvider: aiSettings.provider,
                  aiModel: aiSettings.model || undefined,
                  openrouterApiKey: aiSettings.provider === 'openrouter' ? aiSettings.openrouterApiKey : undefined,
                }
              });

              if (funcError) throw funcError;
              if (funcData?.error) throw new Error(funcData.error);

              toast({
                title: 'Berhasil!',
                description: `Quiz berhasil dibuat dengan ${funcData?.questionCount || aiSettings.questionCount} pertanyaan dan ${funcData?.resultCount || aiSettings.resultCount} tipe hasil.`,
              });
            } catch (error: any) {
              console.error('Error generating quiz:', error);
              toast({
                title: 'Quiz dibuat',
                description: `Quiz dibuat tapi gagal generate konten AI: ${error.message}. Silakan tambah pertanyaan manual.`,
                variant: 'destructive',
              });
            } finally {
              setIsGenerating(false);
            }
          } else {
            toast({
              title: 'Quiz dibuat!',
              description: 'Quiz berhasil dibuat. Silakan tambah pertanyaan secara manual.',
            });
          }
          onOpenChange(false);
        },
      });
    }
  };

  const isSaving = createQuiz.isPending || updateQuiz.isPending || isGenerating;

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

            {/* Generation Mode - Only for new quizzes */}
            {!quizId && !formData.is_iframe && (
              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-4">
                  <Label className="text-base font-semibold">Mode Pembuatan Pertanyaan:</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={generationMode === 'ai' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setGenerationMode('ai')}
                      className="gap-2"
                    >
                      <Sparkles className="h-4 w-4" />
                      Generate AI
                    </Button>
                    <Button
                      type="button"
                      variant={generationMode === 'manual' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setGenerationMode('manual')}
                      className="gap-2"
                    >
                      <PenLine className="h-4 w-4" />
                      Manual
                    </Button>
                  </div>
                </div>

                {generationMode === 'ai' && (
                  <div className="space-y-4 bg-primary/5 rounded-lg p-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="questionCount">Jumlah Soal</Label>
                        <Select 
                          value={aiSettings.questionCount.toString()} 
                          onValueChange={(v) => setAiSettings({ ...aiSettings, questionCount: parseInt(v) })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[5, 10, 15, 20, 25, 30].map((n) => (
                              <SelectItem key={n} value={n.toString()}>{n} Soal</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="optionCount">Pilihan/Soal</Label>
                        <Select 
                          value={aiSettings.optionCount.toString()} 
                          onValueChange={(v) => setAiSettings({ ...aiSettings, optionCount: parseInt(v) })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[2, 3, 4, 5].map((n) => (
                              <SelectItem key={n} value={n.toString()}>{n} Pilihan</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="resultCount">Jumlah Hasil</Label>
                        <Select 
                          value={aiSettings.resultCount.toString()} 
                          onValueChange={(v) => setAiSettings({ ...aiSettings, resultCount: parseInt(v) })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[2, 3, 4, 5, 6, 8].map((n) => (
                              <SelectItem key={n} value={n.toString()}>{n} Tipe Hasil</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>AI Provider</Label>
                        <Select 
                          value={aiSettings.provider} 
                          onValueChange={(v: 'lovable' | 'openrouter') => setAiSettings({ ...aiSettings, provider: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="lovable">Lovable AI (Default)</SelectItem>
                            <SelectItem value="openrouter">OpenRouter</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Model AI (opsional)</Label>
                        <Input
                          value={aiSettings.model}
                          onChange={(e) => setAiSettings({ ...aiSettings, model: e.target.value })}
                          placeholder="google/gemini-2.5-flash"
                        />
                      </div>
                    </div>

                    {aiSettings.provider === 'openrouter' && (
                      <div className="space-y-2">
                        <Label>OpenRouter API Key</Label>
                        <Input
                          type="password"
                          value={aiSettings.openrouterApiKey}
                          onChange={(e) => setAiSettings({ ...aiSettings, openrouterApiKey: e.target.value })}
                          placeholder="sk-or-..."
                        />
                        <p className="text-xs text-muted-foreground">
                          Dapatkan API key di{' '}
                          <a href="https://openrouter.ai/keys" target="_blank" rel="noopener" className="underline">
                            openrouter.ai/keys
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {generationMode === 'manual' && (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">
                      Quiz akan dibuat tanpa pertanyaan. Anda dapat menambahkan pertanyaan secara manual setelah quiz dibuat melalui menu edit.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={handleSave} disabled={isSaving || !formData.title}>
            {isSaving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {isGenerating ? 'Generating...' : quizId ? 'Simpan' : 'Buat Quiz'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
