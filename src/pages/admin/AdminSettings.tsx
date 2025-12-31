import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save } from 'lucide-react';

const AdminSettings = () => {
  return (
    <AdminLayout title="Pengaturan">
      <div className="max-w-3xl space-y-8">
        {/* Google Adsense */}
        <section className="bg-card rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">🔔 Google AdSense</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adsense-script">Script AdSense</Label>
              <Textarea
                id="adsense-script"
                placeholder="<script async src='https://pagead2.googlesyndication.com/...'></script>"
                rows={3}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="adsense-header">Slot Iklan Header</Label>
                <Input id="adsense-header" placeholder="ca-pub-xxxxxxx" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adsense-content">Slot Iklan Konten</Label>
                <Input id="adsense-content" placeholder="ca-pub-xxxxxxx" />
              </div>
            </div>
          </div>
        </section>

        {/* AI Settings */}
        <section className="bg-card rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">🧠 AI Settings</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="openrouter-key">API Key OpenRouter</Label>
              <Input id="openrouter-key" type="password" placeholder="sk-or-..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai-model">Model AI</Label>
              <Input id="ai-model" placeholder="openai/gpt-4" defaultValue="openai/gpt-4" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ai-prompt">Prompt Template Hasil Quiz</Label>
              <Textarea
                id="ai-prompt"
                placeholder="Generate personality description for..."
                rows={4}
              />
            </div>
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
                placeholder="<meta name='...' />"
                rows={3}
              />
              <p className="text-xs text-muted-foreground">Untuk analytics, pixel tracking, dll.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="footer-code">Custom Footer Code</Label>
              <Textarea
                id="footer-code"
                placeholder="<script>...</script>"
                rows={3}
              />
            </div>
          </div>
        </section>

        {/* Save Button */}
        <Button variant="hero" className="gap-2">
          <Save className="h-4 w-4" />
          Simpan Pengaturan
        </Button>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
