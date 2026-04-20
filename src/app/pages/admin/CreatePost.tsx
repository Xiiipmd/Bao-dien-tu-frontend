import { Upload, Save, Send } from "lucide-react";
import { categories } from "../../lib/mock-data";

export function CreatePost() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Viết bài mới</h2>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            <Save className="h-4 w-4" /> Lưu nháp
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
            <Send className="h-4 w-4" /> Xuất bản
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-8">
        <form className="space-y-6">
          {/* Title */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900">Tiêu đề bài viết</label>
            <input 
              type="text" 
              placeholder="Nhập tiêu đề (tối đa 100 ký tự)" 
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg font-medium text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">Danh mục</label>
              <select className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option value="">Chọn danh mục</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* VIP Toggle */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">Loại nội dung</label>
              <div className="flex h-[50px] items-center gap-6 rounded-lg border border-gray-300 px-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="contentType" value="free" defaultChecked className="h-4 w-4 text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm font-medium text-gray-700">Miễn phí</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="contentType" value="vip" className="h-4 w-4 text-amber-600 focus:ring-amber-500" />
                  <span className="text-sm font-medium text-amber-600">Bài viết VIP</span>
                </label>
              </div>
            </div>
          </div>

          {/* Cover Image */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900">Ảnh bìa (Cover)</label>
            <div className="flex justify-center rounded-xl border-2 border-dashed border-gray-300 px-6 py-10 hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="text-center">
                <Upload className="mx-auto h-10 w-10 text-gray-400" />
                <div className="mt-4 flex text-sm text-gray-600">
                  <span className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 focus-within:outline-none hover:text-blue-500">
                    Tải ảnh lên
                  </span>
                  <p className="pl-1">hoặc kéo thả vào đây</p>
                </div>
                <p className="text-xs text-gray-500 mt-2">PNG, JPG, GIF lên đến 5MB</p>
              </div>
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900">Tóm tắt ngắn</label>
            <textarea 
              rows={3} 
              placeholder="Viết một đoạn tóm tắt ngắn để thu hút người đọc..."
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            ></textarea>
          </div>

          {/* Content Editor Mock */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-900">Nội dung bài viết</label>
            <div className="rounded-lg border border-gray-300 overflow-hidden">
              {/* Toolbar mock */}
              <div className="bg-gray-50 border-b border-gray-300 p-2 flex gap-2">
                {['B', 'I', 'U'].map((btn) => (
                  <button key={btn} type="button" className="h-8 w-8 rounded font-serif font-bold text-gray-700 hover:bg-gray-200">{btn}</button>
                ))}
                <div className="w-px bg-gray-300 mx-1"></div>
                <button type="button" className="px-3 py-1 rounded text-sm font-medium text-gray-700 hover:bg-gray-200">H1</button>
                <button type="button" className="px-3 py-1 rounded text-sm font-medium text-gray-700 hover:bg-gray-200">H2</button>
              </div>
              <textarea 
                rows={15} 
                placeholder="Bắt đầu viết nội dung tại đây..."
                className="w-full p-4 text-gray-800 focus:outline-none resize-y"
              ></textarea>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
