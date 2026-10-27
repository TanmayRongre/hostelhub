import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  ChevronRight,
  Check,
  Phone,
  Mail,
  MapPin,
  FileText,
  X
} from 'lucide-react';

const POLICY_CONTENT = {
  'Hostel Rules & Regulations': [
    'Gate timings: Main entry gates close strictly at 10:00 PM on weekdays and 10:30 PM on weekends.',
    'Leave permissions: Overnight or multi-day leaves must be applied online and approved by the Warden.',
    'Room discipline: Electrical cooking appliances, heaters, and unauthorized guests are strictly prohibited.',
    'Quiet hours: 10:00 PM to 6:00 AM are observed as campus quiet hours for study and rest.',
  ],
  'Privacy Policy': [
    'Student data protection: Resident identity, contact, and family records are encrypted and role-scoped.',
    'No third-party sharing: Resident information is strictly used for campus accommodation and safety purposes.',
    'Session security: JWT authentication with secure HTTP-only cookies and automatic session timeouts.',
  ],
  'Terms of Service': [
    'Admission terms: Room and bed allocations are subject to semester fee clearance and college verification.',
    'Code of conduct: Residents must abide by college anti-ragging laws and institutional standards.',
    'Maintenance: Room fixtures must be maintained responsibly; damages are subject to caution deposit deductions.',
  ],
};

export default function Footer() {
  const [activeModal, setActiveModal] = useState(null);

  const navigationLinks = [
    { label: 'Overview', hash: '#overview', to: '/#overview' },
    { label: 'Portals & Roles', hash: '#roles-section', to: '/#roles-section' },
    { label: 'System Capabilities', hash: '#capabilities', to: '/#capabilities' },
    { label: 'Operational Workflow', hash: '#workflow', to: '/#workflow' },
    { label: 'Campus Impact', hash: '#impact', to: '/#impact' },
    { label: 'Office & Inquiries', to: '/contact' },
  ];

  const handleNavScroll = (e, hash) => {
    if (window.location.pathname === '/') {
      e.preventDefault();
      if (hash === '#overview') {
        if (window.lenis) window.lenis.scrollTo(0, { duration: 1.1 });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      const el = document.querySelector(hash);
      if (el) {
        if (window.lenis) window.lenis.scrollTo(el, { offset: -64, duration: 1.1 });
        else el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-grid">
          {/* Brand & Socials */}
          <div>
            <Link to="/" className="footer-brand-logo">
              <div className="footer-logo-icon">
                <Building2 className="w-4 h-4 text-[#dfba73]" />
              </div>
              <div>
                <div className="footer-brand-name">
                  Hostel<span className="text-[#dfba73]">Hub</span>
                </div>
                <span className="footer-brand-tag">Institutional Residence System</span>
              </div>
            </Link>
            <p className="footer-tagline">
              A high-assurance campus residential operating system.
              Empowering students, resident wardens, and campus leadership with automated digital precision.
            </p>
            <div className="footer-social-row">
              <a
                href="https://www.instagram.com/zxy_tanmay/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                aria-label="Instagram"
                title="Instagram"
              >
                <i className="bx bxl-instagram"></i>
              </a>
              <a
                href="https://www.facebook.com/profile.php?id=61590433170519"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                aria-label="Facebook"
                title="Facebook"
              >
                <i className="bx bxl-facebook"></i>
              </a>
              <a
                href="https://x.com/Zxy_Tanmay"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                aria-label="X (Twitter)"
                title="X (Twitter)"
              >
                <i className="bx bxl-twitter"></i>
              </a>
              <a
                href="https://www.linkedin.com/in/tanmayrongre/"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-btn"
                aria-label="LinkedIn"
                title="LinkedIn"
              >
                <i className="bx bxl-linkedin"></i>
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <div className="footer-col-title">Navigation</div>
            <ul className="footer-links">
              {navigationLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    onClick={(e) => l.hash && handleNavScroll(e, l.hash)}
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-[#dfba73]" />
                    <span>{l.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Enterprise Capabilities */}
          <div>
            <div className="footer-col-title">Core Systems</div>
            <ul className="footer-links">
              {[
                'Smart Room & Bed Allocation',
                'Digital Gate-Pass Authorizations',
                'Priority Grievance Ticketing',
                'Night QR Attendance Verification',
                'Institutional Fee Reconciliation',
              ].map((feat) => (
                <li key={feat} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '12.5px', color: '#94a3b8' }}>
                  <div style={{
                    width: 14,
                    height: 14,
                    borderRadius: 3,
                    background: 'rgba(197, 160, 89, 0.15)',
                    border: '1px solid rgba(197, 160, 89, 0.3)',
                    color: '#dfba73',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <div className="footer-col-title">Campus Residence Office</div>
            <a href="tel:+919876543210" className="footer-contact-item" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Phone className="w-3.5 h-3.5 footer-contact-icon" />
              <div className="footer-contact-text">
                <strong>Administrative Helpdesk</strong>
                +91 98765 43210
              </div>
            </a>
            <a href="mailto:info@hostelmanage.in" className="footer-contact-item" style={{ textDecoration: 'none', color: 'inherit' }}>
              <Mail className="w-3.5 h-3.5 footer-contact-icon" />
              <div className="footer-contact-text">
                <strong>Official Email</strong>
                residence@institution.edu
              </div>
            </a>
            <Link to="/contact" className="footer-contact-item" style={{ textDecoration: 'none', color: 'inherit' }}>
              <MapPin className="w-3.5 h-3.5 footer-contact-icon" />
              <div className="footer-contact-text">
                <strong>Physical Office</strong>
                Residence Directorate, North Quad, Campus Grounds
              </div>
            </Link>
          </div>
        </div>

        <div className="footer-bottom">
          <span className="footer-copyright">
            © 2026 HostelHub Enterprise Residence OS. All institutional rights reserved.
          </span>
          <div className="footer-bottom-links">
            <button
              onClick={() => setActiveModal('Hostel Rules & Regulations')}
            >
              Hostel Rules
            </button>
            <button
              onClick={() => setActiveModal('Privacy Policy')}
            >
              Privacy Policy
            </button>
            <button
              onClick={() => setActiveModal('Terms of Service')}
            >
              Terms of Service
            </button>
            <Link to="/contact" style={{ textDecoration: 'none' }}>
              Campus Inquiries
            </Link>
          </div>
        </div>
      </div>

      {/* ── INTERACTIVE POLICY & RULES MODAL ── */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
          <div className="w-full max-w-lg p-6 rounded-xl bg-[#0e1219] border border-white/[0.1] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-[#c5a059]/15 text-[#dfba73] flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <h3 className="font-serif text-base font-bold text-white">{activeModal}</h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-7 h-7 rounded-md bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 py-2">
              {POLICY_CONTENT[activeModal]?.map((rule, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-[#141824] border border-white/[0.06] flex items-start gap-3 text-xs text-slate-300 leading-relaxed">
                  <span className="text-[#dfba73] font-bold mt-0.5">•</span>
                  <span>{rule}</span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="w-full py-2.5 rounded-lg bg-[#c5a059] hover:bg-[#dfba73] text-[#090b10] text-xs font-semibold shadow-sm transition-all cursor-pointer"
              >
                Acknowledge &amp; Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
