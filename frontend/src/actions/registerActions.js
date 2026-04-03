import api from '../lib/api';

/**
 * Đăng ký tài khoản mới
 * @param {Object} userData - Dữ liệu người dùng
 * @param {string} userData.username - Tên đăng nhập
 * @param {string} userData.email - Email
 * @param {string} userData.password - Mật khẩu
 * @param {string} userData.full_name - Họ tên (optional)
 * @returns {Promise} Response từ server
 */
export const registerUser = async (userData) => {
  try {
    // Chuẩn bị payload, chỉ gửi các field có giá trị
    const payload = {
      username: String(userData.username || ""),
      email: String(userData.email || ""),
      password: String(userData.password || ""),
    };
    
    // Chỉ thêm full_name nếu có giá trị
    if (userData.full_name || userData.name) {
      payload.full_name = String(userData.full_name || userData.name);
    }

    console.log("API payload:", payload); // Debug log

    const response = await api.post('/auth/register', payload);

    // Lưu token và thông tin user vào localStorage
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  } catch (error) {
    // Ném lỗi để component xử lý
    throw error;
  }
};

/**
 * Kiểm tra xem username đã tồn tại chưa
 * @param {string} username
 * @returns {Promise<boolean>}
 */
export const checkUsernameExists = async (username) => {
  try {
    // Backend có thể cần thêm endpoint này, tạm thời return false
    return false;
  } catch (error) {
    console.error('Error checking username:', error);
    return false;
  }
};

/**
 * Kiểm tra xem email đã tồn tại chưa
 * @param {string} email
 * @returns {Promise<boolean>}
 */
export const checkEmailExists = async (email) => {
  try {
    // Backend có thể cần thêm endpoint này, tạm thời return false
    return false;
  } catch (error) {
    console.error('Error checking email:', error);
    return false;
  }
};
