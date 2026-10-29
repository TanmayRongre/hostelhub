import React, { useState } from 'react';
import api from '../services/api';
import useInView from '../hooks/useInView';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Sparkles,
  CheckCircle2,
  Copy,
  Send,
  RefreshCw,
  AlertCircle,
  Ticket
} from 'lucide-react';
import '../styles/Home.css';

const demoValues = {
  firstName: 'Tanmay',
  lastName: 'Rongre',
  email: 'tanmay@mountreach.edu',
  phone: '+91 98765 43210',
  inquiry: 'booking',
  message: 'Hello, I would like to inquire about the room allotment process for the upcoming academic semester and facility specifications for Block A accommodations.',
};

export default function Contact() {
  const [formData, setFormData] = useState(demoValues);
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copied, setCopied] = useState(false);

  const { ref: headerRef, inView: headerIn } = useInView({ threshold: 0.2 });
  const { ref: infoRef, inView: infoIn } = useInView({ threshold: 0.1 });
  const { ref: formRef, inView: formIn } = useInView({ threshold: 0.1 });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const autofillDemo = () => {
    setFormData(demoValues);
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await api.submitContact(formData);
      if (res.success) {
        setSubmittedTicket(res.data);
      } else {
        setErrorMsg(res.message || 'Failed to submit inquiry ticket');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Network error while submitting inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTicket = () => {
    if (submittedTicket?.ticketNumber) {
      navigator.clipboard.writeText(submittedTicket.ticketNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleReset = () => {
    setSubmittedTicket(null);
    setFormData(demoValues);
    setErrorMsg('');
  };

  return (
    <div className="contact-page">
      <div className="contact-container">
        {/* Header */}
        <div ref={headerRef} className={`contact-header reveal ${headerIn ? 'in-view' : ''}`}>
          <h1>Institutional Inquiries</h1>
          <p>
            Have inquiries regarding room allotments, campus residential policies, or fees?
            Submit an official administrative dossier ticket and our team will respond promptly.
          </p>
        </div>

        <div className="contact-grid">
          {/* Info Card */}
          <div ref={infoRef} className={`contact-info-card reveal-left ${infoIn ? 'in-view' : ''}`}>
            <h2>Residence Directorate</h2>
            <p>Direct communication channels for residential operations, wardens, and campus logistics.</p>

            <a href="https://maps.google.com/?q=Shivaji+Nagar+Pune" target="_blank" rel="noopener noreferrer" className="contact-info-item" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="contact-info-icon">
                <MapPin className="w-4 h-4 text-[#dfba73]" />
              </div>
              <div className="contact-info-text">
                <strong>Campus Directorate</strong>
                <span>Hostel Office, Gate No. 2, North Quad, Pune 411005</span>
              </div>
            </a>

            <a href="tel:+919876543210" className="contact-info-item" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="contact-info-icon">
                <Phone className="w-4 h-4 text-[#dfba73]" />
              </div>
              <div className="contact-info-text">
                <strong>Administrative Helpline</strong>
                <span>+91 98765 43210</span>
              </div>
            </a>

            <a href="mailto:info@hostelmanage.in" className="contact-info-item" style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="contact-info-icon">
                <Mail className="w-4 h-4 text-[#dfba73]" />
              </div>
              <div className="contact-info-text">
                <strong>Official Correspondence</strong>
                <span>residence@institution.edu</span>
              </div>
            </a>

            <div className="contact-info-item">
              <div className="contact-info-icon">
                <Clock className="w-4 h-4 text-[#dfba73]" />
              </div>
              <div className="contact-info-text">
                <strong>Office Hours</strong>
                <span>Monday – Saturday: 09:00 – 18:00 IST</span>
              </div>
            </div>

            <div className="contact-social-row">
              <a href="https://www.facebook.com/profile.php?id=61590433170519" target="_blank" rel="noopener noreferrer" className="contact-social-btn" aria-label="Facebook" title="Facebook">
                <i className="bx bxl-facebook"></i>
              </a>
              <a href="https://www.instagram.com/zxy_tanmay/" target="_blank" rel="noopener noreferrer" className="contact-social-btn" aria-label="Instagram" title="Instagram">
                <i className="bx bxl-instagram"></i>
              </a>
              <a href="https://x.com/Zxy_Tanmay" target="_blank" rel="noopener noreferrer" className="contact-social-btn" aria-label="Twitter (X)" title="Twitter (X)">
                <i className="bx bxl-twitter"></i>
              </a>
              <a href="https://www.linkedin.com/in/tanmayrongre/" target="_blank" rel="noopener noreferrer" className="contact-social-btn" aria-label="LinkedIn" title="LinkedIn">
                <i className="bx bxl-linkedin"></i>
              </a>
            </div>
          </div>

          {/* Form Card */}
          <div ref={formRef} className={`contact-form-card reveal-right ${formIn ? 'in-view' : ''}`}>

            {submittedTicket ? (
              <div style={{ textAlign: 'center', padding: '24px 16px' }} className="animate-fade-in">
                <div style={{ width: 48, height: 48, borderRadius: 8, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h2 style={{ color: '#15232a', margin: '0 0 8px', fontSize: 22, fontFamily: 'Manrope, sans-serif', fontWeight: 700, letterSpacing: '-0.025em' }}>
                  Inquiry Ticket Registered
                </h2>
                <p style={{ color: '#586d65', fontSize: 13, lineHeight: 1.6, maxWidth: 440, margin: '0 auto 20px' }}>
                  Thank you, <strong>{submittedTicket.firstName}</strong>. Your ticket has been logged in the residential registry.
                </p>

                {/* Ticket Badge */}
                <div
                  style={{
                    background: 'rgba(18, 22, 32, 0.9)',
                    border: '1px solid rgba(197, 160, 89, 0.3)',
                    borderRadius: 8,
                    padding: '18px 20px',
                    maxWidth: 380,
                    margin: '0 auto 20px',
                    textAlign: 'left',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#dfba73', fontWeight: 600 }}>
                      Administrative Reference
                    </span>
                    <span style={{ fontSize: 10.5, padding: '2px 8px', borderRadius: 4, background: 'rgba(16,185,129,0.15)', color: '#34d399', fontWeight: 600, border: '1px solid rgba(16,185,129,0.25)' }}>
                      Status: Logged
                    </span>
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '0.04em', fontFamily: 'monospace' }}>
                    {submittedTicket.ticketNumber}
                  </div>
                  <div style={{ fontSize: 11, color: '#71717a', marginTop: 6 }}>
                    Category: {submittedTicket.inquiry?.toUpperCase()} • Account: {submittedTicket.email}
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyTicket}
                    style={{
                      marginTop: 14,
                      width: '100%',
                      padding: '9px',
                      borderRadius: 6,
                      background: copied ? '#059669' : '#1a202e',
                      border: '1px solid rgba(197, 160, 89, 0.35)',
                      color: copied ? '#fff' : '#dfba73',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      transition: 'all 0.2s',
                    }}
                  >
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied to Clipboard' : 'Copy Reference Ticket'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="btn-arch-primary"
                  style={{ fontSize: 12.5, padding: '10px 20px' }}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Submit Another Inquiry</span>
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <h2 style={{ margin: 0 }}>Submit Official Ticket</h2>
                  <button
                    type="button"
                    onClick={autofillDemo}
                    style={{
                      padding: '5px 10px',
                      borderRadius: 6,
                      background: 'rgba(197, 160, 89, 0.10)',
                      border: '1px solid rgba(197, 160, 89, 0.30)',
                      color: '#dfba73',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'all 0.2s',
                    }}
                    title="Fill demonstration details"
                  >
                    <Sparkles className="w-3 h-3 text-[#dfba73]" />
                    <span>Autofill Sample</span>
                  </button>
                </div>

                {errorMsg && (
                  <div
                    style={{
                      padding: '10px 14px',
                      borderRadius: 6,
                      background: 'rgba(225, 29, 72, 0.12)',
                      border: '1px solid rgba(225, 29, 72, 0.3)',
                      color: '#fda4af',
                      fontSize: 12,
                      marginBottom: 16,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="contact-form-row">
                    <div className="contact-form-group">
                      <label>First Name *</label>
                      <input
                        type="text"
                        name="firstName"
                        placeholder="Tanmay"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="contact-form-group">
                      <label>Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        placeholder="Rongre"
                        value={formData.lastName}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="contact-form-row">
                    <div className="contact-form-group">
                      <label>Official Email *</label>
                      <input
                        type="email"
                        name="email"
                        placeholder="student@mountreach.edu"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="contact-form-group">
                      <label>Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        placeholder="+91 98765 43210"
                        value={formData.phone}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  <div className="contact-form-group">
                    <label>Inquiry Classification</label>
                    <select
                      name="inquiry"
                      value={formData.inquiry}
                      onChange={handleChange}
                    >
                      <option value="general">General Campus Living Inquiry</option>
                      <option value="booking">Hostel Admission & Bed Allocation</option>
                      <option value="fees">Semester Fee Clearance & Invoicing</option>
                      <option value="facilities">Mess Menu & Facility Standards</option>
                      <option value="complaint">Maintenance Grievance & SLA Escalation</option>
                      <option value="other">Institutional Query</option>
                    </select>
                  </div>

                  <div className="contact-form-group">
                    <label>Dossier Message *</label>
                    <textarea
                      name="message"
                      rows={4}
                      placeholder="Specify your inquiry in detail..."
                      value={formData.message}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <button type="submit" className="contact-submit-btn" disabled={loading}>
                    {loading ? (
                      <>
                        <span style={{ width: 14, height: 14, border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#090b10', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                        <span>Logging Ticket...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Official Inquiry</span>
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}