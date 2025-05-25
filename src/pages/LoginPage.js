import React, { useState } from 'react';
import { signInUser, signUpUser } from '../services/authService';
import { Home, LogIn, UserPlus } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';

const LoginPage = ({ setIsLoading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const { error } = await signInUser(email, password);
    if (error) {
      alert('Login Failed: ' + error.message);
    }
    setIsLoading(false);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const metadata = { 
      name: name,
      role: 'landlord' // Only landlords can sign up directly
    };

    const { data: signUpData, error } = await signUpUser(email, password, metadata);

    if (error) {
      alert('Sign Up Failed: ' + error.message);
    } else if (signUpData && signUpData.user) {
      alert('Sign up successful! Please check your email to confirm your account.');
      setIsSignUp(false);
    } else if (signUpData && !signUpData.user && signUpData.session === null) {
      alert('Sign up successful! Please check your email to confirm your account.');
      setIsSignUp(false);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex-grow flex items-center justify-center bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <Home size={48} className="mx-auto text-sky-600"/>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
            {isSignUp ? 'Create Landlord Account' : 'Sign in to TenantFlow'}
          </h2>
          {isSignUp && (
            <p className="mt-2 text-center text-sm text-gray-600">
              Creating an account as a Property Manager/Landlord
            </p>
          )}
        </div>
        <Card className="mt-8 !shadow-2xl">
          <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-6">
            {isSignUp && (
              <Input 
                label="Full Name" 
                id="name" 
                name="name" 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="John Doe" 
                required 
              />
            )}
            <Input 
              label="Email address" 
              id="email" 
              name="email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="email@example.com" 
              required 
            />
            <Input 
              label="Password" 
              id="password" 
              name="password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="********" 
              required 
            />
            <Button 
              type="submit" 
              variant="primary" 
              className="w-full !bg-sky-600 hover:!bg-sky-700 focus:!ring-sky-500" 
              icon={isSignUp ? UserPlus : LogIn}
            >
              {isSignUp ? 'Sign Up as Landlord' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm font-medium text-sky-600 hover:text-sky-500"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up as Landlord"}
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;