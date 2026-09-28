import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ThemeToggle } from '../components/common/ThemeToggle';

export function AuthPage() {
  const { login, register, navigateTo } = useApp();

  const [activeTab, setActiveTab] = useState('signin'); // 'signin' | 'register'
  const [role, setRole] = useState('student'); // 'student' | 'admin'

  // Form states
  const [studentId, setStudentId] = useState('STU-2024-892');
  const [adminEmail, setAdminEmail] = useState('r.asante@camcare.edu');
  const [password, setPassword] = useState('password123');

  // Register form states
  const [regName, setRegName] = useState('');
  const [regId, setRegId] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDept, setRegDept] = useState('Computer Science & Engineering');
  const [regPassword, setRegPassword] = useState('');

  const handleSignIn = async (e) => {
    e.preventDefault();
    const loginId = role === 'student' ? studentId : adminEmail;
    await login(role, { loginId, password });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    await register({
      loginId: regId,
      password: regPassword,
      name: regName,
      email: regEmail,
      department: regDept
    });
  };

  return (
    <div className="auth-wrapper">
      {/* Top bar back button and theme toggle */}
      <div
        style={{
          position: 'absolute',
          top: '24px',
          left: '32px',
          right: '32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <div
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={() => navigateTo('marketing')}
        >
          <span className="sidebar-logo">
            Cam<span className="logo-accent">Care</span>
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ThemeToggle />
          <button
            type="button"
            className="btn-text"
            onClick={() => navigateTo('marketing')}
            style={{ fontSize: '12.5px' }}
          >
            ← Back to Homepage
          </button>
        </div>
      </div>

      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 className="heading-serif" style={{ fontSize: '26px', marginBottom: '6px' }}>
            Get started today
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Access your campus complaint management portal
          </p>
        </div>

        {/* Primary Tabs: Sign In / Register */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-color)',
            marginBottom: '20px'
          }}
        >
          <button
            type="button"
            id="tab-signin"
            style={{
              flex: 1,
              padding: '10px',
              textAlign: 'center',
              fontWeight: activeTab === 'signin' ? 600 : 500,
              fontSize: '13.5px',
              color: activeTab === 'signin' ? 'var(--text-primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'signin' ? '2px solid var(--color-primary)' : '2px solid transparent'
            }}
            onClick={() => setActiveTab('signin')}
          >
            Sign In
          </button>
          <button
            type="button"
            id="tab-register"
            style={{
              flex: 1,
              padding: '10px',
              textAlign: 'center',
              fontWeight: activeTab === 'register' ? 600 : 500,
              fontSize: '13.5px',
              color: activeTab === 'register' ? 'var(--text-primary)' : 'var(--text-muted)',
              borderBottom: activeTab === 'register' ? '2px solid var(--color-primary)' : '2px solid transparent'
            }}
            onClick={() => setActiveTab('register')}
          >
            Register
          </button>
        </div>

        {activeTab === 'signin' ? (
          <div>
            {/* Secondary segmented toggle: Student vs Admin */}
            <div className="auth-segmented-switch">
              <button
                type="button"
                id="auth-role-student"
                className={`auth-segment-btn ${role === 'student' ? 'active' : ''}`}
                onClick={() => setRole('student')}
              >
                Student
              </button>
              <button
                type="button"
                id="auth-role-admin"
                className={`auth-segment-btn ${role === 'admin' ? 'active' : ''}`}
                onClick={() => setRole('admin')}
              >
                Admin
              </button>
            </div>

            <form onSubmit={handleSignIn}>
              {role === 'student' ? (
                <div className="form-group">
                  <label className="form-label" htmlFor="student-id-input">
                    Student ID
                  </label>
                  <input
                    id="student-id-input"
                    type="text"
                    className="form-input"
                    placeholder="e.g. STU-2024-892"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    required
                  />
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label" htmlFor="admin-email-input">
                    Staff Email or ID
                  </label>
                  <input
                    id="admin-email-input"
                    type="text"
                    className="form-input"
                    placeholder="e.g. r.asante@camcare.edu"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label className="form-label" htmlFor="auth-password-input" style={{ marginBottom: 0 }}>
                    Password
                  </label>
                  <a
                    href="#forgot"
                    onClick={(e) => e.preventDefault()}
                    style={{ fontSize: '11.5px', color: 'var(--color-primary)' }}
                  >
                    Forgot password?
                  </a>
                </div>
                <input
                  id="auth-password-input"
                  type="password"
                  className="form-input"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                id="auth-submit-btn"
                className="btn-primary"
                style={{ width: '100%', padding: '10px', marginTop: '12px' }}
              >
                {role === 'student' ? 'Sign In to CamCare' : 'Sign In as Administrator'}
              </button>
            </form>

            {/* Quick Demo Logins Bar */}
            <div
              style={{
                marginTop: '24px',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-color)',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Quick 1-Click Demo Logins
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  id="quick-demo-student"
                  className="btn-secondary"
                  style={{ flex: 1, fontSize: '11.5px', padding: '6px 8px' }}
                  onClick={() => login('student')}
                >
                  Student: Kwame Mensah
                </button>
                <button
                  type="button"
                  id="quick-demo-admin"
                  className="btn-secondary"
                  style={{ flex: 1, fontSize: '11.5px', padding: '6px 8px' }}
                  onClick={() => login('admin')}
                >
                  Admin: Dr. Rita Asante
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              Don't have an account?{' '}
              <span
                style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 500 }}
                onClick={() => setActiveTab('register')}
              >
                Register here
              </span>
            </div>
          </div>
        ) : (
          /* Register Tab */
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name-input">
                Full Name
              </label>
              <input
                id="reg-name-input"
                type="text"
                className="form-input"
                placeholder="e.g. Kwame Mensah"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-id-input">
                Student / Staff ID
              </label>
              <input
                id="reg-id-input"
                type="text"
                className="form-input"
                placeholder="e.g. STU-2024-892"
                value={regId}
                onChange={(e) => setRegId(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email-input">
                Campus Email
              </label>
              <input
                id="reg-email-input"
                type="email"
                className="form-input"
                placeholder="e.g. k.mensah@camcare.edu"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-dept-input">
                Department / Programme
              </label>
              <input
                id="reg-dept-input"
                type="text"
                className="form-input"
                value={regDept}
                onChange={(e) => setRegDept(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-password-input">
                Create Password
              </label>
              <input
                id="reg-password-input"
                type="password"
                className="form-input"
                placeholder="Minimum 8 characters"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              id="register-submit-btn"
              className="btn-primary"
              style={{ width: '100%', padding: '10px', marginTop: '8px' }}
            >
              Create Account
            </button>

            <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              Already registered?{' '}
              <span
                style={{ color: 'var(--color-primary)', cursor: 'pointer', fontWeight: 500 }}
                onClick={() => setActiveTab('signin')}
              >
                Sign in
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default AuthPage;
