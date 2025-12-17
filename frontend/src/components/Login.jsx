import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { BookOpen, GraduationCap } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Login({ onLogin }) {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post(`${API}/auth/login`, formData);
      toast.success('Login successful!');
      onLogin(response.data.access_token, response.data.user);
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.detail || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center fade-in">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">ExamCraft</h1>
          <p className="text-gray-600 mt-2">Digital Practical Examination Platform</p>
        </div>

        {/* Login Form */}
        <Card className="slide-up glass border-0 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  data-testid="login-email-input"
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  data-testid="login-password-input"
                  required
                  className="h-11"
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading}
                data-testid="login-submit-button"
                className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 btn-animate"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors"
                  data-testid="register-link"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Role Info */}
        <div className="grid grid-cols-2 gap-4 fade-in">
          <div className="text-center p-4 bg-white/50 rounded-lg border">
            <GraduationCap className="h-6 w-6 text-emerald-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">For Students</p>
            <p className="text-xs text-gray-500">Take exams & view results</p>
          </div>
          <div className="text-center p-4 bg-white/50 rounded-lg border">
            <BookOpen className="h-6 w-6 text-teal-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-700">For Teachers</p>
            <p className="text-xs text-gray-500">Create & manage exams</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;