import  { useState} from "react";
import axios from "axios";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";

function Profile() {
  const [password, setPassword] = useState("");  // Mật khẩu cũ
  const [newPassword, setNewPassword] = useState("");  // Mật khẩu mới
  const [confirmPassword, setConfirmPassword] = useState("");  // Xác nhận mật khẩu mới
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Kiểm tra mật khẩu mới và xác nhận mật khẩu mới có khớp không
    if (newPassword !== confirmPassword) {
      alert("Mật khẩu mới không khớp.");
      return;
    }

    // Gửi yêu cầu PUT để thay đổi mật khẩu
    axios.put(`${import.meta.env.VITE_API_URL}/api/auth/profile`, { 
      user_email: localStorage.getItem('email'), // Lấy email từ localStorage
      password, // Mật khẩu cũ
      newPassword // Mật khẩu mới
    })
      .then(response => {
        alert(response.data.message);
      })
      .catch(error => {
        console.error("Lỗi khi cập nhật thông tin:", error);
      });
  };

  return (
    <MainLayout userRole={localStorage.getItem('role') || 'User'}>
      <div className="bg-blue-100 p-8 rounded-lg shadow-xl w-full max-w-lg mx-auto mt-8">
        <h2 className="text-center text-2xl font-semibold text-blue-500 mb-6">Thông tin cá nhân</h2>
        
        <div className="mb-4">
          <label className="px-3 block font-medium text-blue-500">ID người dùng</label>
          <input
            type="text"
            value={localStorage.getItem('userId')}
            readOnly
            className="shadow-lg w-full p-3 border border-gray-300 rounded-full bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mb-4">
          <label className="px-3 block font-medium text-blue-500">Họ và tên</label>
          <input
            type="text"
            value={localStorage.getItem('name')}
            readOnly
            className="shadow-lg w-full p-3 border border-gray-300 rounded-full bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mb-4">
          <label className="px-3 block font-medium text-blue-500">Email</label>
          <input
            type="email"
            value={localStorage.getItem('email')}
            readOnly
            className="shadow-lg w-full p-3 border border-gray-300 rounded-full bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div className="mb-4">
          <label className="px-3 block font-medium text-blue-500">Vai trò</label>
          <input
            type="text"
            value={localStorage.getItem('role')}
            readOnly
            className="shadow-lg w-full p-3 border border-gray-300 rounded-full bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <h3 className="text-center text-xl font-semibold text-blue-500 mt-8">Thay đổi mật khẩu</h3>
        <p className="text-blue-400 text-center mb-4 text-sm">Để thay đổi mật khẩu, vui lòng nhập mật khẩu cũ và mật khẩu mới.</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="px-3 block font-medium text-blue-500">Mật khẩu cũ</label>
            <input
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="shadow-lg w-full p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="px-3 block font-medium text-blue-500">Mật khẩu mới</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="shadow-lg w-full p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-6">
            <label className="px-3 block font-medium text-blue-500">Xác nhận mật khẩu mới</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="shadow-lg w-full p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <Button
            type="submit"
            variant = "outline"
            className="w-full py-3 bg-[#4b9ae9] text-white rounded-full border-[#4b9ae9] hover:bg-white hover:text-blue-500 hover:border-blue-500 hover:border focus:outline-none focus:ring-2 focus:ring-blue-500  shadow-blue-500/50 shadow-lg"
          >
            Cập nhật mật khẩu
          </Button>
        </form>

        {message && <p className="text-green-500 text-center mt-4">{message}</p>}
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
      </div>
    </MainLayout>
  );
}

  

export default Profile;
