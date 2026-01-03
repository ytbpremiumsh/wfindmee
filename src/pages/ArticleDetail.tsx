import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, Eye, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HeaderAd } from '@/components/ads/HeaderAd';
import { FooterAd } from '@/components/ads/FooterAd';
import { useArticleBySlug } from '@/hooks/useArticles';

const ArticleDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading } = useArticleBySlug(slug);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout>
        <div className="container mx-auto py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Artikel tidak ditemukan</h1>
          <Link to="/">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <article className="container mx-auto px-4 py-8 max-w-3xl">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Link>

        {/* Header Ad */}
        <HeaderAd />

        {article.banner_url && (
          <img 
            src={article.banner_url} 
            alt={article.title}
            className="w-full h-64 md:h-96 object-cover rounded-2xl mb-8"
          />
        )}

        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Badge>{article.category}</Badge>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(article.created_at).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {article.views_count || 0} views
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4">{article.title}</h1>
          
          {article.excerpt && (
            <p className="text-lg text-muted-foreground">{article.excerpt}</p>
          )}
        </div>

        <div 
          className="prose prose-lg max-w-none my-8"
          dangerouslySetInnerHTML={{ __html: article.content || '' }}
        />

        {/* Footer Ad */}
        <FooterAd />
      </article>
    </Layout>
  );
};

export default ArticleDetail;
