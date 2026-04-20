import { useParams, Link } from "react-router";
import { articles, comments as initialComments, authors } from "../lib/mock-data";
import { Calendar, User, Crown, Download, Sparkles, MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export function ArticleDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const article = articles.find(a => a.id === id) || articles[0];
  const author = authors.find(a => a.id === article.authorId);

  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState(initialComments);
  const [commentError, setCommentError] = useState("");

  const isUserVIP = user?.isVip || false;
  const showVipOverlay = article.isVip && !isUserVIP;

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim().length < 5) {
      setCommentError("Bình luận quá ngắn, vui lòng nhập nội dung có ý nghĩa.");
      return;
    }
    if (commentText.includes("spam")) {
      setCommentError("Nội dung chứa từ khóa không hợp lệ (spam).");
      return;
    }
    
    setCommentError("");
    setComments([
      {
        id: Date.now(),
        user: "Người dùng",
        avatar: "https://i.pravatar.cc/150?u=new",
        content: commentText,
        time: "Vừa xong"
      },
      ...comments
    ]);
    setCommentText("");
  };

  return (
    <div className="container mx-auto px-4 py-8 lg:px-8 max-w-7xl">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
        {/* Main Content */}
        <div className="lg:col-span-8">
          <header className="mb-8">
            <div className="mb-4 flex items-center gap-2">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-800 uppercase tracking-wider">
                {article.category}
              </span>
              {article.isVip && (
                <span className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                  <Crown className="h-3 w-3" /> VIP
                </span>
              )}
            </div>
            
            <h1 className="mb-6 text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
              {article.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 border-y border-gray-100 py-4 text-sm text-gray-600">
              <Link to={`/author/${article.authorId}`} className="flex items-center gap-2 group">
                {author ? (
                  <img src={author.avatar} alt={author.name} className="h-6 w-6 rounded-full object-cover bg-gray-100" />
                ) : (
                  <User className="h-4 w-4" />
                )}
                <span className="font-medium group-hover:text-blue-600 transition-colors">{article.author}</span>
              </Link>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{article.date}</span>
              </div>
              
              <div className="ml-auto flex items-center gap-3">
                <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  Tóm tắt AI
                </button>
                <button className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  <Download className="h-4 w-4" />
                  Tải PDF
                </button>
              </div>
            </div>
          </header>

          <div className="mb-10 aspect-video w-full overflow-hidden rounded-xl bg-gray-100">
            <img 
              src={article.image} 
              alt={article.title} 
              className="h-full w-full object-cover"
            />
          </div>

          <div className="relative">
            {/* Article Content */}
            <div 
              className={`prose prose-lg max-w-none prose-p:text-gray-700 prose-headings:text-gray-900 ${showVipOverlay ? 'max-h-[300px] overflow-hidden' : ''}`}
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* VIP Overlay */}
            {showVipOverlay && (
              <>
                <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-white via-white/80 to-transparent backdrop-blur-[2px]" />
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-md">
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center shadow-lg">
                    <Crown className="mx-auto mb-3 h-10 w-10 text-amber-500" />
                    <h3 className="mb-2 text-xl font-bold text-gray-900">Nội dung dành riêng cho VIP</h3>
                    <p className="mb-6 text-sm text-gray-600">
                      Nâng cấp tài khoản để đọc trọn vẹn bài viết này và hàng ngàn bài viết chất lượng cao khác.
                    </p>
                    <Link 
                      to="/vip" 
                      className="inline-block w-full rounded-lg bg-amber-500 px-6 py-3 font-bold text-white transition-colors hover:bg-amber-600"
                    >
                      Đăng ký VIP ngay
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Comment Section */}
          <section className="mt-16 pt-8 border-t border-gray-200">
            <h3 className="mb-8 text-2xl font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-blue-600" />
              Bình luận ({comments.length})
            </h3>
            
            <form onSubmit={handleCommentSubmit} className="mb-10">
              <div className="mb-3">
                <textarea 
                  rows={3}
                  placeholder="Chia sẻ ý kiến của bạn..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-4 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                ></textarea>
                {commentError && <p className="mt-2 text-sm text-red-600">{commentError}</p>}
              </div>
              <div className="flex justify-end">
                <button 
                  type="submit"
                  className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  <Send className="h-4 w-4" /> Gửi bình luận
                </button>
              </div>
            </form>

            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-4">
                  <img src={comment.avatar} alt={comment.user} className="h-12 w-12 rounded-full object-cover bg-gray-100" />
                  <div className="flex-1">
                    <div className="rounded-2xl rounded-tl-none bg-gray-50 p-4 border border-gray-100">
                      <div className="mb-1 flex items-center justify-between">
                        <h4 className="font-bold text-gray-900">{comment.user}</h4>
                        <span className="text-xs text-gray-500">{comment.time}</span>
                      </div>
                      <p className="text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">
              Bài viết liên quan
            </h3>
            <div className="space-y-6">
              {articles.filter(a => a.id !== id).slice(0, 4).map((related) => (
                <Link key={related.id} to={`/article/${related.id}`} className="group flex gap-4">
                  <div className="h-20 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                    <img src={related.image} alt={related.title} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  </div>
                  <div className="flex flex-1 flex-col justify-center">
                    <h4 className="mb-1 text-sm font-bold leading-tight text-gray-900 group-hover:text-blue-600 line-clamp-2">
                      {related.title}
                    </h4>
                    <span className="text-xs text-gray-500">{related.date}</span>
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
