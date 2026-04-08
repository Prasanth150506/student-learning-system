import { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Save, Users, ShieldCheck, Mail, Lock, User as UserIcon } from 'lucide-react';
import { Button, Card, Input, Badge, Table, TableRow } from '../components/UI';

const SystemAdminDashboard = ({ user }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    // We could fetch users here, but currently, only GET /api/auth/students is available 
    // and restricted to faculty. We didn't build an admin fetch-all-users route.
    // Setting up the skeleton for future.
  }, [user.token]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      const { data } = await axios.post('http://127.0.0.1:5000/api/auth/register', {
        name,
        email,
        password,
        role
      }, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      
      setMessage(`Successfully created ${role} account for ${name}.`);
      setName('');
      setEmail('');
      setPassword('');
      setRole('student');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error creating user');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">System Admin Configuration</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Provision user roles and ensure platform security.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="col-span-1 lg:col-span-2 shadow-xl shadow-slate-200 dark:shadow-none">
          <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Provision New Account</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Create centralized credentials for Students and Faculty.</p>
            </div>
          </div>

          {message && (
            <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm font-semibold flex items-center gap-2">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-100 dark:border-red-800 text-red-700 dark:text-red-400 rounded-xl text-sm font-semibold flex items-center gap-2">
              {error}
            </div>
          )}

          <form onSubmit={handleCreateUser} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Full Name" 
                placeholder="John Doe" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                icon={UserIcon}
              />
              <Input 
                label="Email Address" 
                type="email" 
                placeholder="john@school.edu" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                icon={Mail}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Temporary Password" 
                type="password" 
                placeholder="Secure password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                icon={Lock}
              />
              
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1 mb-1.5 block">Assign Role</label>
                <div className="flex bg-slate-50 dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-700">
                  <button 
                    type="button"
                    onClick={() => setRole('student')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${role === 'student' ? 'bg-white dark:bg-slate-800 shadow-sm text-blue-600 dark:text-blue-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                  >
                    <UserIcon className="w-4 h-4" /> Student
                  </button>
                  <button 
                    type="button"
                    onClick={() => setRole('faculty')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${role === 'faculty' ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                  >
                    <ShieldCheck className="w-4 h-4" /> Faculty
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button type="submit" disabled={isLoading} icon={Save} className="min-w-[200px]">
                {isLoading ? 'Provisioning...' : 'Create Account'}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="col-span-1 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-2xl">
          <div className="p-2">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">Centralized Architecture</h3>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Public registration has been strictly disabled to ensure that only authenticated administrative personnel can provision roles within SLDAS.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                <span className="text-sm font-medium text-slate-300">Public Sign-up disabled</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                <span className="text-sm font-medium text-slate-300">Role spoofing prevented</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-400"></div>
                <span className="text-sm font-medium text-slate-300">Auditable account creation</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SystemAdminDashboard;
