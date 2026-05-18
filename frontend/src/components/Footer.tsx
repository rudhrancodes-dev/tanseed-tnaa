import { Shield } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="px-4 pb-12 pt-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-[32px] bg-slate-950 px-6 py-10 text-slate-200 shadow-[0_28px_70px_rgba(15,23,42,0.18)] md:px-8">
        <div className="grid grid-cols-1 gap-8 border-b border-white/10 pb-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-2xl"
                style={{ background: 'linear-gradient(135deg, #1E3A8A 0%, #10B981 100%)' }}
              >
                <span className="text-white text-[11px] font-bold tracking-[0.08em]">TN</span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">StartupTN</p>
                <span className="text-sm font-semibold tracking-[-0.02em] text-white">TANSEED</span>
              </div>
            </div>
            <p className="mb-4 max-w-[240px] text-sm leading-7 text-slate-300">
              AI-powered grant assistance for Tamil Nadu startups. Fast-track your TANSEED application.
            </p>
            <div
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-400/15 bg-emerald-400/10 px-3 py-1.5 text-[11px] font-medium text-emerald-200"
            >
              <Shield size={10} strokeWidth={2} style={{ color: '#6EE7B7' }} />
              Official TANSEED Portal
            </div>
          </div>

          {[
            { title: 'Program', links: ['About TANSEED', 'Eligibility', 'FAQ', 'Success Stories'] },
            { title: 'Resources', links: ['StartupTN Portal', 'DPIIT Recognition', 'TANSIM Portal', 'Help Center'] },
            { title: 'Legal', links: ['Terms of Use', 'Privacy Policy', 'Accessibility', 'Grievance'] },
          ].map((group) => (
            <div key={group.title}>
              <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                {group.title}
              </h4>
              <ul className="space-y-2.5">
                {group.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-slate-200 transition-colors duration-150 hover:text-white"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-between gap-3 pt-6 md:flex-row">
          <p className="text-[11px] text-slate-400">
            &copy; {new Date().getFullYear()} TANSEED Grant Assistance. Powered by StartupTN.
          </p>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>v2.0</span>
            <span>Made in Tamil Nadu</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
