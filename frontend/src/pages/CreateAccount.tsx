import React, { useState } from 'react';
import axios from 'axios';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';

const CreateAccount = () => {
  const [user_name, setName] = useState('');
  const [user_email, setEmail] = useState('');
  const [role, setRole] = useState('Receptionist'); // Mặc định là user
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const userRole = localStorage.getItem('role'); // Lấy role từ localStorage để xác thực quyền admin

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem('token');  // Lấy JWT token để xác thực quyền admin

    if (!token) {
      setError('Bạn cần phải đăng nhập');
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/create-account`,
        {
          user_name,
          user_email,
          password,
          role,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMessage(response.data.message);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đã có lỗi xảy ra');
      console.log("Error: ", err); 
      setMessage('');
    }
  };

  return (
    <MainLayout userRole={userRole}>
      <div className="bg-blue-100 p-8 rounded-lg shadow-xl w-full max-w-lg mx-auto mt-8">
      <h2 className="text-center text-2xl font-semibold mb-6 text-blue-500">Tạo tài khoản người dùng</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="px-3 block font-medium text-blue-500">Tên người dùng</label>
          <input
            type="text"
            value={user_name}
            onChange={(e) => setName(e.target.value)}
            required
            className="shadow-lg w-full p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label className="px-3 block font-medium text-blue-500">Email</label>
          <input
            type="email"
            value={user_email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="shadow-lg w-full p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mb-4">
          <label className="px-3 block font-medium text-blue-500">Vai trò</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="shadow-lg w-full p-3  border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Receptionist">Receptionist</option>
            <option value="Admin">Admin</option>
            <option value="Cleaner">Cleaner</option>
          </select>
        </div>
        <div className="mb-6">
          <label className="block font-medium text-blue-500">Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="shadow-lg w-full p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Button
          type="submit"
          variant="outline"
          className="w-full py-3 bg-[#4b9ae9] text-white rounded-full border-[#4b9ae9] hover:bg-white hover:text-blue-500 hover:border-blue-500 hover:border focus:outline-none focus:ring-2 focus:ring-blue-500  shadow-blue-500/50 shadow-lg"
        >
          Tạo tài khoản
        </Button>
      </form>
      {message && <p className="text-green-500 text-center mt-4">{message}</p>}
      {error && <p className="text-red-500 text-center mt-4">{error}</p>}
    </div>
    </MainLayout>
  );
};

export default CreateAccount;
