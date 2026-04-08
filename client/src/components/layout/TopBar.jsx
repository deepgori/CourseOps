import { CalendarDays } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { format } from 'date-fns';
import { pageMeta } from '../../utils/constants';

export const TopBar = () => {
  const location = useLocation();
  const page = pageMeta[location.pathname] || pageMeta['/'];

  return (
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-white/45 bg-white/38 px-8 backdrop-blur-2xl">
      <div>
        <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-copy">{page.title}</h1>
        <p className="hidden text-[13px] text-copyMuted xl:block">{page.subtitle}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 rounded-[10px] border border-white/55 bg-white/60 px-3 py-2 text-[13px] text-copyMuted shadow-panel md:flex">
          <CalendarDays className="h-4 w-4" />
          <span>{format(new Date(), 'EEEE, MMM d')}</span>
        </div>
        <div className="flex items-center gap-3 rounded-[12px] border border-white/55 bg-white/65 px-3 py-2 shadow-panel">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand to-[#8c9cff] text-[12px] font-semibold text-white">
            CO
          </div>
          <div className="hidden md:block">
            <p className="text-[14px] font-medium text-copy">CourseOps Desk</p>
            <p className="text-[12px] text-copyMuted">University Online Learning</p>
          </div>
        </div>
      </div>
    </header>
  );
};
