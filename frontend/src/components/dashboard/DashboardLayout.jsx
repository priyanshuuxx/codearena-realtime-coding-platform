import { useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { gsap } from 'gsap';
import Sidebar from './Sidebar.jsx';
import TopHeader from './TopHeader.jsx';

function DashboardLayout({ children, user, logout }) {
  const rootRef = useRef(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!root || reduceMotion) {
      return undefined;
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        '.dashboard-reveal',
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: 0.58, ease: 'power3.out', stagger: 0.06 },
      );

      gsap.to('.live-dot', {
        scale: 1.35,
        opacity: 0.7,
        duration: 1.8,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: -1,
        stagger: 0.16,
      });

      gsap.to('.mini-particle', {
        x: 34,
        opacity: 0,
        duration: 2.4,
        ease: 'power2.inOut',
        repeat: -1,
        repeatDelay: 1.8,
        stagger: 0.45,
      });

      gsap.fromTo(
        '.progress-fill',
        { width: '0%' },
        { width: (_, element) => element.dataset.width, duration: 0.9, ease: 'power3.out', stagger: 0.08 },
      );
    }, root);

    return () => context.revert();
  }, []);

  return (
    <main ref={rootRef} className="app-shell min-h-screen bg-slate-50 text-slate-950">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_78%_12%,rgba(99,102,241,0.09),transparent_28%),radial-gradient(circle_at_12%_18%,rgba(14,165,233,0.08),transparent_25%)]" />
      <div className="relative grid min-h-screen lg:grid-cols-[280px_1fr]">
        <Sidebar user={user} />
        <div className="min-w-0">
          <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 lg:hidden">
            <div className="font-bold text-slate-950">CodeArena</div>
            <button className="rounded-md border border-slate-200 p-2" type="button" onClick={() => setIsMobileNavOpen(true)} aria-label="Open navigation">
              <Menu size={19} />
            </button>
          </div>
          <TopHeader
            title="Control Room"
            logout={logout}
            onNotifications={() => setIsNotificationsOpen(true)}
            onProfile={() => setIsProfileOpen(true)}
          />
          <div className="px-5 py-6 xl:px-8">{children}</div>
        </div>
      </div>

      {isMobileNavOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-sm lg:hidden">
          <div className="h-full w-[280px] bg-white p-5 shadow-2xl">
            <div className="mb-4 flex justify-end">
              <button className="rounded-md border border-slate-200 p-2" type="button" onClick={() => setIsMobileNavOpen(false)} aria-label="Close navigation">
                <X size={18} />
              </button>
            </div>
            <Sidebar user={user} mobile />
          </div>
        </div>
      )}
      {(isNotificationsOpen || isProfileOpen) && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/20 backdrop-blur-sm">
          <aside className="h-full w-full max-w-sm border-l border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
                  {isNotificationsOpen ? 'Notifications' : 'Profile'}
                </p>
                <h3 className="mt-1 text-xl font-bold text-slate-950">
                  {isNotificationsOpen ? 'CodeArena updates' : user?.name || 'Student Profile'}
                </h3>
              </div>
              <button className="rounded-md border border-slate-200 p-2 text-slate-500 hover:text-slate-950" type="button" onClick={() => { setIsNotificationsOpen(false); setIsProfileOpen(false); }} aria-label="Close panel">
                <X size={18} />
              </button>
            </div>
            {isNotificationsOpen ? (
              <div className="mt-6 space-y-3">
                {['1,000 DSA problems are ready.', '1,000 debugging tasks are ready.', '1,000 MCQs are ready.', 'Level-based bot battles are active.'].map((item) => (
                  <div key={item} className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                    {item}
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-6 space-y-4 text-sm text-slate-600">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-indigo-600 text-xl font-bold text-white">
                  {(user?.name || 'P').slice(0, 1).toUpperCase()}
                </div>
                <p><span className="font-semibold text-slate-950">Email:</span> {user?.email}</p>
                <p><span className="font-semibold text-slate-950">Role:</span> {user?.role || 'USER'}</p>
                <p><span className="font-semibold text-slate-950">Rating:</span> {user?.rating || 1000}</p>
              </div>
            )}
          </aside>
        </div>
      )}
    </main>
  );
}

export default DashboardLayout;
