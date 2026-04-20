import { useState } from "react";
import { vipPackages as initialPackages } from "../../lib/mock-data";
import { Edit2, Plus, Save, X } from "lucide-react";

export function ManageVIP() {
  const [packages, setPackages] = useState(initialPackages);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const handleEditClick = (pkg: any) => {
    setEditingId(pkg.id);
    setEditForm({ ...pkg, features: pkg.features.join('\n') });
  };

  const handleSave = () => {
    setPackages(packages.map(p => 
      p.id === editingId 
        ? { ...editForm, features: editForm.features.split('\n').filter((f: string) => f.trim()) }
        : p
    ));
    setEditingId(null);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Quản lý Gói VIP</h2>
        <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
          <Plus className="h-4 w-4" /> Thêm gói mới
        </button>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-sm font-semibold text-gray-700">
            <tr>
              <th className="px-6 py-4">Tên gói</th>
              <th className="px-6 py-4">Giá tiền</th>
              <th className="px-6 py-4">Thời gian</th>
              <th className="px-6 py-4">Quyền lợi</th>
              <th className="px-6 py-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
            {packages.map((pkg) => (
              <tr key={pkg.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-bold text-gray-900">{pkg.name}</td>
                <td className="px-6 py-4 font-medium text-amber-600">{pkg.price}</td>
                <td className="px-6 py-4">{pkg.duration}</td>
                <td className="px-6 py-4 max-w-xs">
                  <ul className="list-disc pl-4 text-xs text-gray-500 space-y-1">
                    {pkg.features.map((f, i) => <li key={i} className="truncate">{f}</li>)}
                  </ul>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleEditClick(pkg)}
                    className="inline-flex items-center gap-1 rounded border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                  >
                    <Edit2 className="h-3 w-3" /> Chỉnh sửa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-xl font-bold text-gray-900">Chỉnh sửa Gói VIP</h3>
              <button onClick={() => setEditingId(null)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Tên gói</label>
                <input 
                  type="text" 
                  value={editForm.name}
                  onChange={e => setEditForm({...editForm, name: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Giá tiền</label>
                  <input 
                    type="text" 
                    value={editForm.price}
                    onChange={e => setEditForm({...editForm, price: e.target.value})}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" 
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Thời gian</label>
                  <input 
                    type="text" 
                    value={editForm.duration}
                    onChange={e => setEditForm({...editForm, duration: e.target.value})}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" 
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Quyền lợi (mỗi dòng 1 quyền lợi)</label>
                <textarea 
                  rows={4}
                  value={editForm.features}
                  onChange={e => setEditForm({...editForm, features: e.target.value})}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none resize-none" 
                ></textarea>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button 
                onClick={() => setEditingId(null)}
                className="px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Hủy
              </button>
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2 font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
              >
                <Save className="h-4 w-4" /> Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
