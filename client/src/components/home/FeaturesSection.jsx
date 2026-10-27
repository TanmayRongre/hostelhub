import React, { useState } from 'react';
import useInView from '../../hooks/useInView';
import {
  Building2,
  ClipboardList,
  UtensilsCrossed,
  KeyRound,
  Activity,
  CreditCard,
  Megaphone,
  Wrench,
  Grid,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';

const FEATURES = [
  {
    number: '01',
    category: 'Allocation Engine',
    title: 'Room Allotment & Bed Registry',
    tag: 'Automated Matrix',
    desc: 'Automated room allocation matrices based on branch, year, gender, and preference across all residential blocks.',
    icon: <Building2 className="w-5 h-5" />,
    stats: 'Multi-Block Capacity',
  },
  {
    number: '02',
    category: 'Grievance Desk',
    title: 'Maintenance & Grievance Tickets',
    tag: 'SLA Tracking',
    desc: 'Students file tickets with photographs; wardens track SLA response and resolve with verifiable completion logs.',
    icon: <ClipboardList className="w-5 h-5" />,
    stats: 'Live Technician Logs',
  },
  {
    number: '03',
    category: 'Dietary Operations',
    title: 'Nutritional Mess & Dining Schedules',
    tag: 'Weekly Cycle',
    desc: 'Weekly 4-meal cycle schedules, dietary feedback channels, and real-time meal timing notifications.',
    icon: <UtensilsCrossed className="w-5 h-5" />,
    stats: '4-Meal Daily Cycle',
  },
  {
    number: '04',
    category: 'Security Protocols',
    title: 'Digital Gate-Pass & Outstation Leaves',
    tag: 'Paperless Leave',
    desc: 'End-to-end paperless leave workflows — instant parent SMS verification, warden signatures, and security gate logs.',
    icon: <KeyRound className="w-5 h-5" />,
    stats: 'Two-Way Security Sync',
  },
  {
    number: '05',
    category: 'Audit & Roll Call',
    title: 'Automated QR Night Attendance',
    tag: 'Geo-Verification',
    desc: 'Floor-by-floor geolocation-verified QR roll calls with instant absent alerts to resident wardens.',
    icon: <Activity className="w-5 h-5" />,
    stats: 'Zero-Proxy Audit',
  },
  {
    number: '06',
    category: 'Treasury & Ledger',
    title: 'Institutional Fee Accounting',
    tag: 'Instant Receipt',
    desc: 'Digital semester fee collection, instant downloadable tax receipts, dues reconciliation, and caution deposits.',
    icon: <CreditCard className="w-5 h-5" />,
    stats: 'Automated Clearance',
  },
  {
    number: '07',
    category: 'Broadcast Gateway',
    title: 'Instant Broadcast Dispatcher',
    tag: 'Direct Dispatch',
    desc: 'Segmented announcements pushed directly to resident portals — block-specific or entire campus-wide.',
    icon: <Megaphone className="w-5 h-5" />,
    stats: 'Sub-Second Broadcast',
  },
  {
    number: '08',
    category: 'Facility Management',
    title: 'Campus Facility Operations',
    tag: 'Preventive Care',
    desc: 'Centralized preventive maintenance tracking for high-speed Wi-Fi, plumbing, electrical fixtures, and gym amenities.',
    icon: <Wrench className="w-5 h-5" />,
    stats: '24/7 Operations Hub',
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
            <span>Operational Capabilities</span>
          </div>
          <h2 className="lp-heading">
            Enterprise Architecture for <span>Modern Residences</span>
          </h2>
          <p className="lp-sub">
            From algorithmic room allotments to QR night audits — every campus living operation digitized with precision.
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
