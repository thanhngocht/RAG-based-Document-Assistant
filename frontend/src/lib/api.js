import axios from 'axios';

// Tạo axios instance với cấu hình mặc định
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 120000, // 120 seconds - enough for LLM processing
});

// Request interceptor - thêm token vào header nếu có
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper function để parse error message
const parseErrorMessage = (data) => {
  // Nếu có detail và là string
  if (data.detail && typeof data.detail === 'string') {
    return data.detail;
  }
  
  // Nếu có detail và là array (Pydantic validation errors)
  if (data.detail && Array.isArray(data.detail)) {
    return data.detail.map(err => {
      const field = err.loc ? err.loc[err.loc.length - 1] : 'field';
      return `${field}: ${err.msg}`;
    }).join(', ');
  }
  
  // Nếu có message
  if (data.message && typeof data.message === 'string') {
    return data.message;
  }
  
  // Default error
  return 'Đã có lỗi xảy ra';
};

// Response interceptor - xử lý lỗi chung
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Server trả về lỗi
      const { status, data } = error.response;
      
      if (status === 401) {
        // Chỉ redirect nếu đang có token (token hết hạn)
        // Không redirect nếu đang login (chưa có token)
        const hasToken = localStorage.getItem('access_token');
        if (hasToken) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('user');
          localStorage.removeItem('role');
          window.location.href = '/login';
        }
      }
      
      // Parse error message but keep the original error object
      const errorMessage = parseErrorMessage(data);
      // Create new error with message but preserve response info
      const enrichedError = new Error(errorMessage);
      enrichedError.response = error.response;
      enrichedError.request = error.request;
      enrichedError.config = error.config;
      enrichedError.status = status;
      return Promise.reject(enrichedError);
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      const networkError = new Error('Không thể kết nối đến server');
      networkError.request = error.request;
      networkError.config = error.config;
      return Promise.reject(networkError);
    } else {
      // Lỗi khác
      return Promise.reject(error);
    }
  }
);

export default api;
