import React from 'react';
import { useApp } from '../../context/AppContext';
import { ThemeToggle } from '../common/ThemeToggle';

export function MarketingNav() {
  const { navigateTo } = useApp();

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="marketing-nav">
      <div
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        onClick={() => navigateTo('marketing')}
      >
        <span className="sidebar-logo">
          Cam<span className="logo-accent">Care</span>
        </span>
      </div>

      <nav className="marketing-links" aria-label="Marketing navigation">
        <a
          href="#features"
          className="marketing-link"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('features');
          }}
        >
          Features
        </a>
        <a
          href="#how-it-works"
          className="marketing-link"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('how-it-works');
          }}
        >
          How It Works
        </a>
        <a
          href="#testimonials"
          className="marketing-link"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('testimonials');
          }}
        >
          Testimonials
        </a>
        <a
          href="#get-started"
          className="marketing-link"
          onClick={(e) => {
            e.preventDefault();
            navigateTo('auth');
          }}
        >
          Get Started
        </a>
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <ThemeToggle />
        <button
          type="button"
          id="nav-signin-btn"
          className="btn-primary"
          onClick={() => navigateTo('auth')}
        >
          Sign In
        </button>
      </div>
    </header>
  );
}

export default MarketingNav;
