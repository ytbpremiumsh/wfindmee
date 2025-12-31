import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockQuizzes } from '@/data/mockQuizzes';
import { Plus, Search, Edit, Trash2, Eye, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QuizCategory } from '@/types/quiz';

const categoryLabels: Record<QuizCategory, string> = {
  personality: 'Kepribadian',
  fun: 'Fun',
  mbti: 'MBTI',
  love: 'Cinta',
  career: 'Karir',
};

const AdminQuizzes = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredQuizzes = mockQuizzes.filter(quiz => 
    quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
        <Button variant="hero" className="gap-2">
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
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Soal</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-muted-foreground">Status</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-muted-foreground">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuizzes.map((quiz) => (
                <tr key={quiz.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={quiz.thumbnail} 
                        alt={quiz.title}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium line-clamp-1">{quiz.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{quiz.shortDescription}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className={cn("category-badge", `category-badge-${quiz.category}`)}>
                      {categoryLabels[quiz.category]}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="text-sm">{quiz.questionCount} soal</span>
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
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminQuizzes;
