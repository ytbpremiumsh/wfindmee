import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Plus, GripVertical, Edit, Trash2 } from 'lucide-react';

const AdminContent = () => {
  const banners = [
    { id: 1, title: 'Banner Promo Quiz MBTI', image: '/placeholder.svg' },
    { id: 2, title: 'Quiz Baru: Tipe Cinta', image: '/placeholder.svg' },
  ];

  return (
    <AdminLayout title="Konten Home">
      <div className="space-y-8">
        {/* Banner Slider */}
        <section className="bg-card rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Banner Slider</h2>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Tambah Banner
            </Button>
          </div>
          
          <div className="space-y-3">
            {banners.map((banner) => (
              <div 
                key={banner.id}
                className="flex items-center gap-4 p-3 rounded-xl border border-border bg-muted/30"
              >
                <button className="cursor-grab hover:bg-muted rounded p-1">
                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                </button>
                <img 
                  src={banner.image} 
                  alt={banner.title}
                  className="w-24 h-14 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="font-medium">{banner.title}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Quiz */}
        <section className="bg-card rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Quiz Pilihan (Featured)</h2>
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Atur Featured
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground">
            Pilih quiz mana yang ingin ditampilkan di bagian "Quiz Populer" pada halaman utama.
            Anda bisa mengaturnya melalui menu Kelola Quiz.
          </p>
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminContent;
