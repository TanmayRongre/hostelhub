import React from 'react';
import { Link } from 'react-router-dom';
import {
  LogIn,
  UserPlus,
  ArrowUpRight
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
              <span className="w-1.5 h-1.5 rounded-full bg-[#128bc0] inline-block" />
              <span>Campus Residence Operations · Academic Year 2026</span>
            </div>

            <h1 className="hero-title-anim">
              Better Hostel Living,<br />
              <span>All in One Place</span><br />
              for Students & Staff
            </h1>

            <p className="home-hero-desc hero-desc-anim">
              A high-precision operating platform connecting Students, Resident Wardens,
              and Campus Administration. Automated room allocations, QR attendance,
              maintenance workorders, and institutional transparency.
            </p>

            <div className="home-cta-row hero-cta-anim">
              <Link to="/login" className="home-cta-primary">
                <span>Access Portal</span>
                <span className="home-cta-icon-circle">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </Link>
              <Link to="/register" className="home-cta-secondary">
                <span>Student Onboarding</span>
                <span className="home-cta-secondary-circle">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
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
      </div>
    </div>
  );
}
