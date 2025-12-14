import React, { useState } from 'react';
import { User, ViewState } from '../types';

interface AuthProps {
  onLogin: (user: User) => void;
  onNavigate: (view: ViewState) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin, onNavigate }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email) {
      onLogin({ name, email });
    } else if (isLogin && email) {
      onLogin({ name: 'Kullanıcı', email });
    }
  };

  const handleGuestLogin = () => {
      onLogin({ name: 'Misafir', email: 'misafir@example.com' });
  };

  const handleGoogleLogin = () => {
      onLogin({ name: 'Google User', email: 'user@gmail.com' });
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-white p-6 pt-20 font-sans relative">
      <button 
        onClick={handleGuestLogin}
        className="absolute top-6 right-6 text-gray-500 font-bold hover:text-gray-800 transition-colors text-lg"
      >
        Atla
      </button>

      <h1 className="text-3xl font-medium text-gray-700 mb-12">Deutsch Builder</h1>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        {!isLogin && (
          <input
            type="text"
            placeholder="Ad soyad"
            className="w-full bg-gray-100 p-4 rounded-lg outline-none focus:ring-2 focus:ring-yellow-400 text-gray-700"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        )}
        
        <input
          type="email"
          placeholder="E-posta"
          className="w-full bg-gray-100 p-4 rounded-lg outline-none focus:ring-2 focus:ring-yellow-400 text-gray-700"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Parola"
          className="w-full bg-gray-100 p-4 rounded-lg outline-none focus:ring-2 focus:ring-yellow-400 text-gray-700"
        />

        {!isLogin && (
            <div className="flex items-start mt-4 mb-6">
                <input type="checkbox" className="mt-1 mr-3 h-5 w-5 text-yellow-500 rounded border-gray-300 focus:ring-yellow-400" />
                <p className="text-sm text-gray-500 leading-relaxed">
                Devam ederek <span className="text-yellow-500 underline cursor-pointer">Kullanım Koşullarımızı</span> ve <span className="text-yellow-500 underline cursor-pointer">Gizlilik Politikamızı</span> kabul etmiş olursunuz.
                </p>
            </div>
        )}

        <button
          type="submit"
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-gray-800 font-bold py-4 rounded-full shadow-md transition-colors uppercase tracking-wide mt-4"
        >
          {isLogin ? 'GİRİŞ YAP' : 'KAYDOL'}
        </button>
      </form>

        <div className="mt-8 mb-4 relative w-full max-w-sm text-center">
            <button 
                onClick={handleGuestLogin}
                className="bg-white px-2 text-gray-400 relative z-10 hover:text-gray-600 transition-colors"
            >
                Daha sonra kaydol
            </button>
            <div className="absolute top-1/2 left-0 w-full border-b border-gray-200 -z-0"></div>
        </div>

      <button 
        onClick={handleGoogleLogin}
        className="w-full max-w-sm border border-gray-300 py-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-50 transition-colors"
      >
        <span className="font-bold text-blue-600 text-xl">G</span>
        <span className="text-gray-600 font-medium">Google ile giriş yap</span>
      </button>

      <div className="mt-auto pb-8">
        <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-gray-600 font-medium text-sm"
        >
          {isLogin ? "Hesabın yok mu? " : "Hesabın var mı? "} 
          <span className="text-gray-800 font-bold">{isLogin ? "Kaydol" : "Oturum aç"}</span>
        </button>
      </div>
    </div>
  );
};

export default Auth;