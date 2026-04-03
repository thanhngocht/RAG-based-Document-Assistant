import api from '../lib/api';

/**
 * Đăng nhập
 * @param {Object} loginData - Dữ liệu đăng nhập
 * @param {string} loginData.identifier - Username hoặc Email
 * @param {string} loginData.password - Mật khẩu
 * @returns {Promise} Response từ server
 */
export const loginUser = async (loginData) => {
  try {
    // Chuẩn bị payload
    const payload = {
      identifier: String(loginData.identifier || ""),
      password: String(loginData.password || ""),
    };

    console.log("API payload:", payload); // Debug log

    const response = await api.post('/auth/login', payload);

    // Lưu token và thông tin user vào localStorage
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      localStorage.setItem('role', response.data.role);
    }

    return response.data;
  } catch (error) {
    // Ném lỗi để component xử lý
    throw error;
  }
};

/**
 * Đăng xuất
 */
export const logoutUser = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
  localStorage.removeItem('role');
};

/**
 * Kiểm tra xem user đã đăng nhập chưa
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('access_token');
};

/**
 * Lấy thông tin user hiện tại
 * @returns {Object|null}
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};
