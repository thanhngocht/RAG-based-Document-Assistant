import { redirect } from 'react-router-dom';
import { isAuthenticated } from '../actions/loginActions';

/**
 * Loader cho protected routes
 * Kiểm tra authentication trước khi render route
 * Redirect về /login nếu chưa đăng nhập
 */
export const protectedLoader = () => {
  if (!isAuthenticated()) {
    return redirect('/login');
  }
  return null;
};

/**
 * Loader cho public routes (login, register)
 * Redirect về / nếu đã đăng nhập
 */
export const publicLoader = () => {
  if (isAuthenticated()) {
    return redirect('/');
  }
  return null;
};
