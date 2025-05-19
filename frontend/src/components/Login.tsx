// src/pages/Login.tsx
import React, { useState } from 'react';
//import type { string } from '../App'; // Import userRole type

interface LoginProps {
  onLogin: (role: string) => void; // Accepts 'student' or 'teacher'
}

function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLoginClick = () => {
    if (email === 'seonyoung@teacher.com' && password === 'password') {
      onLogin('teacher'); // Call onLogin with 'teacher' role
    } else if (email === 'iskandar@student.com' && password === 'password') {
      onLogin('student'); // Call onLogin with 'student' role
    } else { 
      alert('Invalid credentials');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="max-w-md bg-white dark:bg-red-800 p-8 shadow-lg rounded-xl">
        <div className="flex items-center justify-center mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-500 bg-blue-100 rounded-full flex items-center justify-center" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-11m0 0l4 11H18m-6 0H6" />
          </svg>
        </div>
        <h1 className="text-3xl text-white text-center font-bold mb-4">Welcome Back !</h1>
        <p className="text-black text-xl text-center mb-6">Log in with your credentials</p>
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="mt-4">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button className="bg-blue-500 hover:bg-blue-800 text-white font-medium py-2 rounded-md mt-4 w-full" onClick={handleLoginClick}>
          Login
        </button>
        <p className="text-black-500 text-center mt-4">(seonyoung@teacher.com / password, iskandar@student.com / password)</p>
      </div>
    </div>
  );
}

export default Login;