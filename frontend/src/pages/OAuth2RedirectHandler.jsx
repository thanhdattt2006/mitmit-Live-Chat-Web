import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useStore from '../store/useStore'; // Đường dẫn trỏ tới useStore của mày
import { Loader2 } from 'lucide-react';

export default function OAuth2RedirectHandler() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithToken } = useStore();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (token) {
      // Gọi hàm lưu token vào state
      loginWithToken(token);
      // Đá về trang chủ, xóa token khỏi URL để bảo mật
      navigate('/', { replace: true });
    } else if (error) {
      alert("Đăng nhập thất bại: " + error);
      navigate('/', { replace: true });
    }
  }, [searchParams, navigate, loginWithToken]);

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white">
      <Loader2 className="animate-spin w-12 h-12 mb-4 text-blue-500" />
      <p className="font-medium text-lg animate-pulse">Đang xác thực thông tin...</p>
    </div>
  );
}
