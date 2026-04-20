import { useParams } from "react-router";
import { UserPlus, Users, Calendar, MapPin, Mail } from "lucide-react";
import { authors, articles } from "../lib/mock-data";
import { ArticleCard } from "../components/ArticleCard";

export function AuthorProfile() {
  const { id } = useParams();
  const author = authors.find(a => a.id === id);
  const authorArticles = articles.filter(a => a.authorId === id);

  if (!author) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-900">Không tìm thấy tác giả</h2>
        <p className="mt-2 text-gray-500">Tác giả bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Cover Image */}
      <div className="h-64 w-full bg-slate-800 relative">
        <img 
          src={author.cover} 
          alt="Cover" 
          className="h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 max-w-5xl -mt-24 relative z-10">
        {/* Author Info Card */}
        <div className="rounded-2xl bg-white p-6 shadow-xl shadow-gray-200/50 mb-10 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-end -mt-16 md:-mt-20 mb-6">
            <img 
              src={author.avatar} 
              alt={author.name}
              className="h-32 w-32 rounded-full border-4 border-white object-cover bg-white shadow-md"
            />
            <div className="flex-1 w-full flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">{author.name}</h1>
                <p className="text-blue-600 font-medium text-sm mb-2">{author.role}</p>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <button className="flex-1 md:flex-none flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-blue-700">
                  <UserPlus className="h-4 w-4" /> Theo dõi
                </button>
                <button className="flex items-center justify-center rounded-lg border border-gray-200 bg-white p-2.5 text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900">
                  <Mail className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 border-t border-gray-100">
            <div className="md:col-span-2">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Giới thiệu</h3>
              <p className="text-gray-700 leading-relaxed">{author.bio}</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Calendar className="h-5 w-5 text-gray-400" />
                <span>Tham gia: <strong className="text-gray-900">{author.joined}</strong></span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <Users className="h-5 w-5 text-gray-400" />
                <span><strong className="text-gray-900">{author.followers.toLocaleString()}</strong> Người theo dõi</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <UserPlus className="h-5 w-5 text-gray-400" />
                <span>Đang theo dõi <strong className="text-gray-900">{author.following}</strong> người</span>
              </div>
            </div>
          </div>
        </div>

        {/* Author's Articles */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Bài viết của {author.name}</h2>
            <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {authorArticles.length} bài viết
            </span>
          </div>
          
          {authorArticles.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {authorArticles.map(article => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
              Tác giả này chưa có bài viết nào.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
