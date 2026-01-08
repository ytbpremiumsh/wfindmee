import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Save, Loader2, UserPlus, Eye, EyeOff } from 'lucide-react';
import { useSiteSettings, useUpdateSetting } from '@/hooks/useSiteSettings';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
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

  const [branding, setBranding] = useState({
    site_name: 'Wfind',
    logo_url: '',
  });

  const [adsense, setAdsense] = useState({
    enabled: false,
    script_code: '',
    header_html: '',
    footer_html: '',
  });

  const [adPlacements, setAdPlacements] = useState({
    home: { count: 2 },
    quiz: { count: 2 },
    result: { count: 2 },
  });

  const [analytics, setAnalytics] = useState({
    ga_enabled: false,
    ga_tracking_id: '',
  });

  const [ai, setAi] = useState({
    enabled: false,
    provider: 'lovable' as 'lovable' | 'openrouter',
    model: 'google/gemini-2.5-flash',
    openrouter_api_key: '',
    prompt_template: '',
    auto_fill_scores: true,
  });

  const [customCode, setCustomCode] = useState({
    head_code: '',
    footer_code: '',
  });

  // Admin user creation state
  const [newAdmin, setNewAdmin] = useState({
    email: '',
    password: '',
    full_name: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

  useEffect(() => {
    if (settings) {
      const brandingSettings = (settings as any).branding;
      if (brandingSettings) {
        setBranding({
          site_name: brandingSettings.site_name || 'Wfind',
          logo_url: brandingSettings.logo_url || '',
        });
      }
      if (settings.adsense) {
        setAdsense({
          enabled: settings.adsense.enabled || false,
          script_code: settings.adsense.script_code || '',
          header_html: (settings.adsense as any).header_html || '',
          footer_html: (settings.adsense as any).footer_html || '',
        });
      }
      const adPlacementsSettings = (settings as any).ad_placements;
      if (adPlacementsSettings) {
        setAdPlacements({
          home: adPlacementsSettings.home || { count: 2 },
          quiz: adPlacementsSettings.quiz || { count: 2 },
          result: adPlacementsSettings.result || { count: 2 },
        });
      }
      const analyticsSettings = (settings as any).analytics;
      if (analyticsSettings) {
        setAnalytics({
          ga_enabled: analyticsSettings.ga_enabled || false,
          ga_tracking_id: analyticsSettings.ga_tracking_id || '',
        });
      }
      if (settings.ai) {
        setAi({
          enabled: settings.ai.enabled || false,
          provider: settings.ai.provider || 'lovable',
          model: settings.ai.model || 'google/gemini-2.5-flash',
          openrouter_api_key: settings.ai.openrouter_api_key || '',
          prompt_template: settings.ai.prompt_template || '',
          auto_fill_scores: (settings.ai as any).auto_fill_scores !== false,
        });
      }
      if (settings.custom_code) setCustomCode(settings.custom_code);
    }
  }, [settings]);

  const handleSaveBranding = () => {
    updateSetting.mutate({ key: 'branding', value: branding });
  };

  const handleSaveAdsense = () => {
    updateSetting.mutate({ key: 'adsense', value: adsense });
  };

  const handleSaveAdPlacements = () => {
    updateSetting.mutate({ key: 'ad_placements', value: adPlacements });
  };

  const handleSaveAnalytics = () => {
    updateSetting.mutate({ key: 'analytics', value: analytics });
  };

  const handleSaveAI = () => {
    updateSetting.mutate({ key: 'ai', value: ai });
  };

  const handleSaveCustomCode = () => {
    updateSetting.mutate({ key: 'custom_code', value: customCode });
  };

  const handleCreateAdmin = async () => {
    if (!newAdmin.email || !newAdmin.password) {
      toast({
        title: 'Gagal',
        description: 'Email dan password wajib diisi',
        variant: 'destructive',
      });
      return;
    }

    if (newAdmin.password.length < 6) {
      toast({
        title: 'Gagal',
        description: 'Password minimal 6 karakter',
        variant: 'destructive',
      });
      return;
    }

    setIsCreatingAdmin(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-admin-user`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({
            email: newAdmin.email,
            password: newAdmin.password,
            full_name: newAdmin.full_name,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Gagal membuat admin');
      }

      toast({
        title: 'Berhasil!',
        description: `Admin ${newAdmin.email} berhasil dibuat dan sudah terverifikasi.`,
      });

      setNewAdmin({ email: '', password: '', full_name: '' });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal membuat admin';
      toast({
        title: 'Gagal membuat admin',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsCreatingAdmin(false);
    }
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
        {/* Branding Settings */}
        <section className="bg-card rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">🎨 Branding</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="site-name">Nama Brand / Situs</Label>
              <Input
                id="site-name"
                value={branding.site_name}
                onChange={(e) => setBranding({ ...branding, site_name: e.target.value })}
                placeholder="Wfind"
              />
              <p className="text-xs text-muted-foreground">
                Nama ini akan ditampilkan di navbar dan seluruh situs.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo-url">URL Logo</Label>
              <Input
                id="logo-url"
                value={branding.logo_url}
                onChange={(e) => setBranding({ ...branding, logo_url: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
              <p className="text-xs text-muted-foreground">
                Masukkan URL gambar logo. Jika kosong, akan menggunakan ikon default.
              </p>
              {branding.logo_url && (
                <div className="mt-2 p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                  <img 
                    src={branding.logo_url} 
                    alt="Logo Preview" 
                    className="h-10 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
            <Button onClick={handleSaveBranding} disabled={updateSetting.isPending} className="gap-2">
              {updateSetting.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Simpan Branding
            </Button>
          </div>
        </section>

        {/* Google Adsense with Header/Footer HTML */}
        <section className="bg-card rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">🔔 Google AdSense & Iklan</h2>
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
              <Label htmlFor="adsense-script">Kode Script AdSense (Auto Ads / Default)</Label>
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
                rows={8}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Kode script default AdSense untuk halaman quiz dan konten.
              </p>
            </div>

            <div className="border-t pt-4 mt-4">
              <h3 className="text-md font-medium mb-3">📍 Iklan Manual (Header & Footer)</h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="header-html">HTML Iklan Header (Semua Halaman: Utama, Quiz, Hasil, Artikel)</Label>
                  <Textarea
                    id="header-html"
                    value={adsense.header_html}
                    onChange={(e) => setAdsense({ ...adsense, header_html: e.target.value })}
                    placeholder={`<!-- Paste kode iklan untuk ditampilkan di bagian atas halaman -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-XXXXX"
     data-ad-slot="HEADER_SLOT"
     data-ad-format="horizontal"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>`}
                    rows={6}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Iklan ini akan muncul di bagian atas (setelah header) pada halaman utama, quiz, hasil, dan artikel.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="footer-html">HTML Iklan Footer (Semua Halaman: Utama, Quiz, Hasil, Artikel)</Label>
                  <Textarea
                    id="footer-html"
                    value={adsense.footer_html}
                    onChange={(e) => setAdsense({ ...adsense, footer_html: e.target.value })}
                    placeholder={`<!-- Paste kode iklan untuk ditampilkan di bagian bawah halaman -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-XXXXX"
     data-ad-slot="FOOTER_SLOT"
     data-ad-format="horizontal"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>`}
                    rows={6}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Iklan ini akan muncul di bagian bawah (sebelum footer) pada semua halaman.
                  </p>
                </div>
              </div>
            </div>

            <Button onClick={handleSaveAdsense} disabled={updateSetting.isPending} className="gap-2">
              {updateSetting.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Simpan Pengaturan Iklan
            </Button>
          </div>
        </section>

        {/* Ad Placements Settings */}
        <section className="bg-card rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">📍 Jumlah Iklan Per Halaman</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Atur jumlah slot iklan yang tampil di masing-masing halaman.
          </p>
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ad-home">Halaman Utama</Label>
                <Select 
                  value={adPlacements.home.count.toString()} 
                  onValueChange={(v) => setAdPlacements({ ...adPlacements, home: { count: parseInt(v) } })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 4, 5].map((n) => (
                      <SelectItem key={n} value={n.toString()}>{n} Iklan</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ad-quiz">Halaman Quiz</Label>
                <Select 
                  value={adPlacements.quiz.count.toString()} 
                  onValueChange={(v) => setAdPlacements({ ...adPlacements, quiz: { count: parseInt(v) } })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 4, 5].map((n) => (
                      <SelectItem key={n} value={n.toString()}>{n} Iklan</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ad-result">Halaman Hasil</Label>
                <Select 
                  value={adPlacements.result.count.toString()} 
                  onValueChange={(v) => setAdPlacements({ ...adPlacements, result: { count: parseInt(v) } })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 1, 2, 3, 4, 5].map((n) => (
                      <SelectItem key={n} value={n.toString()}>{n} Iklan</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleSaveAdPlacements} disabled={updateSetting.isPending} className="gap-2">
              {updateSetting.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Simpan Pengaturan Iklan
            </Button>
          </div>
        </section>

        {/* Google Analytics Settings */}
        <section className="bg-card rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">📊 Google Analytics</h2>
            <div className="flex items-center gap-2">
              <Label htmlFor="ga-enabled">Aktif</Label>
              <Switch
                id="ga-enabled"
                checked={analytics.ga_enabled}
                onCheckedChange={(checked) => setAnalytics({ ...analytics, ga_enabled: checked })}
              />
            </div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ga-tracking-id">Tracking ID / Measurement ID</Label>
              <Input
                id="ga-tracking-id"
                value={analytics.ga_tracking_id}
                onChange={(e) => setAnalytics({ ...analytics, ga_tracking_id: e.target.value })}
                placeholder="G-XXXXXXXXXX atau UA-XXXXXXXXX-X"
              />
              <p className="text-xs text-muted-foreground">
                Masukkan Google Analytics Tracking ID. Untuk GA4 gunakan format G-XXXXXXXXXX, untuk Universal Analytics gunakan UA-XXXXXXXXX-X.
              </p>
            </div>
            
            {analytics.ga_enabled && analytics.ga_tracking_id && (
              <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 text-sm">
                <p className="font-medium text-green-700 dark:text-green-400">✅ Google Analytics Aktif</p>
                <p className="text-green-600 dark:text-green-500 text-xs mt-1">
                  Tracking ID: {analytics.ga_tracking_id}
                </p>
              </div>
            )}

            <Button onClick={handleSaveAnalytics} disabled={updateSetting.isPending} className="gap-2">
              {updateSetting.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Simpan Analytics
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

            {/* Auto-fill personality scores toggle */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/20">
              <div>
                <Label htmlFor="auto-fill-scores" className="font-medium">Auto-fill Skor Kepribadian</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  AI akan otomatis mengisi skor kepribadian untuk setiap jawaban saat membuat quiz baru. Tidak perlu input manual.
                </p>
              </div>
              <Switch
                id="auto-fill-scores"
                checked={ai.auto_fill_scores}
                onCheckedChange={(checked) => setAi({ ...ai, auto_fill_scores: checked })}
              />
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

        {/* Admin User Management */}
        <section className="bg-card rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">👤 Tambah Admin Baru</h2>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Tambah user admin baru yang langsung terverifikasi dan bisa mengakses dashboard.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Email *</Label>
                <Input
                  id="admin-email"
                  type="email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  placeholder="admin@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-name">Nama Lengkap</Label>
                <Input
                  id="admin-name"
                  value={newAdmin.full_name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, full_name: e.target.value })}
                  placeholder="Nama Admin"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password *</Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  placeholder="Minimal 6 karakter"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button 
              onClick={handleCreateAdmin} 
              disabled={isCreatingAdmin}
              className="gap-2"
            >
              {isCreatingAdmin ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              Buat Admin Baru
            </Button>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
