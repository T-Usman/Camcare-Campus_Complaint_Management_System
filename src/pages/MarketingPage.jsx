import React from 'react';
import { useApp } from '../context/AppContext';
import { MarketingNav } from '../components/layout/MarketingNav';
import { StatusDot } from '../components/common/StatusDot';

export function MarketingPage() {
  const { navigateTo } = useApp();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <MarketingNav />

      {/* Hero Section */}
      <section className="marketing-hero">
        <img
          src="/images/campus-hero.jpg"
          alt="University campus building"
          className="hero-bg-img"
        />
        <div className="hero-overlay" />

        <div className="hero-content">
          <div className="hero-pill">
            <span className="dot" aria-hidden="true" />
            <span>Campus Complaint Management</span>
          </div>

          <h1 className="hero-title font-serif">
            Every campus voice,<br />
            <span className="hero-accent">heard and resolved.</span>
          </h1>

          <p className="hero-sub">
            CamCare bridges students and campus administration with real-time ticket tracking,
            instant department routing, and strict resolution SLA accountability across all facilities.
          </p>

          <div className="hero-ctas">
            <button
              type="button"
              id="hero-cta-get-started"
              className="btn-primary"
              style={{ padding: '12px 24px', fontSize: '15px' }}
              onClick={() => navigateTo('auth')}
            >
              Get Started Free
            </button>
            <button
              type="button"
              id="hero-cta-demo"
              className="btn-outline"
              style={{ padding: '12px 24px', fontSize: '15px' }}
              onClick={() => navigateTo('auth')}
            >
              Try the Demo ›
            </button>
          </div>
        </div>

        {/* 3 Floating Live-Example Complaint Cards */}
        <div className="hero-live-cards">
          <div className="live-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span className="badge-pill">Facilities</span>
              <StatusDot status="In Progress" />
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Broken projector in Room 204
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Science Block B • Assigned to David Mensah
            </div>
          </div>

          <div className="live-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span className="badge-pill">Catering</span>
              <StatusDot status="High Priority" />
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Cafeteria food quality complaints
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              North Dining Hall • Escalated SLA
            </div>
          </div>

          <div className="live-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span className="badge-pill">IT Services</span>
              <StatusDot status="Resolved" />
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Wi-Fi dead zones in Hostel C
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Hostel C Floors 2 & 3 • Verified fixed
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" style={{ padding: '80px 48px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-page)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: '8px' }}>
              System Capabilities
            </div>
            <h2 className="heading-serif" style={{ fontSize: '36px', marginBottom: '12px' }}>
              Built for campus transparency and velocity
            </h2>
            <p style={{ maxWidth: '600px', margin: '0 auto', fontSize: '15px' }}>
              Eliminate lost paper complaints and unanswered emails. A unified command center designed for collegiate life.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            <div className="card">
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: '10px' }}>
                Instant Escalation
              </div>
              <h3 style={{ fontSize: '17px', marginBottom: '8px', color: 'var(--text-primary)' }}>
                SLA-Driven Escalation
              </h3>
              <p style={{ fontSize: '13px', lineHeight: 1.5 }}>
                Complaints left untouched for 48 hours escalate straight to faculty deans and executive directors automatically.
              </p>
            </div>

            <div className="card">
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: '10px' }}>
                Precision Routing
              </div>
              <h3 style={{ fontSize: '17px', marginBottom: '8px', color: 'var(--text-primary)' }}>
                Departmental Dispatch
              </h3>
              <p style={{ fontSize: '13px', lineHeight: 1.5 }}>
                Tickets are categorized by Facilities, IT Services, Library, Catering, Welfare, and Academics without administrative bottleneck.
              </p>
            </div>

            <div className="card">
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: '10px' }}>
                Transparent Audits
              </div>
              <h3 style={{ fontSize: '17px', marginBottom: '8px', color: 'var(--text-primary)' }}>
                Chronological Timelines
              </h3>
              <p style={{ fontSize: '13px', lineHeight: 1.5 }}>
                Students inspect the exact progress milestone, assigned technician, and resolution proof in real-time.
              </p>
            </div>

            <div className="card">
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: '10px' }}>
                Admin Operations
              </div>
              <h3 style={{ fontSize: '17px', marginBottom: '8px', color: 'var(--text-primary)' }}>
                Staff Workload Balancing
              </h3>
              <p style={{ fontSize: '13px', lineHeight: 1.5 }}>
                Assign and redistribute tickets across department staff with clear visibility into active vs. resolved queues.
              </p>
            </div>

            <div className="card">
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: '10px' }}>
                Performance Metrics
              </div>
              <h3 style={{ fontSize: '17px', marginBottom: '8px', color: 'var(--text-primary)' }}>
                Reports & Analytics
              </h3>
              <p style={{ fontSize: '13px', lineHeight: 1.5 }}>
                Executive charts detailing monthly submission volumes, category breakdowns, and average days to resolution.
              </p>
            </div>

            <div className="card">
              <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: '10px' }}>
                Broadcast System
              </div>
              <h3 style={{ fontSize: '17px', marginBottom: '8px', color: 'var(--text-primary)' }}>
                Campus Announcements
              </h3>
              <p style={{ fontSize: '13px', lineHeight: 1.5 }}>
                Publish scheduled maintenance alerts, Wi-Fi outage windows, and student welfare notices directly to all portals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={{ padding: '80px 48px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: '8px' }}>
              Workflow
            </div>
            <h2 className="heading-serif" style={{ fontSize: '36px', marginBottom: '12px' }}>
              From submission to closure in three clear steps
            </h2>
            <p style={{ maxWidth: '580px', margin: '0 auto', fontSize: '15px' }}>
              Streamlined process ensuring zero friction for students and complete accountability for staff.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            <div style={{ padding: '24px', backgroundColor: 'var(--bg-page)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '12px' }}>
                01
              </div>
              <h3 style={{ fontSize: '17px', marginBottom: '8px', color: 'var(--text-primary)' }}>
                Submit with Details
              </h3>
              <p style={{ fontSize: '13px', lineHeight: 1.5 }}>
                Choose the department, assign an urgency level (Low to Critical), describe the exact classroom or hostel, and attach evidence.
              </p>
            </div>

            <div style={{ padding: '24px', backgroundColor: 'var(--bg-page)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '12px' }}>
                02
              </div>
              <h3 style={{ fontSize: '17px', marginBottom: '8px', color: 'var(--text-primary)' }}>
                Triage & Staff Assignment
              </h3>
              <p style={{ fontSize: '13px', lineHeight: 1.5 }}>
                The administration office reviews the complaint, verifies the location, and assigns a dedicated officer with an enforced turnaround window.
              </p>
            </div>

            <div style={{ padding: '24px', backgroundColor: 'var(--bg-page)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--color-primary)', marginBottom: '12px' }}>
                03
              </div>
              <h3 style={{ fontSize: '17px', marginBottom: '8px', color: 'var(--text-primary)' }}>
                Resolution & Verification
              </h3>
              <p style={{ fontSize: '13px', lineHeight: 1.5 }}>
                Technicians perform physical repairs, log completion notes, and the student verifies resolution on their dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" style={{ padding: '80px 48px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-page)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-primary)', marginBottom: '8px' }}>
              Campus Voices
            </div>
            <h2 className="heading-serif" style={{ fontSize: '36px', marginBottom: '12px' }}>
              Trusted by student unions and administrations
            </h2>
            <p style={{ maxWidth: '580px', margin: '0 auto', fontSize: '15px' }}>
              Real feedback from students, faculty heads, and campus facilities officers.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
            <div className="card">
              <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-primary)', marginBottom: '20px', fontStyle: 'italic' }}>
                "CamCare completely eliminated the black-hole feeling of reporting broken campus facilities. Issues get fixed in days, not months."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="avatar-circle">KO</div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Kofi Owusu</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Student Union President</div>
                </div>
              </div>
            </div>

            <div className="card">
              <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-primary)', marginBottom: '20px', fontStyle: 'italic' }}>
                "The automated SLA escalation guarantees that high-priority student safety hazards are never overlooked. The dashboard gives us total oversight."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="avatar-circle">RA</div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>Dr. Rita Asante</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Dean of Students</div>
                </div>
              </div>
            </div>

            <div className="card">
              <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-primary)', marginBottom: '20px', fontStyle: 'italic' }}>
                "Our maintenance teams now receive precise locations, direct photos, and clear prioritization for every ticket without unnecessary bureaucracy."
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="avatar-circle">DM</div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>David Mensah</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Facilities Director</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '36px 48px', backgroundColor: 'var(--bg-page)', marginTop: 'auto' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div className="sidebar-logo" style={{ fontSize: '18px' }}>
              Cam<span className="logo-accent">Care</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Enterprise Campus Complaint Management System
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <span style={{ cursor: 'pointer' }} onClick={() => navigateTo('marketing')}>Home</span>
            <span style={{ cursor: 'pointer' }} onClick={() => navigateTo('auth')}>Sign In</span>
            <span style={{ color: 'var(--text-muted)' }}>© 2026 CamCare. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default MarketingPage;
