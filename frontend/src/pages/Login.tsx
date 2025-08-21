import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';


const Login = () => {
  const [email, setUserEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:8080/api/auth/login', {
        user_email: email,
        password,
      });

      const { token, user_id, user_name, role, user_email } = response.data;
      const decodedToken = JSON.parse(atob(token.split('.')[1]));

      // console.log("Response from login API: ", response.data); // Log dữ liệu trả về

      // Lưu token và role vào localStorage
      localStorage.setItem('userId', decodedToken.userId); 
      localStorage.setItem('name', user_name); 
      localStorage.setItem('email', user_email);
      localStorage.setItem('role', decodedToken.role);  
      localStorage.setItem('token', token); 

      // Điều hướng người dùng đến trang Dashboard
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
    }
  };

return (
  <div className="h-screen flex items-center justify-between bg-gradient-to-r from-[#f0bfd3] via-[#F1E8D9] to-[#a0c8ef]]">
  {/* Container bố cục: chỉ để căn giữa — form và ảnh vẫn là 2 div riêng (sibling) */}
    <div className="flex flex-col md:flex-row items-center gap-44 ">
      {/* --- Form (LEFT) --- */}
      <div className="pl-48 px-10 py-20">
        <div className="py-4">
          <h2 className="text-2xl text-center font-bold mb-4 text-gray-800">Đăng nhập A Little House</h2>
          <p className="text-xs text-center text-gray-500 mb-6">Nhập email của bạn để đăng nhập vào tài khoản</p>
        </div>
        

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label htmlFor="email" className="px-3 block text-sm font-medium text-gray-700 ">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setUserEmail(e.target.value)}
              required
              className="shadow-lg w-full p-3 mt-2 bg-white-100 text-gray-900 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="px-3 block text-sm font-medium text-gray-700">Mật khẩu</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="shadow-lg w-full p-3 mt-2 bg-white-100 text-gray-900 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-between items-center mb-4">
            <a href="#" className="text-sm text-blue-500 hover:underline">Quên mật khẩu?</a>
            <Button
              type="submit"
              variant="outline"
              className="px-6 py-3 bg-[#4b9ae9] text-white border-[#4b9ae9] rounded-2xl hover:bg-white hover:text-blue-500 hover:border-blue-500 hover:border focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-blue-500/50 shadow-lg"
            >
              Đăng nhập
            </Button>
          </div>
        </form>

        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      <div className="w-[810px] h-[660px] rounded-2xl shadow-2xl overflow-hidden ">
        <img src="LoginPhoto.png" alt="A Little House Login Picture" />
      </div>
    </div>
  </div>

  );
};

export default Login;