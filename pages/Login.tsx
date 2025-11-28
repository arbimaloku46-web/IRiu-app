import React, { useState } from 'react';
import { authenticateUser, registerUser } from '../services/storage';
import { User } from '../types';
import { Button, Input, Card } from '../components/ui';
import { Building2, ShieldCheck, ArrowLeft, Phone, Mail } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isAdminMode) {
      if (password === 'Ndertimi2024') {
        onLogin({ id: 'admin', emailOrPhone: 'admin', role: 'admin' });
      } else {
        setError('Invalid Admin Password.');
      }
      return;
    }

    if (isRegistering) {
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      const user = registerUser(email, password);
      if (user) {
        onLogin(user);
      } else {
        setError('User already exists. Please login.');
      }
    } else {
      const user = authenticateUser(email, password);
      if (user) {
        onLogin(user);
      } else {
        setError('Invalid credentials.');
      }
    }
  };

  const toggleAdminMode = () => {
    setIsAdminMode(!isAdminMode);
    setError('');
    setPassword('');
    setEmail('');
    setIsRegistering(false);
  };

  return (
    // h-[100dvh] ensures it fits exactly in the mobile viewport. overflow-hidden prevents scrolling.
    <div className="h-[100dvh] w-full flex flex-col items-center justify-center bg-[#002147] p-4 font-sans relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#89cff0 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      </div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#2264ab] rounded-full filter blur-[100px] opacity-20 translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#89cff0] rounded-full filter blur-[100px] opacity-20 -translate-x-1/2 translate-y-1/2"></div>
      
      {/* Main Container */}
      <div className="w-full max-w-md relative z-10 flex flex-col justify-between h-full max-h-[850px]">
        
        {/* Spacer for vertical centering logic */}
        <div className="flex-1 flex items-center justify-center w-full">
          <Card className="w-full transition-all duration-300 backdrop-blur-sm bg-white/95 shadow-2xl">
            <div className="text-center mb-6 sm:mb-10">
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl flex items-center justify-center mx-auto mb-4 sm:mb-6 text-white shadow-xl transition-colors duration-300 ${isAdminMode ? 'bg-red-600 shadow-red-600/30' : 'bg-[#2264ab] shadow-[#2264ab]/30'}`}>
                {isAdminMode ? <ShieldCheck className="w-8 h-8 sm:w-10 sm:h-10" /> : <Building2 className="w-8 h-8 sm:w-10 sm:h-10" />}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#002147] mb-1 sm:mb-2">Ndërtimi</h1>
              <p className="text-[#2264ab] font-medium tracking-widest uppercase text-xs sm:text-sm">
                {isAdminMode ? 'Admin Access' : 'Shiko Progresin'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-6">
              {!isAdminMode && (
                <Input 
                  label="Email or Phone" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="e.g., client@example.com"
                />
              )}
              
              <Input 
                label="Password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder={isAdminMode ? "Enter Admin Key" : "******"}
              />
              
              {error && <div className="bg-red-50 text-red-600 p-2 sm:p-3 rounded-xl text-center text-xs sm:text-sm font-medium animate-pulse">{error}</div>}

              <Button type="submit" className={`mt-2 sm:mt-4 w-full ${isAdminMode ? 'bg-red-700 hover:bg-red-800 shadow-red-700/20' : ''}`}>
                {isAdminMode ? 'Access Dashboard' : (isRegistering ? 'Create Account' : 'Log In')}
              </Button>
            </form>

            <div className="mt-6 sm:mt-8 text-center text-sm sm:text-base text-gray-600">
              {!isAdminMode && (
                <>
                  {isRegistering ? (
                    <p>Already have an account? <button onClick={() => setIsRegistering(false)} className="text-[#2264ab] hover:underline font-bold">Log in</button></p>
                  ) : (
                    <p>New investor? <button onClick={() => setIsRegistering(true)} className="text-[#2264ab] hover:underline font-bold">Create account</button></p>
                  )}
                </>
              )}

              {isAdminMode && (
                 <button onClick={toggleAdminMode} className="text-gray-500 hover:text-[#002147] flex items-center justify-center gap-2 mx-auto mt-4 font-medium">
                   <ArrowLeft size={18} /> Back to Client Login
                 </button>
              )}
            </div>
            
            {!isAdminMode && !isRegistering && (
               <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-gray-100 text-center">
                 <Button onClick={toggleAdminMode} variant="outline" className="w-full text-xs sm:text-sm py-2 h-auto border-gray-200 text-gray-400 hover:text-[#002147] hover:border-[#002147] font-normal rounded-xl">
                   <ShieldCheck className="w-4 h-4" /> Login as Administrator
                 </Button>
               </div>
            )}
          </Card>
        </div>

        {/* Contact Info Footer */}
        <div className="mt-4 text-center text-white/80 space-y-2 py-3 bg-[#002147]/50 rounded-2xl backdrop-blur-md border border-white/10 shrink-0">
          <p className="text-[10px] sm:text-xs font-light uppercase tracking-widest mb-1 opacity-70">Contact Us</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-xs sm:text-base font-medium">
            <a href="tel:+355684778194" className="flex items-center gap-2 hover:text-white transition-colors">
              <div className="bg-white/10 p-1.5 rounded-full"><Phone size={14} /></div>
              +355 68 477 8194
            </a>
            <a href="mailto:projekti@ndertimi.org" className="flex items-center gap-2 hover:text-white transition-colors">
              <div className="bg-white/10 p-1.5 rounded-full"><Mail size={14} /></div>
              projekti@ndertimi.org
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};