import { Link } from "react-router";
import { Crown } from "lucide-react";

interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    excerpt: string;
    image: string;
    isVip: boolean;
    category: string;
  };
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link to={`/article/${article.id}`} className="group block overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all hover:shadow-md">
      <div className="relative aspect-video overflow-hidden bg-gray-100">
        <img 
          src={article.image} 
          alt={article.title} 
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {article.isVip && (
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
            <Crown className="h-3 w-3" />
            <span>VIP</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <span className="mb-2 block text-xs font-medium text-blue-600 uppercase tracking-wider">{article.category}</span>
        <h3 className="mb-2 line-clamp-2 text-lg font-bold text-gray-900 group-hover:text-blue-600">
          {article.title}
        </h3>
        <p className="line-clamp-2 text-sm text-gray-600">
          {article.excerpt}
        </p>
      </div>
    </Link>
  );
}
