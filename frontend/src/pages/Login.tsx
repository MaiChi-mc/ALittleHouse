import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


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

      const { token, role, user_email } = response.data;
      const decodedToken = JSON.parse(atob(token.split('.')[1]));

      // Lưu token và role vào localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('role', decodedToken.role);  
      localStorage.setItem('email', response.data.user_email);

      // Điều hướng người dùng đến trang Dashboard
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
    }
  };

    return (
    <div className="h-screen flex items-center justify-center" style={{
      backgroundImage: 'url("\anh.png")', 
      backgroundSize: 'cover',  
      backgroundPosition: 'center',  
      backgroundRepeat: 'no-repeat',  // Không lặp lại ảnh
    }}>
    <div className="bg-[rgba(37,99,235,0.7)] text-white p-8 rounded-lg shadow-xl w-96"> 
      <h2 className="text-2xl font-bold mb-4">Đăng nhập</h2>
      <p className="text-sm text-white-400 mb-4">Nhập email của bạn để đăng nhập vào tài khoản</p>
      <form onSubmit={handleLogin}>
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setUserEmail(e.target.value)}
            required
            className="w-full p-3 mt-2 bg-white-700 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium">Mật khẩu</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 mt-2 bg-white-700 text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex justify-between items-center mb-4">
          <a href="#" className="text-sm text-white-400">Quên mật khẩu?</a>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Đăng nhập
          </button>
        </div>
      </form>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  </div>
  );
};

export default Login;