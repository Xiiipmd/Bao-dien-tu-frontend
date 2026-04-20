import { useState } from "react";
import { CheckCircle, XCircle, Eye } from "lucide-react";

// Mock data for pending posts
const pendingPosts = [
  { id: 101, title: "Đánh giá chi tiết iPhone 15 Pro Max", author: "Lê Minh", date: "21/10/2023", category: "Công nghệ", content: "Nội dung bài đánh giá..." },
  { id: 102, title: "Bí quyết đầu tư chứng khoán cho người mới", author: "Trần Tài", date: "21/10/2023", category: "Kinh doanh", content: "Nội dung bài viết..." },
];

export function ApprovePost() {
  const [posts, setPosts] = useState(pendingPosts);
  const [selectedPost, setSelectedPost] = useState<typeof pendingPosts[0] | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleApprove = (id: number) => {
    setPosts(posts.filter(p => p.id !== id));
    setSelectedPost(null);
  };

  const handleReject = () => {
    if (selectedPost) {
      setPosts(posts.filter(p => p.id !== selectedPost.id));
      setShowRejectModal(false);
      setSelectedPost(null);
      setRejectReason("");
    }
  };

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-gray-900">Duyệt bài viết</h2>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* List */}
        <div className="lg:col-span-5 rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden flex flex-col h-[calc(100vh-160px)]">
          <div className="p-4 border-b border-gray-100 bg-gray-50 font-semibold text-gray-700">
            Danh sách chờ duyệt ({posts.length})
          </div>
          <div className="flex-1 overflow-auto p-2 space-y-2">
            {posts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Không có bài viết nào chờ duyệt.</div>
            ) : (
              posts.map(post => (
                <div 
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className={`cursor-pointer rounded-lg p-4 border transition-colors ${selectedPost?.id === post.id ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:bg-gray-50'}`}
                >
                  <h4 className="font-bold text-gray-900 line-clamp-2 mb-2">{post.title}</h4>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{post.author}</span>
                    <span>{post.date}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Detail View */}
        <div className="lg:col-span-7 rounded-xl border border-gray-100 bg-white shadow-sm h-[calc(100vh-160px)] flex flex-col">
          {selectedPost ? (
            <>
              <div className="flex-1 overflow-auto p-8">
                <span className="inline-block px-2 py-1 bg-gray-100 text-xs font-semibold text-gray-600 rounded mb-4 uppercase tracking-wider">{selectedPost.category}</span>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{selectedPost.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 border-b border-gray-100 pb-4">
                  <span>Bởi: <strong>{selectedPost.author}</strong></span>
                  <span>Ngày gửi: {selectedPost.date}</span>
                </div>
                <div className="prose max-w-none">
                  <p>{selectedPost.content}</p>
                  <p className="text-gray-400 italic mt-10">[Nội dung bài viết được hiển thị đầy đủ tại đây...]</p>
                </div>
              </div>
              <div className="border-t border-gray-100 p-4 bg-gray-50 flex justify-end gap-3">
                <button 
                  onClick={() => setShowRejectModal(true)}
                  className="flex items-center gap-2 rounded-lg border border-red-200 bg-white text-red-600 px-4 py-2 font-semibold hover:bg-red-50 transition-colors"
                >
                  <XCircle className="h-4 w-4" /> Từ chối
                </button>
                <button 
                  onClick={() => handleApprove(selectedPost.id)}
                  className="flex items-center gap-2 rounded-lg bg-emerald-600 text-white px-6 py-2 font-semibold hover:bg-emerald-700 transition-colors"
                >
                  <CheckCircle className="h-4 w-4" /> Phê duyệt xuất bản
                </button>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-gray-400">
              <Eye className="mb-4 h-12 w-12 opacity-20" />
              <p>Chọn một bài viết để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="mb-4 text-xl font-bold text-gray-900">Lý do từ chối</h3>
            <textarea 
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối để tác giả chỉnh sửa..."
              className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-blue-500 focus:outline-none mb-4 resize-none"
            ></textarea>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Hủy
              </button>
              <button 
                onClick={handleReject}
                className="px-4 py-2 font-semibold bg-red-600 text-white hover:bg-red-700 rounded-lg"
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
