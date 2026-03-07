# ⚡ QUICK TEST IPN - 3 BƯỚC

## Bước 1: Cài axios (nếu chưa có)
```bash
cd backend
npm install axios
```

## Bước 2: Khởi động backend
```bash
npm start
```

## Bước 3: Test IPN (Terminal mới)
```bash
cd backend
node src/scripts/testIPN.js YOUR_ORDER_ID
```

## ✅ Kết quả mong đợi

Trong terminal backend, bạn sẽ thấy:

```
================================================================================
[IPN RECEIVED] 2026-02-03T...
================================================================================
📥 Query Parameters: {...}
🔐 Verification Result:
  - Is Verified: true
  - Is Success: true
...
✅✅✅ IPN PROCESSED SUCCESSFULLY ✅✅✅
================================================================================
```

**→ Điều này chứng minh backend ĐÃ NHẬN ĐƯỢC callback từ IPN!**

## 📖 Chi tiết đầy đủ

Xem file [TEST_IPN_GUIDE.md](TEST_IPN_GUIDE.md) để biết thêm chi tiết và các cách test khác.

## 🔧 Troubleshooting

- **Không có logs?** → Kiểm tra backend đang chạy
- **Order not found?** → Tạo order trước, lấy đúng ORDER_ID
- **Invalid checksum?** → Kiểm tra VNPAY_SECURE_SECRET trong .env
