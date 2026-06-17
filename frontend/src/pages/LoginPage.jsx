import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Landmark, ShieldCheck, AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/predict');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      navigate('/predict');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="bg-gradient-mesh min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border border-white/50 dark:border-white/5 animate-fade-in-up">
        <CardHeader className="text-center flex flex-col items-center pb-2">
          <div className="h-12 w-12 rounded-xl bg-hdfc-blue text-white flex items-center justify-center mb-3 shadow-md">
            <Landmark size={24} />
          </div>
          <CardTitle className="text-xl">HDFC Secure Portal</CardTitle>
          <CardDescription>Enter credentials to access the AI decision platform</CardDescription>
        </CardHeader>
        
        <CardContent>
          {searchParams.get('expired') && (
            <div className="mb-4 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900 text-orange-800 dark:text-orange-300 text-xs flex items-center gap-2">
              <ShieldCheck size={16} /> Session expired. Please log in again.
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Corporate Email Address"
              type="email"
              placeholder="e.g., employee@hdfc.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <Input
              label="Security Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            <Button
              type="submit"
              variant="accent"
              isLoading={isLoading}
              className="w-full mt-2"
            >
              Sign In
            </Button>
          </form>

          <p className="text-xs text-center text-hdfc-gray-300 dark:text-slate-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-hdfc-blue dark:text-hdfc-blue-glow font-bold hover:underline">
              Create an account
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
