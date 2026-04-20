import { useSearchParams } from "react-router";
import { Search as SearchIcon, Filter, SearchX } from "lucide-react";
import { articles, categories } from "../lib/mock-data";
import { ArticleCard } from "../components/ArticleCard";

export function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const categoryFilter = searchParams.get("category") || "";

  // Mock search logic
  const filteredArticles = articles.filter(article => {
    const matchesQuery = article.title.toLowerCase().includes(query.toLowerCase()) || 
                         article.excerpt.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = categoryFilter ? article.category === categoryFilter : true;
    return matchesQuery && matchesCategory;
  });

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = formData.get("q") as string;
    
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (categoryFilter) params.set("category", categoryFilter);
    setSearchParams(params);
  };

  return (
    <div className="container mx-auto px-4 py-8 lg:px-8">
      {/* Search Bar & Filters */}
      <div className="mb-10 rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
        <form onSubmit={handleSearch} className="mb-6 relative">
          <SearchIcon className="absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-gray-400" />
          <input 
            name="q"
            type="text" 
            defaultValue={query}
            placeholder="Tìm kiếm bài viết, tác giả, nội dung..." 
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-4 pl-14 pr-4 text-lg outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700">
            Tìm kiếm
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-4 border-t border-gray-100 pt-6">
          <div className="flex items-center gap-2 text-gray-700 font-medium">
            <Filter className="h-5 w-5" /> Bộ lọc:
          </div>
          
          <select 
            value={categoryFilter}
            onChange={(e) => {
              const params = new URLSearchParams(searchParams);
              if (e.target.value) params.set("category", e.target.value);
              else params.delete("category");
              setSearchParams(params);
            }}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <select className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm focus:border-blue-500 focus:outline-none">
            <option value="">Tất cả tác giả</option>
            <option value="A">Nguyễn Văn A</option>
            <option value="B">Trần Thị B</option>
          </select>
        </div>
      </div>

      {/* Results */}
      <div>
        <h2 className="mb-6 text-xl font-bold text-gray-900">
          {filteredArticles.length > 0 
            ? `Tìm thấy ${filteredArticles.length} kết quả` 
            : 'Kết quả tìm kiếm'}
        </h2>

        {filteredArticles.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredArticles.map(article => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-20 text-center">
            <SearchX className="mb-4 h-16 w-16 text-gray-400" />
            <h3 className="mb-2 text-xl font-bold text-gray-900">Không tìm thấy kết quả</h3>
            <p className="text-gray-500">
              Rất tiếc, chúng tôi không tìm thấy bài viết nào phù hợp với "{query}".<br />
              Vui lòng thử lại với từ khóa khác.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
