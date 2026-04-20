import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";

export function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const name = formData.get("name") as string;

    const newErrors: Record<string, string> = {};

    if (!name || name.length < 2) {
      newErrors.name = "Họ tên phải có ít nhất 2 ký tự";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    if (password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Success
    setErrors({});
    navigate("/login");
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl shadow-gray-200/50">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Tạo tài khoản</h1>
          <p className="mt-2 text-sm text-gray-600">Đăng ký để trải nghiệm đầy đủ tính năng</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Họ và tên</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input 
                name="name"
                type="text" 
                placeholder="Nhập họ và tên" 
                className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
              />
            </div>
            {errors.name && <p className="mt-1.5 text-xs text-red-600">{errors.name}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input 
                name="email"
                type="email" 
                placeholder="Nhập địa chỉ email" 
                required
                className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input 
                name="password"
                type={showPassword ? "text" : "password"} 
                placeholder="Nhập mật khẩu" 
                className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:ring-1 ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input 
                name="confirmPassword"
                type={showPassword ? "text" : "password"} 
                placeholder="Nhập lại mật khẩu" 
                className={`w-full rounded-lg border bg-white py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-1 ${errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'}`}
              />
            </div>
            {errors.confirmPassword && <p className="mt-1.5 text-xs text-red-600">{errors.confirmPassword}</p>}
          </div>

          <button 
            type="submit" 
            className="w-full mt-4 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Đăng ký
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-600">
          Đã có tài khoản?{" "}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
