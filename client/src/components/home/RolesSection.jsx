import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

const ROLES = [
  {
    id: 'student',
    cls: 'student',
    theme: 'gold',
    stepNumber: '01',
    code: 'RESIDENT.OS',
    label: 'Resident Portal',
    title: 'Student',
    tagline: 'Resident Self-Service Dashboard',
    desc: 'Directly manage daily hostel life from your personal dashboard — scan nightly attendance, file room complaints, apply for leave, pay fees, and view mess menus.',
    accessLevel: 'TIER 01 // RESIDENT AUTH',
    features: [
      'Scan dynamic QR code for daily nightly attendance verification',
      'Raise room maintenance complaints & track live resolution progress',
      'Apply for day outpass & outstation leave with approval status',
      'Submit visitor gatepass requests for family & guest entries',
      'View semester fee invoices, pay online & download receipts',
      'Check 7-day dining mess schedule & submit meal ratings (1-5★)',
    ],
    cta: 'Enter Student Portal',
    link: '/login',
  },
  {
    id: 'warden',
    cls: 'warden',
    theme: 'emerald',
    stepNumber: '02',
    code: 'WARDEN.DESK',
    label: 'Residence Desk',
    title: 'Warden',
    tagline: 'Floor & Block Operations Desk',
    desc: 'Supervise daily hostel operations — generate attendance QR codes, review leave applications, resolve student complaints, approve visitors, and broadcast circulars.',
    accessLevel: 'TIER 02 // SUPERVISORY DESK',
    features: [
      'Generate time-limited dynamic QR code for nightly resident roll-call',
      'Approve or reject student outpass & outstation leave requests',
      'Manage student maintenance complaints & assign technician priorities',
      'Authorize and approve visitor gate entry clearances in real time',
      'Broadcast official hostel notices & emergency alerts to residents',
      'Inspect room occupancies, vacant bed status & student profiles',
    ],
    cta: 'Enter Warden Desk',
    link: '/login',
  },
  {
    id: 'admin',
    cls: 'admin-r',
    theme: 'cyan',
    stepNumber: '03',
    code: 'ADMIN.COMMAND',
    label: 'Institutional Command',
    title: 'Admin',
    tagline: 'Global Governance & System Oversight',
    desc: 'Complete campus control — allocate hostel blocks and rooms, manage student admissions, track fee payments, assign wardens, and inspect audit logs.',
    accessLevel: 'TIER 03 // ROOT GOVERNANCE',
    features: [
      'Configure hostel blocks, room types (AC/Non-AC) & bed inventory',
      'Process student admissions, room allotments & resident directory',
      'Issue semester fee invoices, track payments & inspect financial ledger',
      'Provision warden credentials & assign supervisory hostel blocks',
      'Monitor live system health, database latency & server telemetry',
      'Review immutable security audit logs for all administrative events',
    ],
    cta: 'Enter Admin Hub',
    link: '/login',
  },
];

export default function RolesSection() {
  const sectionRef = useRef(null);
  const card0Ref = useRef(null);
  const card1Ref = useRef(null);
  const card2Ref = useRef(null);
  const [activeStep, setActiveStep] = useState(0);

  const cardRefs = [card0Ref, card1Ref, card2Ref];

  useGSAP(() => {
    const cards = [card0Ref.current, card1Ref.current, card2Ref.current];
    if (cards.some((card) => !card)) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      gsap.set(cards, {
        clearProps: 'all',
        position: 'relative',
        y: 0,
        opacity: 1,
        scale: 1,
      });
      return;
    }

    // Helper: calculate distance from card resting top to below the viewport bottom
    const getBottomOffset = (card) => {
      if (!card) return window.innerHeight + 100;
      const currentY = gsap.getProperty(card, 'y') || 0;
      const restingTop = card.getBoundingClientRect().top - currentY;
      return Math.max(window.innerHeight - restingTop + 40, window.innerHeight * 0.85);
    };

    // Set deterministic initial states
    gsap.set(cards[0], {
      y: 0,
      scale: 1,
      opacity: 1,
      zIndex: 10,
      transformOrigin: 'center top',
    });

    gsap.set(cards[1], {
      y: () => getBottomOffset(cards[1]),
      scale: 1,
      opacity: 1,
      zIndex: 20,
      transformOrigin: 'center top',
    });

    gsap.set(cards[2], {
      y: () => getBottomOffset(cards[2]),
      scale: 1,
      opacity: 1,
      zIndex: 30,
      transformOrigin: 'center top',
    });

    const timeline = gsap.timeline({
      scrollTrigger: {
        id: 'roles-pin',
        trigger: sectionRef.current,
        start: 'top 64px',
        end: '+=200%',
        pin: true,
        pinSpacing: true,
        scrub: 0.8,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const p = self.progress;
          const step = p < 0.36 ? 0 : p < 0.72 ? 1 : 2;
          setActiveStep((prev) => (prev === step ? prev : step));
        },
      },
    });

    // 1. Hold Card 0 (Student Resident) initially in the card stage
    timeline
      .to({}, { duration: 0.3 })

      // 2. Card 1 (Hostel Warden) slides up from the absolute bottom of the viewport
      .fromTo(
        cards[1],
        { y: () => getBottomOffset(cards[1]) },
        {
          y: 0,
          ease: 'power2.inOut',
          duration: 1.0,
        }
      )
      .to(
        cards[0],
        {
          scale: 0.95,
          y: -14,
          opacity: 0.5,
          ease: 'power2.inOut',
          duration: 1.0,
        },
        '<'
      )

      // 3. Hold Card 1 in place for reading
      .to({}, { duration: 0.3 })

      // 4. Card 2 (Campus Administrator) slides up from the absolute bottom of the viewport
      .fromTo(
        cards[2],
        { y: () => getBottomOffset(cards[2]) },
        {
          y: 0,
          ease: 'power2.inOut',
          duration: 1.0,
        }
      )
      .to(
        cards[1],
        {
          scale: 0.95,
          y: -14,
          opacity: 0.5,
          ease: 'power2.inOut',
          duration: 1.0,
        },
        '<'
      )
      .to(
        cards[0],
        {
          scale: 0.90,
          y: -26,
          opacity: 0.2,
          ease: 'power2.inOut',
          duration: 1.0,
        },
        '<'
      )

      // 5. Hold Card 2 before unpinning
      .to({}, { duration: 0.3 });

    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, { scope: sectionRef });

  const handlePillClick = (idx) => {
    const trigger = ScrollTrigger.getById('roles-pin');
    if (!trigger) return;

    const targets = [0.1, 0.5, 0.9];
    const targetProgress = targets[idx] ?? idx / 2;
    const target = trigger.start + targetProgress * (trigger.end - trigger.start);

    const reducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    window.scrollTo({
      top: target,
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <section ref={sectionRef} id="roles-section" className="lp-section lp-bg-a roles-pinned-section">
      <div className="roles-pinned-inner">
        {/* Sleek, minimal role navigation directly above cards — zero redundant headings */}
        <div className="roles-nav-pills">
          {ROLES.map((role, idx) => (
            <button
              key={role.id}
              type="button"
              onClick={() => handlePillClick(idx)}
              className={`roles-nav-pill ${activeStep === idx ? `active ${role.theme}` : ''}`}
            >
              <span className="roles-nav-num">{role.stepNumber}</span>
              <span className="roles-nav-title">{role.title}</span>
            </button>
          ))}
        </div>

        {/* Pinned Card Deck Stage */}
        <div className="roles-card-deck">
          {ROLES.map((role, idx) => (
            <div
              key={role.id}
              ref={cardRefs[idx]}
              className={`roles-deck-card card-${idx} ${role.cls}`}
              style={{ zIndex: 10 + idx * 10 }}
            >
              {/* Left Column: Role Details & CTA */}
              <div className="roles-card-left-col">
                <div className="roles-card-primary-info">
                  {/* Top Meta Bar */}
                  <div className="roles-card-topbar">
                    <span className={`roles-sys-code ${role.theme}`}>{role.code}</span>
                    <span className="roles-sys-stage">STAGE {role.stepNumber} OF 03</span>
                  </div>

                  {/* Title & Tagline */}
                  <div className="roles-card-title-group">
                    <h3 className="roles-card-headline">{role.title}</h3>
                    <div className={`roles-card-tagline ${role.theme}`}>{role.tagline}</div>
                  </div>

                  <p className="roles-card-desc">{role.desc}</p>
                </div>

                {/* Bottom Left: Pure CSS CTA and Auth Badge */}
                <div className="roles-card-action-box">
                  <Link to={role.link} className={`roles-card-cta-btn ${role.theme}`}>
                    <span>{role.cta}</span>
                    <span className="roles-cta-arrow">→</span>
                  </Link>
                  <div className="roles-card-access-chip">
                    <span className={`status-dot ${role.theme}`} />
                    <span>{role.accessLevel}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Workflows Matrix (Zero SVGs, Monospaced Protocol Indices) */}
              <div className="roles-card-right-col">
                <div className="roles-card-right-header">
                  <div className="roles-workflows-title">
                    <span className="roles-title-text">SYSTEM CAPABILITIES</span>
                    <span className="roles-title-sub">REAL-TIME PROTOCOLS</span>
                  </div>
                  <span className={`roles-audited-badge ${role.theme}`}>
                    <span className={`status-dot ${role.theme}`} />
                    LIVE VERIFIED
                  </span>
                </div>

                <div className="roles-protocols-grid">
                  {role.features.map((feature, fIdx) => (
                    <div key={fIdx} className="roles-protocol-item">
                      <span className={`roles-protocol-num ${role.theme}`}>
                        0{fIdx + 1}
                      </span>
                      <span className="roles-protocol-text">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="roles-card-footer-strip">
                  <div className="roles-footer-meta">
                    <span className="roles-footer-bullet">•</span>
                    <span>ENTERPRISE RESIDENCE OS</span>
                  </div>
                  <div className="roles-footer-meta">
                    <span className="roles-footer-bullet">•</span>
                    <span>ZERO-TRUST ACCESS CONTROL</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
