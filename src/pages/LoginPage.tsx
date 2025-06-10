
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { ICONS } from '../constants';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, loadingAuth, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/";


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      // Error is handled by AuthContext and displayed via authError
      console.error("Login failed on page:", err);
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card title="Login to Cricket Scorer Pro" titleClassName="text-center text-2xl font-extrabold">
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <Input
              id="username"
              label="Username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin or scorer or player"
            />
            <Input
              id="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="any password (mock)"
            />
            {authError && <p className="text-sm text-red-600 text-center flex items-center justify-center"><span className="mr-2">{ICONS.WARNING}</span>{authError}</p>}
            <Button type="submit" className="w-full" isLoading={loadingAuth} disabled={loadingAuth}>
              {loadingAuth ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
          <div className="mt-4 text-sm text-center text-gray-600">
            <p>Use 'admin', 'scorer', or 'player' as username. Any password will work for this mock.</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
