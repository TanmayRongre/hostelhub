import React from 'react';
import useInView from '../../hooks/useInView';
import { ListOrdered, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    n: '01',
    title: 'Institutional Enrollment & Verification',
    desc: 'Students register with their university enrollment ID. System auto-verifies academic credentials and generates an official admission dossier.',
  },
  {
    n: '02',
    title: 'Role-Scoped Dashboard Provisioning',
    desc: 'Instant role-based authorization. Students, Resident Wardens, and Campus Administrators each access tailored workflows and live datasets.',
  },
  {
    n: '03',
    title: 'Audited Paperless Campus Living',
    desc: 'Zero manual paperwork. Submit gate passes, record QR attendance, dispute meal dues, and inspect infrastructure status in real time.',
  },
];

export default function HowItWorksSection() {
  const { ref: headRef, inView: headIn } = useInView();
  const { ref: stepsRef, inView: stepsIn } = useInView({ threshold: 0.15 });

  return (
    <section id="workflow" className="lp-section lp-bg-a">
      <div className="lp-inner">
        <div ref={headRef} className={`lp-header-center reveal ${headIn ? 'in-view' : ''}`}>
          <div className="lp-tag">
            <ListOrdered className="w-3.5 h-3.5 text-[#dfba73]" />
            <span>Workflow Protocol</span>
          </div>
          <h2 className="lp-heading">
            Seamless Onboarding in <span>3 Structured Steps</span>
          </h2>
          <p className="lp-sub">
            Designed for high-throughput academic institutions with frictionless digital verification.
          </p>
        </div>
        <div ref={stepsRef} className="hiw-steps">
          {STEPS.map((s, i) => (
            <div
              key={i}
              className={`hiw-step reveal stagger-${i + 1} ${stepsIn ? 'in-view' : ''}`}
            >
              <div className="hiw-number">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
