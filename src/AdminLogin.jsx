import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      navigate('/admin/dashboard');
    }
  };

  return (
    <div className="h-[100dvh] w-screen bg-[#16120c] flex flex-col items-center justify-center p-6 text-center z-50 relative box-border">
      <div className="w-full max-w-sm bg-[#381111] p-2 rounded-2xl shadow-2xl">
        <div className="bg-[#E0CCB6] rounded-xl py-10 px-6 flex flex-col items-center text-center border border-[#C4AB8F]">
          
          <h2 className="font-serif text-[#4A260F] text-3xl font-bold mb-2">Staff Portal</h2>
          <p className="font-serif text-[#4A260F]/80 text-sm leading-relaxed mb-6">
            Authorized museum personnel only.
          </p>

          {errorMsg && (
            <div className="bg-red-100 text-red-800 p-3 rounded-lg mb-4 text-sm font-sans w-full">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
            <input
              type="email"
              placeholder="Staff Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white border border-[#4A260F]/40 rounded-lg p-3 font-sans text-[#4A260F] focus:outline-none focus:border-[#4A260F]"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white border border-[#4A260F]/40 rounded-lg p-3 font-sans text-[#4A260F] focus:outline-none focus:border-[#4A260F]"
            />
            <button 
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-[#4A260F] text-[#E0CCB6] hover:brightness-110 disabled:opacity-50 transition-colors py-3 rounded-lg font-serif font-bold text-lg shadow-md"
            >
              {loading ? 'Authenticating...' : 'Secure Login'}
            </button>
          </form>

          <button 
            onClick={() => navigate('/')}
            className="mt-6 text-[#4A260F] font-serif underline text-sm hover:opacity-80 transition-opacity"
          >
            Return to Public App
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;