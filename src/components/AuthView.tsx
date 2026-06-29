import React, { useState } from 'react';
import { ShieldCheck, Lock, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { isMockFirebase, auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

interface AuthViewProps {
  onLogin: (userId: string, email: string) => void;
}

export default function AuthView({ onLogin }: AuthViewProps) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMess, setErrorMess] = useState('');

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMess('');

    if (password !== 'Flavia7') {
      setErrorMess('Senha de acesso incorreta. Por favor, insira a chave de segurança correta.');
      setIsLoading(false);
      return;
    }

    if (isMockFirebase || !auth) {
      // Mock flow only as emergency fallback if firebase isn't configured, but with santosflaviabarros@gmail.com
      setTimeout(() => {
        onLogin('psy_mock_user_123', 'santosflaviabarros@gmail.com');
        setIsLoading(false);
      }, 850);
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (user) {
        onLogin(user.uid, user.email || '');
      }
    } catch (err: any) {
      console.error("Erro Google popup authentication:", err);
      if (err.code === 'auth/popup-blocked') {
        setErrorMess('O pop-up de login foi bloqueado pelo seu navegador. Por favor, libere pop-ups para este site.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setErrorMess('O login com Google foi cancelado.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setErrorMess('Este domínio não está cadastrado ou autorizado no console do Firebase.');
      } else {
        setErrorMess(err.message || 'Erro ao realizar login via Google.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Logo and Brand */}
        <div className="flex justify-center items-center gap-2 mb-2">
          <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-150">
            <ShieldCheck className="w-8 h-8" id="auth-logo-icon" />
          </div>
          <span className="text-3xl font-bold tracking-tight text-slate-900">
            Nex<span className="text-indigo-600">Psi</span>
          </span>
        </div>
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-6">
          SISTEMA DE GESTÃO E PRONTUÁRIOS MÉDICOS
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-4 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in"
      >
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-slate-100 sm:px-10">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-slate-800">
              Acesso Profissional Seguro
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Ambiente sigiloso e criptografado em estrito respeito ao CFP e LGPD.
            </p>
          </div>

          {errorMess && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-100 text-red-700 text-xs font-semibold rounded-xl flex gap-2 items-center animate-shake">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMess}</span>
            </div>
          )}

          <div className="space-y-5">
            {/* Password Verification Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-extrabold text-slate-600 uppercase tracking-wider">
                Chave de Acesso do Sistema
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite a senha necessária"
                  className="block w-full pl-10 pr-4 py-3 border border-slate-250 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-semibold placeholder:text-slate-300 placeholder:font-medium text-slate-800 bg-slate-50/50"
                />
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                Insira a senha de liberação para habilitar e prosseguir com o login do Google.
              </p>
            </div>

            <div className="border-t border-slate-100 my-4 pt-4">
              {/* Primary Action: Google Auth Button */}
              <button
                onClick={handleGoogleLogin}
                type="button"
                disabled={isLoading}
                id="google-login-btn"
                className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-slate-200 hover:border-slate-300 rounded-xl shadow-xs text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors cursor-pointer"
              >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLoading ? 'Conectando...' : 'Entrar com o Google'}</span>
            </button>
          </div>
          </div>
        </div>
      </motion.div>

      {/* Safety compliance stamps */}
      <div className="mt-8 text-center sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center gap-6 text-slate-400 text-xs">
          <span className="flex items-center gap-1 font-semibold text-[10px]">
            <Lock className="w-3.5 h-3.5" /> Segurança Ponta a Ponta
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 font-semibold text-[10px]">
            <ShieldCheck className="w-3.5 h-3.5" /> Resolução CFP 11/2018
          </span>
        </div>
      </div>
    </div>
  );
}
