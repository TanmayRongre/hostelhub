import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  LogIn,
  UserPlus,
  ArrowRight,
  MapPin,
  User,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import heroVideo from '../../assests/Video.mp4';

export default function HeroSection() {
  return (
    <div id="overview" className="home-page">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="home-hero-video"
      >
        <source src={heroVideo} type="video/mp4" />
      </video>
      <div className="home-hero-overlay" />

      <div className="home-layout">
        {/* ── Left column ── */}
        <div className="home-left-col">
          <div className="home-hero-content">
            <div className="home-badge hero-badge-anim">
              <Building2 className="w-3.5 h-3.5 text-[#dfba73]" />
              <span>Campus Residence Operations · Academic Year 2026</span>
            </div>

            <h1 className="hero-title-anim">
              Institutional Living<br />
              <span>Re-engineered</span><br />
              for Modern Campuses
            </h1>

            <p className="home-hero-desc hero-desc-anim">
              A high-precision operating platform connecting Students, Resident Wardens,
              and Campus Administration. Automated room allocations, QR attendance,
              maintenance workorders, and institutional transparency.
            </p>

            <div className="home-cta-row hero-cta-anim">
              <Link to="/login" className="home-cta-primary">
                <LogIn className="w-4 h-4" />
                <span>Access Portal</span>
              </Link>
              <Link to="/register" className="home-cta-secondary">
                <UserPlus className="w-4 h-4" />
                <span>Student Onboarding</span>
              </Link>
            </div>

            <div className="home-stats-row hero-stats-anim">
              <div className="home-stat-item">
                <span className="home-stat-value">2,400+</span>
                <span className="home-stat-label">Active Residents</span>
              </div>
              <div className="home-stat-sep" />
              <div className="home-stat-item">
                <span className="home-stat-value">12</span>
                <span className="home-stat-label">Residence Blocks</span>
              </div>
              <div className="home-stat-sep" />
              <div className="home-stat-item">
                <span className="home-stat-value">99.8%</span>
                <span className="home-stat-label">System Uptime</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right column: floating cards ── */}
        <div className="home-right-col">
          <div className="home-cards-row">
            {/* Card 1 — Role Portals */}
            <div className="home-card-left hero-card-left-anim">
              <h3>Role-Scoped Portals</h3>
              <p>Granular access control tailored for campus workflows.</p>
              <div className="home-card-left-footer">
                <div>
                  <div className="home-stat-big">100%</div>
                  <div className="home-stat-tiny">Digital &amp; Audited</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="home-card-avatars">
                    <div className="home-avatar bg-[#c5a059]" title="Student">S</div>
                    <div className="home-avatar bg-[#10b981]" title="Warden">W</div>
                    <div className="home-avatar bg-[#38bdf8]" title="Admin">A</div>
                  </div>
                  <Link to="/login" className="home-card-go-btn" title="Sign In">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Card 2 — Residence System */}
            <div className="home-card-right hero-card-right-anim">
              <div className="home-card-header">
                <div>
                  <div className="home-card-title">HostelHub Infrastructure</div>
                  <div className="home-card-addr">
                    <MapPin className="w-3 h-3 text-[#dfba73]" />
                    <span>Central Campus Complex</span>
                  </div>
                </div>
                <Link to="/login" className="home-card-go-btn" title="View details">
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="home-card-badge">
                <CheckCircle2 className="w-3 h-3" />
                <span>Verified System Live</span>
              </div>
              <p className="home-card-desc">
                Real-time room allotment, QR attendance logging, warden ticketing, and fee clearance.
              </p>
              <div className="home-card-specs">
                <div className="home-card-spec">
                  <User className="w-3 h-3" />
                  <span>Student</span>
                </div>
                <div className="home-card-spec-sep" />
                <div className="home-card-spec">
                  <Building2 className="w-3 h-3" />
                  <span>Warden</span>
                </div>
                <div className="home-card-spec-sep" />
                <div className="home-card-spec">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Admin</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
