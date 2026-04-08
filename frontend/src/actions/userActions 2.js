import api from '../lib/api';

/**
 * Lấy danh sách users (Admin only)
 * @returns {Promise} Response với danh sách users
 */
export const getUsers = async () => {
  try {
    const response = await api.get('/admin/users');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Tạo user mới (Admin only)
 * @param {Object} userData - Dữ liệu user
 * @param {string} userData.username - Username
 * @param {string} userData.email - Email
 * @param {string} userData.password - Password
 * @param {string} userData.full_name - Họ tên
 * @param {string} userData.role - Role (admin/user)
 * @returns {Promise} Response với user được tạo
 */
export const createUser = async (userData) => {
  try {
    const response = await api.post('/admin/users', userData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Cập nhật user (Admin only)
 * @param {string} userId - ID của user
 * @param {Object} updateData - Dữ liệu cần update
 * @param {string} updateData.full_name - Họ tên
 * @param {string} updateData.password - Password mới (optional)
 * @param {string} updateData.role - Role (admin/user)
 * @param {boolean} updateData.is_active - Trạng thái active
 * @returns {Promise} Response với user đã được cập nhật
 */
export const updateUser = async (userId, updateData) => {
  try {
    const response = await api.patch(`/admin/users/${userId}`, updateData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Xóa user (Admin only)
 * @param {string} userId - ID của user
 * @returns {Promise} Response với message
 */
export const deleteUser = async (userId) => {
  try {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
