# Hướng dẫn kết nối Backend Register với Frontend

## ✅ Đã hoàn thành

### 1. Cài đặt axios
- Đã cài đặt axios vào frontend để gọi API

### 2. Tạo API Service Layer
- **File**: `/frontend/src/lib/api.js`
- Tạo axios instance với cấu hình:
  - Base URL: `http://localhost:8000/api/v1`
  - Timeout: 10 seconds
  - Auto thêm Bearer token vào header
  - Xử lý lỗi tự động (401 redirect to login)

### 3. Implement Register Actions
- **File**: `/frontend/src/actions/registerActions.js`
- Function `registerUser()` để gọi API đăng ký
- Tự động lưu access_token và user info vào localStorage
- Xử lý lỗi từ backend

### 4. Cập nhật Register Page
- **File**: `/frontend/src/pages/Register.jsx`
- Thay đổi từ React Router `<Form>` sang `<form>` với `onSubmit` handler
- Thêm state management: `isLoading`, `error`
- Xử lý submit form và gọi API
- Hiển thị loading state và error messages
- Redirect về trang chủ sau khi đăng ký thành công

### 5. Environment Configuration
- **File**: `/frontend/.env`
- Cấu hình `VITE_API_URL=http://localhost:8000/api/v1`

## 🚀 Cách chạy và test

### Bước 1: Khởi động Backend
```bash
cd /Users/ngochuynh/Desktop/demo/backend
source .venv/bin/activate  # hoặc .venv\Scripts\activate trên Windows
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend sẽ chạy tại: `http://localhost:8000`

### Bước 2: Khởi động Frontend
```bash
cd /Users/ngochuynh/Desktop/demo/frontend
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

### Bước 3: Test đăng ký
1. Mở trình duyệt: `http://localhost:5173/register`
2. Điền thông tin:
   - Full name: Nguyễn Văn A
   - Email: test@example.com
   - Username: testuser
   - Password: 123456 (tối thiểu 6 ký tự)
3. Click "Tạo tài khoản"
4. Kiểm tra:
   - Console log: "Đăng ký thành công"
   - localStorage: access_token và user được lưu
   - Redirect về trang chủ (/)

## 📝 API Endpoint Details

### POST `/api/v1/auth/register`

**Request Body:**
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "123456",
  "full_name": "Nguyễn Văn A"
}
```

**Success Response (200):**
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "role": "user",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "testuser",
    "email": "test@example.com",
    "full_name": "Nguyễn Văn A",
    "role": "user",
    "is_active": true,
    "created_at": "2024-01-15T10:30:00+00:00"
  }
}
```

**Error Responses:**
- `409 Conflict`: Username hoặc email đã tồn tại
  ```json
  {"detail": "Username đã tồn tại"}
  ```
- `422 Unprocessable Entity`: Dữ liệu không hợp lệ (validation error)

## 🔍 Debugging

### Kiểm tra Backend
```bash
# Test backend endpoint
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com", 
    "password": "123456",
    "full_name": "Test User"
  }'
```

### Kiểm tra Frontend
- Mở Developer Console (F12)
- Tab Network: xem request/response
- Tab Console: xem error logs
- Tab Application > Local Storage: kiểm tra token đã lưu

### Common Issues

1. **CORS Error**: Backend đã cấu hình CORS cho `localhost:5173`, nếu frontend chạy port khác cần cập nhật trong `backend/app/main.py`

2. **Connection Refused**: Kiểm tra backend đang chạy trên đúng port 8000

3. **422 Validation Error**: Kiểm tra dữ liệu input:
   - Username: 3-50 ký tự
   - Email: format hợp lệ
   - Password: 6-128 ký tự

4. **409 Conflict**: Username hoặc email đã được đăng ký, thử username/email khác

## 📂 Files đã tạo/sửa

### Created:
- ✅ `/frontend/src/lib/api.js` - Axios configuration
- ✅ `/frontend/src/actions/registerActions.js` - Register API actions
- ✅ `/frontend/.env` - Environment variables
- ✅ `/frontend/.env.example` - Environment template

### Modified:
- ✅ `/frontend/src/pages/Register.jsx` - Updated with API integration
- ✅ `/frontend/package.json` - Added axios dependency

## 🎯 Next Steps (Optional)

1. **Thêm validation phía client** trước khi gửi request
2. **Toast notifications** thay vì error text đơn giản
3. **Loading spinner** cho UX tốt hơn
4. **Email verification** flow
5. **Password strength indicator**
6. **Tạo trang Login** tương tự
