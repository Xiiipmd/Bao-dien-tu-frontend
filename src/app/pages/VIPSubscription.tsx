import { Crown, CheckCircle2, CreditCard, QrCode, Wallet } from "lucide-react";
import { vipPackages } from "../lib/mock-data";
import { useState } from "react";

export function VIPSubscription() {
  const [selectedPackage, setSelectedPackage] = useState(vipPackages[1].id);
  const [paymentMethod, setPaymentMethod] = useState("qr");

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-900 py-16 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <Crown className="mx-auto mb-4 h-16 w-16 text-amber-500" />
          <h1 className="mb-4 text-3xl font-bold text-white md:text-5xl">Nâng cấp VIP</h1>
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            Mở khóa toàn bộ kho tàng tri thức, đọc bài không giới hạn và tận hưởng trải nghiệm không quảng cáo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 max-w-4xl mx-auto">
          {vipPackages.map((pkg) => (
            <div 
              key={pkg.id}
              onClick={() => setSelectedPackage(pkg.id)}
              className={`relative cursor-pointer rounded-2xl border-2 p-8 transition-all duration-300 ${
                selectedPackage === pkg.id 
                  ? 'border-amber-500 bg-slate-800 scale-105 shadow-2xl shadow-amber-500/20' 
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-500'
              }`}
            >
              {pkg.id === "1yr" && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-4 py-1 text-xs font-bold text-white uppercase tracking-wider">
                  Phổ biến nhất
                </div>
              )}
              
              <h3 className="mb-2 text-2xl font-bold text-white">{pkg.name}</h3>
              <div className="mb-6 flex items-baseline gap-2 border-b border-slate-700 pb-6">
                <span className="text-4xl font-black text-amber-500">{pkg.price}</span>
                <span className="text-slate-400">/{pkg.duration}</span>
              </div>
              
              <ul className="space-y-4">
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-slate-300">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Payment Section */}
        <div className="max-w-2xl mx-auto rounded-2xl bg-white p-8 shadow-xl">
          <h3 className="mb-6 text-xl font-bold text-gray-900">Phương thức thanh toán</h3>
          
          <div className="grid grid-cols-3 gap-4 mb-8">
            <button 
              onClick={() => setPaymentMethod('qr')}
              className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 p-4 transition-colors ${paymentMethod === 'qr' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <QrCode className="h-8 w-8" />
              <span className="text-sm font-semibold">Chuyển khoản QR</span>
            </button>
            <button 
              onClick={() => setPaymentMethod('wallet')}
              className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 p-4 transition-colors ${paymentMethod === 'wallet' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <Wallet className="h-8 w-8" />
              <span className="text-sm font-semibold">Ví điện tử</span>
            </button>
            <button 
              onClick={() => setPaymentMethod('card')}
              className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 p-4 transition-colors ${paymentMethod === 'card' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <CreditCard className="h-8 w-8" />
              <span className="text-sm font-semibold">Thẻ tín dụng</span>
            </button>
          </div>

          <button className="w-full rounded-xl bg-amber-500 py-4 text-lg font-bold text-white transition-colors hover:bg-amber-600 shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2">
            Thanh toán {vipPackages.find(p => p.id === selectedPackage)?.price}
          </button>
          <p className="mt-4 text-center text-sm text-gray-500">
            Thanh toán an toàn và bảo mật 100%. Có thể hủy bất kỳ lúc nào.
          </p>
        </div>
      </div>
    </div>
  );
}
