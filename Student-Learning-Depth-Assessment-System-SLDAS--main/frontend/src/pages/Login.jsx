import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/config';
import { BrainCircuit, Loader2, Mail, Lock } from 'lucide-react';
import { Button, Input, Card } from '../components/UI';

const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/api/auth/login', { email, password });
      
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      
      if (data.role === 'admin') navigate('/system-admin');
      else if (data.role === 'faculty') navigate('/faculty');
      else navigate('/dashboard');
    } catch (err) {
      console.error('Auth Error:', err);
      const msg = err.response?.data?.message || 'Server is not responding. Please check if backend is running.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950/40 dark:bg-slate-900 transition-colors relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50 -z-10"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50 -z-10"></div>
      
      <div className="w-full max-w-[440px] animate-in fade-in zoom-in duration-700">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/20 mb-4 rotate-3 hover:rotate-0 transition-transform duration-300">
            <BrainCircuit className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">SLDAS</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Transforming Learning with Intelligence</p>
        </div>

        <Card className="!p-0 border-none shadow-2xl shadow-blue-900/5">
          <div className="p-8 pb-8">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Welcome Back</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Enter your credentials to access your portal</p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-sm flex items-start gap-2 animate-shake">
                <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-red-500 dark:bg-red-400 mt-1.5"></span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input 
                label="Email Address" 
                type="email" 
                placeholder="name@company.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                icon={Mail}
              />

              <Input 
                label="Password" 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                icon={Lock}
              />

              <Button 
                type="submit" 
                className="w-full py-3.5 mt-4 text-md" 
                disabled={loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In to Portal'}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;


