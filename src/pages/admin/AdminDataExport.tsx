import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Download, 
  Upload, 
  Loader2, 
  FileJson, 
  Database,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ExportData {
  version: string;
  exported_at: string;
  quizzes: any[];
  quiz_questions: any[];
  quiz_options: any[];
  quiz_results: any[];
  banners: any[];
  articles: any[];
  site_settings: any[];
}

const AdminDataExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importData, setImportData] = useState('');
  const [showConfirmImport, setShowConfirmImport] = useState(false);
  const [importPreview, setImportPreview] = useState<ExportData | null>(null);

  const handleExportJSON = async () => {
    setIsExporting(true);
    try {
      // Fetch all data
      const [quizzesRes, questionsRes, optionsRes, resultsRes, bannersRes, articlesRes, settingsRes] = await Promise.all([
        supabase.from('quizzes').select('*'),
        supabase.from('quiz_questions').select('*'),
        supabase.from('quiz_options').select('*'),
        supabase.from('quiz_results').select('*'),
        supabase.from('banners').select('*'),
        supabase.from('articles').select('*'),
        supabase.from('site_settings').select('*'),
      ]);

      const exportData: ExportData = {
        version: '1.0',
        exported_at: new Date().toISOString(),
        quizzes: quizzesRes.data || [],
        quiz_questions: questionsRes.data || [],
        quiz_options: optionsRes.data || [],
        quiz_results: resultsRes.data || [],
        banners: bannersRes.data || [],
        articles: articlesRes.data || [],
        site_settings: settingsRes.data || [],
      };

      // Download as JSON
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quizmind-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export Berhasil!',
        description: `Data berhasil di-export ke file JSON.`,
      });
    } catch (error: any) {
      toast({
        title: 'Gagal Export',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSQL = async () => {
    setIsExporting(true);
    try {
      // Fetch all data
      const [quizzesRes, questionsRes, optionsRes, resultsRes, bannersRes, articlesRes, settingsRes] = await Promise.all([
        supabase.from('quizzes').select('*'),
        supabase.from('quiz_questions').select('*'),
        supabase.from('quiz_options').select('*'),
        supabase.from('quiz_results').select('*'),
        supabase.from('banners').select('*'),
        supabase.from('articles').select('*'),
        supabase.from('site_settings').select('*'),
      ]);

      const escapeSQL = (val: any): string => {
        if (val === null || val === undefined) return 'NULL';
        if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
        if (typeof val === 'number') return val.toString();
        if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
        return `'${String(val).replace(/'/g, "''")}'`;
      };

      const generateInserts = (tableName: string, data: any[]): string => {
        if (!data || data.length === 0) return '';
        
        const columns = Object.keys(data[0]);
        const inserts = data.map(row => {
          const values = columns.map(col => escapeSQL(row[col])).join(', ');
          return `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${values}) ON CONFLICT (id) DO NOTHING;`;
        });
        
        return `-- ${tableName}\n${inserts.join('\n')}\n\n`;
      };

      let sql = `-- QuizMind Database Backup\n-- Exported at: ${new Date().toISOString()}\n\n`;
      sql += `-- Clear existing data (optional - uncomment if needed)\n`;
      sql += `-- TRUNCATE quiz_options, quiz_questions, quiz_results, quizzes, banners, articles, site_settings CASCADE;\n\n`;
      
      sql += generateInserts('public.quizzes', quizzesRes.data || []);
      sql += generateInserts('public.quiz_questions', questionsRes.data || []);
      sql += generateInserts('public.quiz_options', optionsRes.data || []);
      sql += generateInserts('public.quiz_results', resultsRes.data || []);
      sql += generateInserts('public.banners', bannersRes.data || []);
      sql += generateInserts('public.articles', articlesRes.data || []);
      sql += generateInserts('public.site_settings', settingsRes.data || []);

      // Download as SQL
      const blob = new Blob([sql], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quizmind-backup-${new Date().toISOString().split('T')[0]}.sql`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export Berhasil!',
        description: `Data berhasil di-export ke file SQL.`,
      });
    } catch (error: any) {
      toast({
        title: 'Gagal Export',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handlePreviewImport = () => {
    try {
      const data = JSON.parse(importData) as ExportData;
      
      if (!data.version || !data.quizzes) {
        throw new Error('Format file tidak valid');
      }

      setImportPreview(data);
      setShowConfirmImport(true);
    } catch (error: any) {
      toast({
        title: 'Format JSON tidak valid',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleImport = async () => {
    if (!importPreview) return;

    setIsImporting(true);
    setShowConfirmImport(false);

    try {
      // Import in order to respect foreign keys
      // First delete existing data (optional - we use upsert instead)
      
      // Import quizzes
      if (importPreview.quizzes.length > 0) {
        const { error } = await supabase
          .from('quizzes')
          .upsert(importPreview.quizzes, { onConflict: 'id' });
        if (error) throw error;
      }

      // Import questions
      if (importPreview.quiz_questions.length > 0) {
        const { error } = await supabase
          .from('quiz_questions')
          .upsert(importPreview.quiz_questions, { onConflict: 'id' });
        if (error) throw error;
      }

      // Import options
      if (importPreview.quiz_options.length > 0) {
        const { error } = await supabase
          .from('quiz_options')
          .upsert(importPreview.quiz_options, { onConflict: 'id' });
        if (error) throw error;
      }

      // Import results
      if (importPreview.quiz_results.length > 0) {
        const { error } = await supabase
          .from('quiz_results')
          .upsert(importPreview.quiz_results, { onConflict: 'id' });
        if (error) throw error;
      }

      // Import banners
      if (importPreview.banners.length > 0) {
        const { error } = await supabase
          .from('banners')
          .upsert(importPreview.banners, { onConflict: 'id' });
        if (error) throw error;
      }

      // Import articles
      if (importPreview.articles.length > 0) {
        const { error } = await supabase
          .from('articles')
          .upsert(importPreview.articles, { onConflict: 'id' });
        if (error) throw error;
      }

      // Import settings
      if (importPreview.site_settings.length > 0) {
        const { error } = await supabase
          .from('site_settings')
          .upsert(importPreview.site_settings, { onConflict: 'id' });
        if (error) throw error;
      }

      toast({
        title: 'Import Berhasil!',
        description: 'Semua data berhasil diimport.',
      });

      setImportData('');
      setImportPreview(null);
    } catch (error: any) {
      toast({
        title: 'Gagal Import',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImportData(event.target?.result as string);
    };
    reader.readAsText(file);
  };

  return (
    <AdminLayout title="Export / Import Data">
      <div className="max-w-4xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Backup & Restore Database
            </CardTitle>
            <CardDescription>
              Export data untuk backup atau pindah ke website lain. Import data dari backup sebelumnya.
            </CardDescription>
          </CardHeader>
        </Card>

        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export" className="gap-2">
              <Download className="h-4 w-4" />
              Export Data
            </TabsTrigger>
            <TabsTrigger value="import" className="gap-2">
              <Upload className="h-4 w-4" />
              Import Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4 mt-4">
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileJson className="h-4 w-4" />
                    Export JSON
                  </CardTitle>
                  <CardDescription>
                    Format yang mudah diimport kembali. Recommended untuk backup.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handleExportJSON} 
                    disabled={isExporting}
                    className="w-full gap-2"
                  >
                    {isExporting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Download JSON
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Export SQL
                  </CardTitle>
                  <CardDescription>
                    Format SQL untuk import langsung ke database Supabase.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handleExportSQL} 
                    disabled={isExporting}
                    variant="secondary"
                    className="w-full gap-2"
                  >
                    {isExporting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Download SQL
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="border-dashed">
              <CardContent className="pt-6">
                <div className="text-sm text-muted-foreground space-y-2">
                  <p className="font-medium">Data yang akan di-export:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Semua Quiz (pertanyaan, opsi, hasil)</li>
                    <li>Banners</li>
                    <li>Artikel</li>
                    <li>Pengaturan situs</li>
                  </ul>
                  <p className="text-xs mt-4 text-muted-foreground">
                    * Data user dan percobaan quiz tidak di-export untuk keamanan.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="import" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Import dari File JSON</CardTitle>
                <CardDescription>
                  Upload file backup JSON atau paste data JSON langsung.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file-upload">Upload File</Label>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="block w-full text-sm text-muted-foreground
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-medium
                      file:bg-primary file:text-primary-foreground
                      hover:file:bg-primary/90
                      cursor-pointer"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">atau</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="json-data">Paste JSON Data</Label>
                  <Textarea
                    id="json-data"
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder='{"version": "1.0", "quizzes": [...], ...}'
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>

                <Button 
                  onClick={handlePreviewImport}
                  disabled={!importData || isImporting}
                  className="w-full gap-2"
                >
                  {isImporting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4" />
                  )}
                  Preview & Import
                </Button>
              </CardContent>
            </Card>

            <Card className="border-amber-500/50 bg-amber-500/5">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-amber-600 dark:text-amber-400">
                      Perhatian!
                    </p>
                    <p className="text-muted-foreground mt-1">
                      Import data akan menimpa data yang sudah ada dengan ID yang sama. 
                      Pastikan Anda sudah backup data lama sebelum import.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Confirm Import Dialog */}
      <AlertDialog open={showConfirmImport} onOpenChange={setShowConfirmImport}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Konfirmasi Import Data
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-4">
                <p>Data yang akan diimport:</p>
                {importPreview && (
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>{importPreview.quizzes.length} Quiz</li>
                    <li>{importPreview.quiz_questions.length} Pertanyaan</li>
                    <li>{importPreview.quiz_options.length} Opsi Jawaban</li>
                    <li>{importPreview.quiz_results.length} Hasil Quiz</li>
                    <li>{importPreview.banners.length} Banner</li>
                    <li>{importPreview.articles.length} Artikel</li>
                    <li>{importPreview.site_settings.length} Pengaturan</li>
                  </ul>
                )}
                <p className="text-sm text-amber-600">
                  Data dengan ID yang sama akan ditimpa. Lanjutkan?
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleImport}>
              Ya, Import Sekarang
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default AdminDataExport;
