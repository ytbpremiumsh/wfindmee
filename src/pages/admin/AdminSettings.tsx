import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Save, Loader2 } from 'lucide-react';
import { useSiteSettings, useUpdateSetting } from '@/hooks/useSiteSettings';
import { Skeleton } from '@/components/ui/skeleton';

const AdminSettings = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSetting = useUpdateSetting();

  const [adsense, setAdsense] = useState({
    enabled: false,
    client_id: '',
    header_slot: '',
    content_slot: '',
    footer_slot: '',
  });

  const [ai, setAi] = useState({
    enabled: false,
    api_key: '',
    model: 'gemini-2.5-flash',
    prompt_template: '',
  });

  const [customCode, setCustomCode] = useState({
    head_code: '',
    footer_code: '',
  });

  useEffect(() => {
    if (settings) {
      if (settings.adsense) setAdsense(settings.adsense);
      if (settings.ai) setAi(settings.ai);
      if (settings.custom_code) setCustomCode(settings.custom_code);
    }
  }, [settings]);

  const handleSaveAdsense = () => {
    updateSetting.mutate({ key: 'adsense', value: adsense });
  };

  const handleSaveAI = () => {
    updateSetting.mutate({ key: 'ai', value: ai });
  };

  const handleSaveCustomCode = () => {
    updateSetting.mutate({ key: 'custom_code', value: customCode });
  };

  if (isLoading) {
    return (
      <AdminLayout title="Pengaturan">
        <div className="max-w-3xl space-y-8">
          {[1, 2, 3].map((i) => (
            <section key={i} className="bg-card rounded-2xl p-6 shadow-sm">
              <Skeleton className="h-6 w-40 mb-4" />
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            </section>
          ))}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Pengaturan">
      <div className="max-w-3xl space-y-8">
        {/* Google Adsense */}
        <section className="bg-card rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">🔔 Google AdSense</h2>
            <div className="flex items-center gap-2">
              <Label htmlFor="adsense-enabled">Aktif</Label>
              <Switch
                id="adsense-enabled"
                checked={adsense.enabled}
                onCheckedChange={(checked) => setAdsense({ ...adsense, enabled: checked })}
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adsense-client">Client ID (ca-pub-xxx)</Label>
              <Input
                id="adsense-client"
                value={adsense.client_id}
                onChange={(e) => setAdsense({ ...adsense, client_id: e.target.value })}
                placeholder="ca-pub-xxxxxxxxxxxxxxxx"
              />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adsense-header">Slot Header</Label>
                <Input
                  id="adsense-header"
                  value={adsense.header_slot}
                  onChange={(e) => setAdsense({ ...adsense, header_slot: e.target.value })}
                  placeholder="1234567890"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adsense-content">Slot Konten</Label>
                <Input
                  id="adsense-content"
                  value={adsense.content_slot}
                  onChange={(e) => setAdsense({ ...adsense, content_slot: e.target.value })}
                  placeholder="1234567890"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adsense-footer">Slot Footer</Label>
                <Input
                  id="adsense-footer"
                  value={adsense.footer_slot}
                  onChange={(e) => setAdsense({ ...adsense, footer_slot: e.target.value })}
                  placeholder="1234567890"
                />
              </div>
            </div>
            <Button onClick={handleSaveAdsense} disabled={updateSetting.isPending} className="gap-2">
              {updateSetting.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Simpan AdSense
            </Button>
          </div>
        </section>

        {/* AI Settings */}
        <section className="bg-card rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">🧠 AI Settings (Lovable AI)</h2>
            <div className="flex items-center gap-2">
              <Label htmlFor="ai-enabled">Aktif</Label>
              <Switch
                id="ai-enabled"
                checked={ai.enabled}
                onCheckedChange={(checked) => setAi({ ...ai, enabled: checked })}
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-muted/50 text-sm">
              <p className="font-medium mb-1">✨ Menggunakan Lovable AI</p>
              <p className="text-muted-foreground">
                Fitur AI menggunakan Lovable AI Gateway yang sudah terkonfigurasi. 
                Tidak perlu API key eksternal untuk generate deskripsi hasil quiz.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai-model">Model AI</Label>
              <Input
                id="ai-model"
                value={ai.model}
                onChange={(e) => setAi({ ...ai, model: e.target.value })}
                placeholder="gemini-2.5-flash"
              />
              <p className="text-xs text-muted-foreground">
                Model tersedia: gemini-2.5-flash, gemini-2.5-pro, gpt-5, gpt-5-mini
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai-prompt">Prompt Template Hasil Quiz</Label>
              <Textarea
                id="ai-prompt"
                value={ai.prompt_template}
                onChange={(e) => setAi({ ...ai, prompt_template: e.target.value })}
                placeholder="Buatkan deskripsi kepribadian untuk tipe {personality_type}. Jelaskan karakteristik, kelebihan, dan kekurangan dalam 3-4 paragraf."
                rows={4}
              />
            </div>
            <Button onClick={handleSaveAI} disabled={updateSetting.isPending} className="gap-2">
              {updateSetting.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Simpan AI Settings
            </Button>
          </div>
        </section>

        {/* Custom Code */}
        <section className="bg-card rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">🧩 Custom Code</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="head-code">Custom Head Code</Label>
              <Textarea
                id="head-code"
                value={customCode.head_code}
                onChange={(e) => setCustomCode({ ...customCode, head_code: e.target.value })}
                placeholder="<!-- Analytics, meta tags, dll -->"
                rows={4}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">Untuk analytics, pixel tracking, meta tags, dll.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="footer-code">Custom Footer Code</Label>
              <Textarea
                id="footer-code"
                value={customCode.footer_code}
                onChange={(e) => setCustomCode({ ...customCode, footer_code: e.target.value })}
                placeholder="<!-- Scripts, widgets, dll -->"
                rows={4}
                className="font-mono text-sm"
              />
            </div>
            <Button onClick={handleSaveCustomCode} disabled={updateSetting.isPending} className="gap-2">
              {updateSetting.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Simpan Custom Code
            </Button>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
