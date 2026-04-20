import { Link } from "react-router";
import { ArrowRight, ChevronRight, TrendingUp } from "lucide-react";
import { articles, categories } from "../lib/mock-data";
import { ArticleCard } from "../components/ArticleCard";

export function Home() {
  const featuredArticle = articles[0];
  const gridArticles = articles.slice(1);
  const trendingArticles = articles.slice(2, 5);

  return (
    <div className="container mx-auto px-4 py-8 lg:px-8">
      {/* Hero Section */}
      <section className="mb-16">
        <div className="relative overflow-hidden rounded-2xl bg-slate-900 group">
          <img 
            src={featuredArticle.image} 
            alt={featuredArticle.title}
            className="absolute inset-0 h-full w-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          
          <div className="relative flex min-h-[500px] flex-col justify-end p-8 md:p-12 lg:w-2/3">
            <span className="mb-4 inline-flex items-center rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
              Tiêu điểm
            </span>
            <h1 className="mb-4 text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl">
              {featuredArticle.title}
            </h1>
            <p className="mb-8 max-w-2xl text-lg text-gray-200 line-clamp-2">
              {featuredArticle.excerpt}
            </p>
            <Link 
              to={`/article/${featuredArticle.id}`}
              className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-gray-900 transition-colors hover:bg-gray-100"
            >
              Đọc ngay <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* Left Column: Article Grid */}
        <div className="lg:col-span-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Tin mới nhất</h2>
            <Link to="/search" className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
              Xem tất cả <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {gridArticles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <aside className="lg:col-span-4 space-y-10">
          {/* Categories Widget */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-gray-900 flex items-center gap-2">
              <div className="h-4 w-1 bg-blue-600 rounded-full" />
              Danh mục
            </h3>
            <ul className="space-y-3">
              {categories.map(cat => (
                <li key={cat.id}>
                  <Link 
                    to={`/search?category=${cat.id}`}
                    className="flex items-center justify-between rounded-lg p-2 text-gray-600 hover:bg-gray-50 hover:text-blue-600 font-medium transition-colors"
                  >
                    {cat.name}
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Trending Widget */}
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-lg font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Bài viết nổi bật
            </h3>
            <div className="space-y-6">
              {trendingArticles.map((article, index) => (
                <Link key={article.id} to={`/article/${article.id}`} className="group flex gap-4">
                  <div className="flex-shrink-0 text-3xl font-black text-gray-200 group-hover:text-blue-200 transition-colors">
                    0{index + 1}
                  </div>
                  <div>
                    <h4 className="mb-1 font-bold leading-tight text-gray-900 group-hover:text-blue-600 line-clamp-2">
                      {article.title}
                    </h4>
                    <span className="text-xs text-gray-500">{article.date}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
