import { AdminLayout } from '@/components/admin/AdminLayout';
import { FileQuestion, Users, Eye, TrendingUp } from 'lucide-react';

const stats = [
  { label: 'Total Quiz', value: '12', icon: FileQuestion, color: 'primary' },
  { label: 'Total Pengunjung', value: '5,432', icon: Users, color: 'accent' },
  { label: 'Quiz Dimainkan', value: '8,291', icon: Eye, color: 'category-mbti' },
  { label: 'Pertumbuhan', value: '+23%', icon: TrendingUp, color: 'category-fun' },
];

const AdminDashboard = () => {
  return (
    <AdminLayout title="Dashboard">
      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-card rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl bg-${stat.color}/10 flex items-center justify-center`}>
                <stat.icon className={`h-6 w-6 text-${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-card rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Aktivitas Terbaru</h2>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="flex items-center gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Seseorang menyelesaikan Quiz MBTI</p>
                <p className="text-xs text-muted-foreground">2 menit yang lalu</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
