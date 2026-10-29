import React from 'react';
import {
  Sparkles,
  Building2,
  Key,
  ShieldCheck,
  UtensilsCrossed,
  FileText,
  CreditCard,
  CheckCircle2,
  Clock,
  ArrowRight,
  UserPlus,
  Lock
} from 'lucide-react';

export default function UnadmittedView({ user, onOpenAdmission }) {
  const lockedFeatures = [
    {
      icon: <Building2 className="w-5 h-5 text-[#128bc0]" />,
      title: 'Digital Room & Bed Allotment',
      desc: 'Get allotted to an AC/Non-AC room with dedicated bed ID, floor details, and roommates directory.',
      tag: 'Admission Required',
    },
    {
      icon: <Key className="w-5 h-5 text-emerald-600" />,
      title: 'Online Leave Applications & Gatepass',
      desc: 'Apply for day leaves, weekend visits, or vacation permissions with digital Warden e-signatures.',
      tag: 'Admission Required',
    },
    {
      icon: <UtensilsCrossed className="w-5 h-5 text-orange-500" />,
      title: 'Hostel Dining & Weekly Meal Tracker',
      desc: 'Live 7-day breakfast, lunch, snacks, and dinner schedules, calorie insights, and mess leave rebates.',
      tag: 'Admission Required',
    },
    {
      icon: <FileText className="w-5 h-5 text-amber-600" />,
      title: 'Grievance & Complaint Portal',
      desc: 'Raise electrical, plumbing, Wi-Fi, or furniture issues directly to hostel wardens with live status.',
      tag: 'Admission Required',
    },
    {
      icon: <CreditCard className="w-5 h-5 text-rose-500" />,
      title: 'Fee Dues & Instant Receipts',
      desc: 'Pay semester hostel and mess dues via UPI/cards and instantly download verified tax receipts.',
      tag: 'Admission Required',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#128bc0]" />,
      title: 'Floor Attendance & Smart Access',
      desc: 'Digital check-in records, night curfew alerts, and floor attendance tracking.',
      tag: 'Admission Required',
    },
  ];

  return (
    <div className="w-full space-y-10 animate-fade-in font-sans">
      {/* Hero Admission Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-[#d6e0d7] shadow-[0_8px_24px_rgba(21,35,42,0.04)] p-8 md:p-12">
        {/* Subtle warm glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#128bc0]/5 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#e8f1f5] border border-[#bce4f6] text-xs font-semibold text-[#128bc0] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#128bc0]" />
            <span>Hostel Resident Onboarding · 2026</span>
          </div>

          <div className="space-y-3">
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#15232a] tracking-tight leading-tight">
              Welcome, <span className="text-[#128bc0]">{user?.name || 'Student'}</span>!
              <br />
              Complete Your <span className="text-[#128bc0] italic">Hostel Admission</span>
            </h1>
            <p className="text-sm md:text-base text-[#586d65] leading-relaxed max-w-2xl font-light">
              You are currently registered as a resident applicant. To access room allotment, mess schedules, leave applications, fee management, and complaint resolution, please complete your hostel admission dossier.
            </p>
          </div>

          {/* Key Checklist Badges */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#15232a] pt-1">
            <div className="flex items-center gap-1.5 bg-[#fbfbf9] px-3.5 py-2 rounded-xl border border-[#dce5dc] shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Instant Room Assignment</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#fbfbf9] px-3.5 py-2 rounded-xl border border-[#dce5dc] shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Paperless Verification</span>
            </div>
            <div className="flex items-center gap-1.5 bg-[#fbfbf9] px-3.5 py-2 rounded-xl border border-[#dce5dc] shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>24/7 Digital Portal Access</span>
            </div>
          </div>

          {/* Action CTA Button */}
          <div className="pt-3 flex flex-wrap items-center gap-4">
            <button
              onClick={onOpenAdmission}
              className="btn-arch-primary px-6 py-3 rounded-full text-sm font-semibold flex items-center gap-2.5 cursor-pointer shadow-md"
            >
              <UserPlus className="w-4 h-4 text-white" />
              <span>Admit Now / Complete Admission</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
            <div className="text-xs text-[#586d65] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#128bc0]" />
              Takes less than 1 minute to fill
            </div>
          </div>
        </div>
      </div>

      {/* Feature Preview Grid */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#dce5dc] pb-4">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#15232a] tracking-tight">Features Unlocked After Admission</h2>
            <p className="text-xs text-[#586d65] mt-1">
              Everything you will be able to manage once your admission is verified.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#e8f1f5] text-[#128bc0] border border-[#bce4f6]">
            6 Campus Modules
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {lockedFeatures.map((feat, index) => (
            <div
              key={index}
              className="relative group p-6 rounded-2xl bg-white hover:bg-[#fbfbf9] border border-[#d6e0d7] hover:border-[#128bc0]/40 shadow-[0_4px_20px_rgba(21,35,42,0.04)] transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-xl bg-[#e8f1f5] border border-[#bce4f6] group-hover:border-[#128bc0]/30 transition-all">
                    {feat.icon}
                  </div>
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-[#f5f6f0] text-[#586d65] border border-[#dce5dc]">
                    {feat.tag}
                  </span>
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-[#15232a] group-hover:text-[#128bc0] transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-[#586d65] leading-relaxed mt-1.5">{feat.desc}</p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#dce5dc] flex items-center justify-between">
                <span className="text-[11px] font-medium text-[#586d65] flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-[#586d65]" />
                  <span>Admission Restricted</span>
                </span>
                <button
                  onClick={onOpenAdmission}
                  className="text-xs font-medium text-[#128bc0] hover:text-[#15232a] flex items-center gap-1 transition-all cursor-pointer"
                >
                  <span>Unlock module</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
