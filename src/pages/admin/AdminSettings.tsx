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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const AdminSettings = () => {
  const { data: settings, isLoading } = useSiteSettings();
  const updateSetting = useUpdateSetting();

  const [adsense, setAdsense] = useState({
    enabled: false,
    script_code: '',
  });

  const [adsDisplay, setAdsDisplay] = useState({
    ads_per_page: 3,
    sticky_ad_enabled: true,
  });

  const [ai, setAi] = useState({
    enabled: false,
    provider: 'lovable' as 'lovable' | 'openrouter',
    model: 'google/gemini-2.5-flash',
    openrouter_api_key: '',
    prompt_template: '',
  });

  const [customCode, setCustomCode] = useState({
    head_code: '',
    footer_code: '',
  });

  useEffect(() => {
    if (settings) {
      if (settings.adsense) {
        setAdsense({
          enabled: settings.adsense.enabled || false,
          script_code: settings.adsense.script_code || '',
        });
      }
      const adsDisplaySettings = (settings as any).ads_display;
      if (adsDisplaySettings) {
        setAdsDisplay({
          ads_per_page: adsDisplaySettings.ads_per_page ?? 3,
          sticky_ad_enabled: adsDisplaySettings.sticky_ad_enabled !== false,
        });
      }
      if (settings.ai) {
        setAi({
          enabled: settings.ai.enabled || false,
          provider: settings.ai.provider || 'lovable',
          model: settings.ai.model || 'google/gemini-2.5-flash',
          openrouter_api_key: settings.ai.openrouter_api_key || '',
          prompt_template: settings.ai.prompt_template || '',
        });
      }
      if (settings.custom_code) setCustomCode(settings.custom_code);
    }
  }, [settings]);

  const handleSaveAdsense = () => {
    updateSetting.mutate({ key: 'adsense', value: adsense });
  };

  const handleSaveAdsDisplay = () => {
    updateSetting.mutate({ key: 'ads_display', value: adsDisplay });
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
              <Label htmlFor="adsense-script">Kode Script AdSense</Label>
              <Textarea
                id="adsense-script"
                value={adsense.script_code}
                onChange={(e) => setAdsense({ ...adsense, script_code: e.target.value })}
                placeholder={`<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXX" crossorigin="anonymous"></script>
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-XXXXX"
     data-ad-slot="XXXXXX"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>`}
                rows={10}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Paste langsung kode script AdSense lengkap dari Google AdSense. Tidak perlu dipisah-pisah.
              </p>
            </div>
            <Button onClick={handleSaveAdsense} disabled={updateSetting.isPending} className="gap-2">
              {updateSetting.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Simpan AdSense
            </Button>
          </div>
        </section>

        {/* Ads Display Settings */}
        <section className="bg-card rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">📊 Pengaturan Tampilan Iklan</h2>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ads-per-page">Jumlah Iklan per Halaman</Label>
                <Select 
                  value={adsDisplay.ads_per_page.toString()} 
                  onValueChange={(v) => setAdsDisplay({ ...adsDisplay, ads_per_page: parseInt(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6].map(n => (
                      <SelectItem key={n} value={n.toString()}>{n} iklan</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  id="sticky-ad"
                  checked={adsDisplay.sticky_ad_enabled}
                  onCheckedChange={(checked) => setAdsDisplay({ ...adsDisplay, sticky_ad_enabled: checked })}
                />
                <Label htmlFor="sticky-ad">Tampilkan Sticky Ad (Footer)</Label>
              </div>
            </div>
            <Button onClick={handleSaveAdsDisplay} disabled={updateSetting.isPending} className="gap-2">
              {updateSetting.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Simpan Pengaturan Iklan
            </Button>
          </div>
        </section>

        {/* AI Settings */}
        <section className="bg-card rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">🧠 AI Settings</h2>
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
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ai-provider">AI Provider</Label>
                <Select 
                  value={ai.provider} 
                  onValueChange={(v: 'lovable' | 'openrouter') => setAi({ ...ai, provider: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lovable">Lovable AI (Default, Gratis)</SelectItem>
                    <SelectItem value="openrouter">OpenRouter (Custom)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ai-model">Model AI</Label>
                <Input
                  id="ai-model"
                  value={ai.model}
                  onChange={(e) => setAi({ ...ai, model: e.target.value })}
                  placeholder="google/gemini-2.5-flash"
                />
              </div>
            </div>

            {ai.provider === 'lovable' && (
              <div className="p-4 rounded-xl bg-muted/50 text-sm">
                <p className="font-medium mb-1">✨ Menggunakan Lovable AI</p>
                <p className="text-muted-foreground">
                  Fitur AI menggunakan Lovable AI Gateway yang sudah terkonfigurasi. 
                  Tidak perlu API key eksternal.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Model tersedia: google/gemini-2.5-flash, google/gemini-2.5-pro, openai/gpt-5, openai/gpt-5-mini
                </p>
              </div>
            )}

            {ai.provider === 'openrouter' && (
              <div className="space-y-2">
                <Label htmlFor="openrouter-key">OpenRouter API Key</Label>
                <Input
                  id="openrouter-key"
                  type="password"
                  value={ai.openrouter_api_key}
                  onChange={(e) => setAi({ ...ai, openrouter_api_key: e.target.value })}
                  placeholder="sk-or-..."
                />
                <p className="text-xs text-muted-foreground">
                  Dapatkan API key di{' '}
                  <a href="https://openrouter.ai/keys" target="_blank" rel="noopener" className="underline">
                    openrouter.ai/keys
                  </a>. 
                  Anda bisa menggunakan model seperti anthropic/claude-3.5-sonnet, openai/gpt-4o, dll.
                </p>
              </div>
            )}

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
