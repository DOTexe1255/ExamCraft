import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { BookOpen } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function Register({ onLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.role) {
      toast.error('Please select your role');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await axios.post(`${API}/auth/register`, formData);
      toast.success('Registration successful!');
      onLogin(response.data.access_token, response.data.user);
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (value) => {
    setFormData({ ...formData, role: value });
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
          <p className="text-gray-600 mt-2">Join the Digital Examination Platform</p>
        </div>

        {/* Register Form */}
        <Card className="slide-up glass border-0 shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-semibold text-center">Create Account</CardTitle>
            <CardDescription className="text-center">
              Sign up to get started with ExamCraft
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  data-testid="register-name-input"
                  required
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  data-testid="register-email-input"
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
                  placeholder="Create a password"
                  data-testid="register-password-input"
                  required
                  className="h-11"
                  minLength="6"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select onValueChange={handleRoleChange} required>
                  <SelectTrigger className="h-11" data-testid="register-role-select">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student" data-testid="role-student-option">Student</SelectItem>
                    <SelectItem value="teacher" data-testid="role-teacher-option">Teacher</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                type="submit" 
                disabled={loading}
                data-testid="register-submit-button"
                className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 btn-animate"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link 
                  to="/login" 
                  className="font-semibold text-emerald-600 hover:text-emerald-500 transition-colors"
                  data-testid="login-link"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Register;