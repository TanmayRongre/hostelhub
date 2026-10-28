import React, { useState } from 'react';
import useInView from '../../hooks/useInView';
import {
  QrCode,
  Wrench,
  KeyRound,
  Users,
  UtensilsCrossed,
  CreditCard,
  FileDown,
  Bell,
  Grid,
  ArrowUpRight,
} from 'lucide-react';

const FEATURES = [
  {
    number: '01',
    category: 'Daily Presence',
    title: 'QR Attendance',
    tag: 'Quick Roll-Call',
    desc: 'Mark daily attendance effortlessly with dynamic QR scanning. Instant check-in records for students and zero-proxy night audits for wardens.',
    icon: <QrCode className="w-5 h-5" />,
    stats: 'Instant Verification',
  },
  {
    number: '02',
    category: 'Repairs & Help',
    title: 'Room Complaints',
    tag: 'Fast Resolution',
    desc: 'Raise maintenance tickets for electrical, plumbing, Wi-Fi, or cleaning with photos. Track technician updates in real time until fixed.',
    icon: <Wrench className="w-5 h-5" />,
    stats: 'Live Status Tracking',
  },
  {
    number: '03',
    category: 'Gate Clearance',
    title: 'Leave & Outpass',
    tag: 'Digital Approval',
    desc: 'Apply for home visits, weekend leaves, and day passes online. Get quick warden approvals with digital security gate logs.',
    icon: <KeyRound className="w-5 h-5" />,
    stats: 'Paperless Outpass',
  },
  {
    number: '04',
    category: 'Guest Entry',
    title: 'Visitor Passes',
    tag: 'Gate Security',
    desc: 'Pre-register visiting parents and guests. Security guards verify digital visitor badges and log entry and exit times safely.',
    icon: <Users className="w-5 h-5" />,
    stats: 'Safe Visitor Records',
  },
  {
    number: '05',
    category: 'Food & Dining',
    title: 'Daily Mess Menu',
    tag: '4 Meals Daily',
    desc: 'Check live daily menus for breakfast, lunch, snacks, and dinner. View meal schedules, timing alerts, and share dining feedback.',
    icon: <UtensilsCrossed className="w-5 h-5" />,
    stats: 'Weekly Meal Schedule',
  },
  {
    number: '06',
    category: 'Billing & Dues',
    title: 'Fee Payments',
    tag: 'Instant Receipt',
    desc: 'View semester hostel and mess charges, pay pending dues securely online, and download tax-ready payment invoices instantly.',
    icon: <CreditCard className="w-5 h-5" />,
    stats: 'Secure Online Portal',
  },
  {
    number: '07',
    category: 'Data & Analytics',
    title: 'Reports & Export',
    tag: 'PDF & Excel',
    desc: 'Generate and export comprehensive hostel audit reports — attendance logs, fee ledgers, visitor history, and complaint resolutions.',
    icon: <FileDown className="w-5 h-5" />,
    stats: 'Instant PDF / Excel',
  },
  {
    number: '08',
    category: 'Announcements',
    title: 'Notice Board',
    tag: 'Hostel Circulars',
    desc: 'Stay informed with instant hostel announcements, event circulars, curfew updates, and emergency notices from the warden desk.',
    icon: <Bell className="w-5 h-5" />,
    stats: 'Real-Time Broadcast',
  },
];

export default function FeaturesSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const { ref: headRef, inView: headIn } = useInView();
  const { ref: sectionRef, inView: sectionIn } = useInView({ threshold: 0.08 });

  return (
    <section id="capabilities" className="lp-section lp-bg-b">
      <div className="lp-inner">
        {/* Header */}
        <div ref={headRef} className={`lp-header-center reveal ${headIn ? 'in-view' : ''}`}>
          <div className="lp-tag">
            <Grid className="w-3.5 h-3.5 text-[#dfba73]" />
            <span>All Core Modules</span>
          </div>
          <h2 className="lp-heading">
            Everything You Need for <span>Hostel Living</span>
          </h2>
          <p className="lp-sub">
            From attendance and complaints to leaves, visitors, mess menus, and reports — all handled seamlessly in one place.
          </p>
        </div>

        {/* Horizontal Expandable Service Cards (Flaxan-Style Accordion) */}
        <div
          ref={sectionRef}
          className={`features-accordion-container reveal-scale ${sectionIn ? 'in-view' : ''}`}
        >
          <div
            className="features-accordion"
            role="tablist"
            aria-label="Campus living features accordion"
          >
            {FEATURES.map((f, i) => {
              const isActive = activeIdx === i;

              return (
                <div
                  key={f.number}
                  className={`features-accordion-card ${isActive ? 'active' : ''}`}
                  onMouseEnter={() => setActiveIdx(i)}
                  onClick={() => setActiveIdx(i)}
                  onFocus={() => setActiveIdx(i)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveIdx(i);
                    }
                  }}
                  tabIndex={0}
                  role="tab"
                  aria-selected={isActive}
                  aria-label={f.title}
                >
                  {/* Collapsed State: Narrow tab with Number, Vertical Title, and Icon */}
                  <div className="features-card-collapsed">
                    <span className="card-collapsed-num">{f.number}</span>
                    <span className="card-vertical-title">{f.title}</span>
                    <div className="card-collapsed-icon">{f.icon}</div>
                  </div>

                  {/* Expanded State: Full Rich Content */}
                  <div className="features-card-expanded">
                    <div className="expanded-top-row">
                      <span className="expanded-badge">
                        {f.number} · {f.category}
                      </span>
                      <div className="expanded-icon">{f.icon}</div>
                    </div>

                    <div className="expanded-body">
                      <h3 className="expanded-title">{f.title}</h3>
                      <div className="expanded-tag">{f.tag}</div>
                      <p className="expanded-desc">{f.desc}</p>
                    </div>

                    <div className="expanded-footer">
                      <div className="expanded-footer-info">
                        <span className="dot" />
                        <span>{f.stats}</span>
                      </div>
                      <div className="expanded-arrow-btn" title="System Integrated">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
