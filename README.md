# NewsDaily Web

Giao diện web của hệ thống báo điện tử, xây dựng bằng Vue 3, TypeScript, Pinia, Tailwind CSS và Vite.

## Chạy dự án

```powershell
cd D:\app\Bao-dien-tu-frontend
npm install
npm run dev
```

Web chạy mặc định tại `http://localhost:5173` và Vite chuyển tiếp các request `/api` tới backend local.

## Kiểm tra production build

```powershell
npm run build
```

## Thanh toán Visa thử nghiệm

Trang gói VIP hỗ trợ thẻ mẫu:

```text
Số thẻ: 4242 4242 4242 4242
Chủ thẻ: NGUYEN VAN LONG
Hết hạn: 12/30
CVV: 123
```

Trước khi demo, bật endpoint thử nghiệm trong terminal chạy backend:

```powershell
$env:TMDT_DEMO_CARD_PAYMENT_ENABLED="true"
```

Trình duyệt chỉ kiểm tra thẻ mẫu ở phía giao diện. Số thẻ, hạn thẻ và CVV không được gửi hoặc lưu trên backend. Phải giữ chế độ này ở trạng thái tắt khi triển khai production.
