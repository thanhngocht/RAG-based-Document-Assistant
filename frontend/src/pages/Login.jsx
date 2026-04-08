import { useState } from "react";
import { Link, useNavigate, useNavigation} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
// components
import PageTitle from "../components/PageTitle";
import TextField from "../components/TextField";
import { Button } from "../components/Button";

// hooks
import { useSnackbar } from "../hooks/useSnackbar";

// actions
import { loginUser } from "../actions/loginActions";
import { CircularProgress, LinearProgress  }  from "../components/Progress";

const Login = () => {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { showSnackbar } = useSnackbar();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.target);
    
    const loginData = {
      identifier: (formData.get("identifier") || "").toString().trim(),
      password: (formData.get("password") || "").toString(),
    };

    try {
      const response = await loginUser(loginData);
      console.log("Đăng nhập thành công:", response);
      
      // Chuyển hướng ngay
      navigate("/");
    } catch (err) {
      console.error("Đăng nhập thất bại:", err);
      
      // Error từ api.js interceptor đã được parse thành string
      const errorMessage = typeof err === 'string' 
        ? err 
        : (err?.response?.data?.detail 
          || err?.response?.data?.message 
          || err?.message 
          || 'Đăng nhập thất bại. Vui lòng thử lại.');
      
      // Hiển thị thông báo lỗi
      showSnackbar({ 
        message: errorMessage, 
        type: 'error', 
        timeOut: 5000 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageTitle title="Đăng nhập" />
      <div className="w-screen h-dvh flex items-center justify-center">
        <div className="flex flex-col p-4 w-full">
          <div className="glass rounded-3xl p-8 flex flex-col gap-2 max-w-[480px] w-full mx-auto">
            <h2
              className="text-displaySmall font-semibold
            text-light-onBackground
            dark:text-dark-onBackground text-center"
            >
              Đăng nhập
            </h2>
            <p
              className="text-bodyLarge
            text-light-onSurfaceVariant
            dark:text-dark-onSurfaceVariant mt-1 mb-5 text-center px-2"
            >
              Chào mừng trở lại! Đăng nhập để tiếp tục
            </p>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 mt-4">
              <TextField
                label="Username hoặc Email"
                name="identifier"
                type="text"
                placeholder="Username hoặc Email"
                required={true}
                autoFocus={true}
              />
              
              <TextField
                label="Mật khẩu"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Mật khẩu"
                required={true}
              />

              <div className="flex justify-between items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="w-5 h-5 rounded border-light-outline dark:border-dark-outline"
                  />
                  <span className="text-bodyMedium text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
                    Hiển thị mật khẩu
                  </span>
                </label>
                <Link
                  to="/forgot-password"
                  className="text-bodyMedium link
                text-light-primary dark:text-dark-primary
                hover:text-light-onSurface dark:hover:text-dark-onSurface font-medium"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              <Button type="submit" disabled={isLoading}>
       
                {isLoading ? (
                <CircularProgress size="small" />
                ) : (
                  "Đăng nhập"
                )}
              </Button>
            </form>
            <p className="text-bodyMedium text-light-onSurface dark:text=dark-onSurface">
              Chưa có tài khoản?
              <Link
                to="/register"
                className="link inline-block ms-1
              text-light-onSurface dark:text-dark-onSurface"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {navigation.state === 'loading' && (
          <LinearProgress classes="absolute top-0 left-0 right-0" />
        )}
      </AnimatePresence>
    </>
  );
};

export default Login;
