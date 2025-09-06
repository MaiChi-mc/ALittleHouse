import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthForm() {
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');     // lỗi đăng nhập
  const [resetMessage, setResetMessage] = useState('');     // thông báo quên mật khẩu
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        user_email: email,
        password,
      });
      const { token, user_id, user_name, role, user_email } = response.data;
      const decodedToken = JSON.parse(atob(token.split('.')[1]));


      localStorage.setItem('userId', decodedToken.userId);
      localStorage.setItem('name', user_name);
      localStorage.setItem('email', user_email);
      localStorage.setItem('role', decodedToken.role);
      localStorage.setItem('token', token);


      navigate('/');
    } catch (error: any) {
      setErrorMessage(error?.response?.data?.message || 'Đăng nhập thất bại');
    }
  };

  const handleForgotPassword = async () => {
    try {
      setResetMessage('');
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
        email,
        newPassword,
      });
      setResetMessage('Đặt lại mật khẩu thành công!');
      setTimeout(() => {
        setIsForgotPassword(false);
        setResetMessage('');
      }, 1200);
    } catch (error: any) {
      setResetMessage(error?.response?.data?.message || 'Có lỗi xảy ra');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-pink-200 to-blue-200">
      <div className="flex bg-white rounded-3xl shadow-2xl overflow-hidden w-[800px] h-[500px]">
        <div className="w-1/2 flex flex-col justify-center items-start px-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={isForgotPassword ? 'forgot' : 'login'}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col w-full space-y-4"
            >
              <h2 className="text-3xl font-bold text-gray-800 text-center">
                {isForgotPassword ? 'Đặt lại mật khẩu' : 'Đăng nhập A Little House'}
              </h2>
              <p className="text-sm text-gray-600 text-center">
                {isForgotPassword
                  ? 'Nhập thông tin để đặt lại mật khẩu của bạn'
                  : 'Nhập email của bạn để đăng nhập'}
              </p>

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-full border border-gray-300 shadow-md focus:outline-none"
              />

              {isForgotPassword ? (
                <input
                  type="password"
                  placeholder="Mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 rounded-full border border-gray-300 shadow-md focus:outline-none"
                />
              ) : (
                <input
                  type="password"
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 rounded-full border border-gray-300 shadow-md focus:outline-none"
                />
              )}

              {/* Thông báo lỗi/ thành công */}
              {!isForgotPassword && errorMessage && (
                <p className="text-red-500 text-sm text-center">{errorMessage}</p>
              )}
              {isForgotPassword && resetMessage && (
                <p className="text-green-600 text-sm text-center">{resetMessage}</p>
              )}

              <div className="flex justify-between items-center">
                <button
                  onClick={() => {
                    setIsForgotPassword(!isForgotPassword);
                    setErrorMessage('');
                    setResetMessage('');
                  }}
                  className="text-blue-500 hover:underline"
                >
                  {isForgotPassword ? 'Quay lại đăng nhập' : 'Quên mật khẩu?'}
                </button>

                <Button
                  className="bg-[#4b9ae9] text-white border-[#4b9ae9] border-spacing-1 rounded-2xl hover:bg-white hover:text-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-blue-500/50 shadow-lg"
                  onClick={isForgotPassword ? handleForgotPassword : handleLogin}
                >
                  {isForgotPassword ? 'Xác nhận' : 'Đăng nhập'}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="w-1/2">
          <img src="LoginPhoto.png" alt="Room" className="object-cover w-full h-full" />
        </div>
      </div>
    </div>
  );
}
