import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// components
import PageTitle from "../components/PageTitle";
import TextField from "../components/TextField";
import { Button } from "../components/Button";

// actions
import { registerUser } from "../actions/registerActions";

const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const formData = new FormData(e.target);
    
    // Lấy dữ liệu và đảm bảo chúng là string
    const userData = {
      name: (formData.get("name") || "").toString().trim(),
      email: (formData.get("email") || "").toString().trim(),
      username: (formData.get("username") || "").toString().trim(),
      password: (formData.get("password") || "").toString(),
    };

    console.log("Sending data:", userData); // Debug log

    try {
      const response = await registerUser(userData);
      console.log("Đăng ký thành công:", response);
      
      // Redirect đến trang chủ hoặc dashboard sau khi đăng ký thành công
      navigate("/");
    } catch (err) {
      console.error("Đăng ký thất bại:", err);
      
      // Đảm bảo error message luôn là string
      const errorMessage = typeof err === 'string' 
        ? err 
        : err?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageTitle title="Tạo tài khoản" />
      <div className="w-screen h-dvh flex items-center justify-center">
        <div className="flex flex-col p-4 w-full">
          
          {/* <Link to="/"
          className="max-w-max mb-auto mx-auto lg:mx-0">
            <img src="/logo.png" alt="" width={133} height={24}/>

          </Link> */}

          <div className="glass rounded-3xl p-10 flex flex-col gap-2 max-w-[480px] w-full mx-auto">
            <h2
              className="text-displaySmall font-semibold
            text-light-onBackground
            dark:text-dark-onBackground text-center"
            >
              Tạo tài khoản
            </h2>
            {/* <p
              className="text-bodyLarge
            text-light-onSurfaceVariant
            dark:text-dark-onSurfaceVariant mt-1 mb-5 text-center px-2"
            >
              Tham gia ngay để khám phá sức mạnh của chatbot AI
            </p> */}

            {error && (
              <p className="text-red-600 dark:text-red-400 text-bodyMedium text-center mb-2">
                {error}
              </p>
            )}

            <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 mt-4">
              <TextField
                label="Họ và tên"
                name="name"
                type="text"
                placeholder="Họ và tên"
                required={true}
                autoFocus={true}
                
              />
              <TextField
                label="Email"
                name="email"
                type="email"
                placeholder="Email"
                required={true}
              />
              <TextField
                label="Username"
                name="username"
                type="text"
                placeholder="Username"
                required={true}
              />
              <TextField
                label="Mật khẩu"
                name="password"
                type={showPassword ? "text" : "password"} // thay đổi type theo trạng thái
                placeholder="Mật khẩu"
                required={true}
              />
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-light-outline dark:border-dark-outline"
                  checked={showPassword}
                  onChange={() => setShowPassword(prev => !prev)}
                />
                <span className="text-bodySmall text-light-onSurfaceVariant dark:text-dark-onSurfaceVariant">
                Hiển thị mật khẩu
                </span>
              </label>

              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Đang tạo..." : "Tạo tài khoản"}
               
              </Button>
            </form>
            <p className="text-bodyMedium text-light-onSurface dark:text=dark-onSurface">
              Bạn đã có tài khoản?
              <Link
                to="/login"
                className="link inline-block ms-1
              text-light-onSurface dark:text-dark-onSurface"
              >
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
