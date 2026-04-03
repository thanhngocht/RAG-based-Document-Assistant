import { redirect } from 'react-router-dom';

/**
 * Logout action - xử lý đăng xuất
 * Xóa thông tin user và token khỏi localStorage
 * Redirect về trang login
 * @returns {Response} Redirect response
 */
export const logoutAction = async () => {
  try {
    // Xóa thông tin authentication
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    
    // Redirect về trang login
    return redirect('/login');
  } catch (error) {
    console.error('Logout error:', error);
    return redirect('/login');
  }
};
