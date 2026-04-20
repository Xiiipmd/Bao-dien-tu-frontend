import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { dashboardStats, articles } from '../../lib/mock-data';
import { FileText, Eye, DollarSign, TrendingUp } from 'lucide-react';

export function Dashboard() {
  const statCards = [
    { title: "Tổng bài viết", value: dashboardStats.totalPosts, icon: FileText, trend: "+12%", color: "text-blue-600", bg: "bg-blue-100" },
    { title: "Lượt xem tháng này", value: dashboardStats.totalViews, icon: Eye, trend: "+25%", color: "text-emerald-600", bg: "bg-emerald-100" },
    { title: "Doanh thu VIP", value: dashboardStats.revenue, icon: DollarSign, trend: "+8%", color: "text-amber-600", bg: "bg-amber-100" },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <h3 className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</h3>
                </div>
                <div className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.bg}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="mr-1 h-4 w-4 text-emerald-500" />
                <span className="font-medium text-emerald-500">{stat.trend}</span>
                <span className="ml-2 text-gray-500">so với tháng trước</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-bold text-gray-900">Lượt truy cập (Tuần)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardStats.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="views" name="Lượt xem" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-6 text-lg font-bold text-gray-900">Doanh thu VIP (Tháng)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardStats.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Line type="monotone" dataKey="revenue" name="Doanh thu" stroke="#F59E0B" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Posts Table */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Bài viết gần đây</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Tiêu đề</th>
                <th className="px-6 py-4 font-semibold">Danh mục</th>
                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                <th className="px-6 py-4 font-semibold text-right">Lượt xem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {articles.slice(0, 5).map((article) => (
                <tr key={article.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900 line-clamp-1 max-w-[300px]">{article.title}</td>
                  <td className="px-6 py-4 uppercase text-xs font-bold">{article.category}</td>
                  <td className="px-6 py-4">
                    {article.isVip ? (
                      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">VIP</span>
                    ) : (
                      <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">Free</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right font-medium">{article.views.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
