import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Test logic account
    if (email === "aaa" && password === "123") {
      login(email, true); // Đăng nhập với quyền VIP
      navigate("/");
    } else if (email && password) {
      login(email, false); // Tài khoản thường
      navigate("/");
    } else {
      setError(true);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl shadow-gray-200/50">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Chào mừng trở lại</h1>
          <p className="mt-2 text-sm text-gray-600">Đăng nhập để tiếp tục đọc tin tức</p>
          
          <div className="mt-4 bg-amber-50 text-amber-800 text-xs p-3 rounded-lg border border-amber-200 text-left">
            <strong>Gợi ý tài khoản:</strong><br/>
            - VIP: Tài khoản <b>aaa</b> / Mật khẩu <b>123</b><br/>
            - Thường: Bất kỳ tài khoản nào khác
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Tài khoản, Email hoặc SĐT</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email, SĐT hoặc aaa" 
                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu" 
                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                Vui lòng nhập đầy đủ thông tin.
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input 
                id="remember" 
                type="checkbox" 
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                Ghi nhớ đăng nhập
              </label>
            </div>
            <Link to="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              Quên mật khẩu?
            </Link>
          </div>

          <button 
            type="submit" 
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Đăng nhập
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          Chưa có tài khoản?{" "}
          <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-500">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
