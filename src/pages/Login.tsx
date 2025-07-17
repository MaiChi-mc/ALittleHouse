import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("http://localhost:8080/api/login", { // sửa lại sau 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (data.success) {
      localStorage.setItem("token", data.token); // kiểm tra token có hợp lệ không
      navigate("/dashboard");
    } else {
      alert("Wrong information!");
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm"
      >
        <h2 className="text-2xl font-semibold mb-6">Log in</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mb-4 w-full p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full p-2 border rounded"
        />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">
          Log in
        </button>
        <div className="text-sm mt-4 text-right text-blue-600 cursor-pointer">
          Forget password?
        </div>
      </form>
    </div>
  );
}
