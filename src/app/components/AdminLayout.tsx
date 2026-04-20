import { Outlet, Link, useLocation } from "react-router";
import { LayoutDashboard, FileText, CheckSquare, Crown, LogOut, Search } from "lucide-react";
import clsx from "clsx";

const navItems = [
  { path: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { path: "/admin/posts/create", label: "Đăng bài mới", icon: FileText },
  { path: "/admin/posts/approval", label: "Duyệt bài", icon: CheckSquare },
  { path: "/admin/vip", label: "Gói VIP", icon: Crown },
];

export function AdminLayout() {
  const location = useLocation();

  return (
    <div className="flex h-screen w-full bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col bg-slate-900 text-white">
        <div className="flex h-16 items-center px-6 border-b border-slate-800">
          <Link to="/" className="flex items-center gap-2 text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 font-bold text-xl">
              N
            </div>
            <span className="text-xl font-bold tracking-tight">Admin Panel</span>
          </Link>
        </div>
        
        <nav className="flex-1 space-y-1 px-3 py-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact 
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={clsx(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-blue-600 text-white" 
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link to="/" className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
            <LogOut className="h-5 w-5" />
            Trở về Website
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-8 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-800">
            {navItems.find(item => 
              item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path)
            )?.label || "Quản trị"}
          </h1>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Tìm kiếm..." 
                className="h-9 rounded-full bg-gray-100 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-100 focus:bg-white border border-transparent focus:border-blue-200"
              />
            </div>
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 cursor-pointer" />
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-8">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
