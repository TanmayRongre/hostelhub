import React from 'react';
import useInView from '../../hooks/useInView';
import { BarChart3 } from 'lucide-react';

const STATS = [
  { value: '2,400+', label: 'Registered Residents' },
  { value: '12', label: 'Residence Blocks' },
  { value: '850+', label: 'Accommodations Monitored' },
  { value: '98.4%', label: 'Grievance Resolution Rate' },
];

export default function StatsSection() {
  const { ref: headRef, inView: headIn } = useInView();
  const { ref: stripRef, inView: stripIn } = useInView({ threshold: 0.2 });

  return (
    <section id="impact" className="lp-section lp-bg-b">
      <div className="lp-inner">
        <div ref={headRef} className={`lp-header-center reveal ${headIn ? 'in-view' : ''}`} style={{ marginBottom: 48 }}>
          <div className="lp-tag">
            <BarChart3 className="w-3.5 h-3.5 text-[#dfba73]" />
            <span>Institutional Impact</span>
          </div>
          <h2 className="lp-heading">
            Proven at Scale Across <span>Leading Campuses</span>
          </h2>
          <p className="lp-sub">Empirical metrics reflecting residential operational excellence and accountability.</p>
        </div>
        <div ref={stripRef} className="stats-strip">
          {STATS.map((s, i) => (
            <div key={i} className={`stat-block reveal stagger-${i + 1} ${stripIn ? 'in-view' : ''}`}>
              <div className="stat-block-value">{s.value}</div>
              <div className="stat-block-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
