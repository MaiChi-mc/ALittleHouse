import React, { useState } from 'react';
import axios from 'axios';
import MainLayout from '@/components/layout/MainLayout';

const CreateAccount = () => {
  const [user_name, setName] = useState('');
  const [user_email, setEmail] = useState('');
  const [role, setRole] = useState('user'); // Mặc định là user
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
        'http://localhost:8080/api/auth/create-account',
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
      setMessage('');
    }
  };

  return (
    <MainLayout userRole={userRole}>
      <div>
        <h2>Tạo tài khoản người dùng</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Tên:</label>
            <input
              type="text"
              value={user_name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={user_email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label>Vai trò:</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label>Mật khẩu:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Tạo tài khoản</button>
        </form>
        {message && <p style={{ color: 'green' }}>{message}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
    </MainLayout>
  );
};

export default CreateAccount;
