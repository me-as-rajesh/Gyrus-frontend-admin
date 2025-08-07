import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { verifyTeacherCredentials } from '../../services/mongoDbService';
import './Signin.css';

const Signin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return;
    }

    setIsLoading(true);

    try {
      const isValid = await verifyTeacherCredentials(formData.email, formData.password);
      if (isValid) {
        navigate('/');
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError('Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <p className="title">Welcome back</p>
      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
      <div onSubmit={handleSubmit} className="form">
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder=""
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder=""
          />
        </div>
        <button
          className="sign"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
      </div>
      <p className="login">
        Create a Teacher Account
        <Link to="/Signup" className="login-link">Sign Up</Link>
      </p>
    </div>
  );
};

export default Signin;