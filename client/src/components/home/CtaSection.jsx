import React from 'react';
import { Link } from 'react-router-dom';
import useInView from '../../hooks/useInView';
import { LogIn, UserPlus, Sparkles } from 'lucide-react';

export default function CtaSection() {
  const { ref, inView } = useInView({ threshold: 0.2 });

  return (
    <section className="lp-section lp-bg-c">
      <div className="lp-inner">
        <div ref={ref} className={`cta-banner reveal-scale ${inView ? 'in-view' : ''}`}>
          <h2>
            Modernize Your Institution's{' '}
            <span className="text-[#128bc0] italic font-bold">
              Residential Operations
            </span>
          </h2>
          <p>
            Retire fragmented paper manifests, untracked complaints, and manual nightly rolls.
            Deploy an auditable, high-security campus management system today.
          </p>
          <div className="cta-btn-row">
            <Link to="/register" className="cta-btn-primary">
              <UserPlus className="w-4 h-4" />
              <span>Student Resident Onboarding</span>
            </Link>
            <Link to="/login" className="cta-btn-secondary">
              <LogIn className="w-4 h-4" />
              <span>Sign In to Institutional Portal</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
