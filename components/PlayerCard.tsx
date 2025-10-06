
import React from 'react';
import type { Technician } from '../types';
import { StarIcon } from './icons/StarIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { CurrencyDollarIcon } from './icons/CurrencyDollarIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { MembershipIcon } from './icons/MembershipIcon';

interface PlayerCardProps {
  technician: Technician;
  quarter: string;
  year: string;
  companyLogo?: string | null;
  companyName?: string;
}

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  iconClassName?: string;
}

const StatItem: React.FC<StatItemProps> = ({ icon, label, value, iconClassName }) => (
  <div className="flex flex-col items-center justify-center text-center p-3 rounded-xl bg-slate-600">
    <div className={`w-7 h-7 mb-1 ${iconClassName || 'text-yellow-400'}`}>{icon}</div>
    <div className="text-2xl font-bold tracking-tighter text-white">{value}</div>
    <div className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">{label}</div>
  </div>
);

const badgeIcons: { [key: string]: React.ReactNode } = {
  'MVP': '🏆',
  'Ironman': '💪',
  'Playmaker': '✨',
  'Fan Favorite': '⭐',
  'Club Captain': <MembershipIcon className="w-6 h-6 text-yellow-400" />,
};

export const PlayerCard: React.FC<PlayerCardProps> = ({ technician, quarter, year, companyLogo, companyName }) => {
  const {
    name,
    position,
    photoUrl,
    technicianNumber,
    avgPerformance,
    ticketValue,
    impactPoints,
    fiveStarReviews,
    membershipsSold,
    badges,
  } = technician;
  
  const companyNameParts = companyName?.split(' ') || [];

  return (
    <div 
      className="relative w-full aspect-[9/16] rounded-3xl shadow-2xl p-5 flex flex-col justify-between font-sans transition-all duration-300 border border-yellow-400/60 hover:scale-105 hover:drop-shadow-[0_0_20px_rgba(250,204,21,0.4)]"
      style={{ background: 'radial-gradient(circle at 50% 50%, #1e3a4b, #0f172a)' }}
    >
      <header className="relative z-10 flex justify-between items-start">
        <div className="flex items-center gap-2">
          {companyLogo && <img src={companyLogo} alt="Company Logo" className="w-12 h-12 rounded-lg object-cover" />}
          <div>
            {companyNameParts.map((part, index) => (
                <p key={index} className="text-sm font-bold leading-tight text-slate-200">{part}</p>
            ))}
          </div>
        </div>
        <div className="text-right">
            <p className="text-lg font-bold text-yellow-400 uppercase tracking-wider">PRO CARD</p>
            <p className="text-sm font-light text-gray-300">{quarter} {year}</p>
        </div>
      </header>

      <main className="relative z-10 flex flex-col items-center justify-center">
        <div className="relative">
             <div 
              className="relative w-56 h-56 rounded-full flex items-center justify-center overflow-hidden border-4 border-white"
              style={{ boxShadow: '0 0 100px rgba(250, 204, 21, 0.18)' }}
            >
                {photoUrl && (
                <img
                    src={photoUrl}
                    alt={name}
                    className="w-full h-full object-cover"
                />
                )}
            </div>
            {technicianNumber > 0 && (
                <div className="absolute top-1 left-[-2rem] drop-shadow-lg">
                    <span className="font-bold text-2xl text-white leading-none">#{technicianNumber}</span>
                </div>
            )}
            {badges && badges.length > 0 && (
                <div className="absolute top-4 right-[-4rem] flex flex-col gap-2">
                    {badges.map(badge => {
                      const badgeContent = badgeIcons[badge];
                      return typeof badgeContent === 'string' ? (
                          <span key={badge} className="text-2xl" title={badge}>
                              {badgeContent}
                          </span>
                      ) : (
                          <div key={badge} className="w-6 h-6 flex items-center justify-center" title={badge}>
                              {badgeContent}
                          </div>
                      );
                    })}
                </div>
            )}
        </div>
        <div className="text-center mt-4">
            <h2 className="text-4xl font-bold text-white tracking-tight">{name}</h2>
            <p className="text-lg font-medium text-yellow-400">{position}</p>
        </div>
      </main>

      <footer className="relative z-10 grid grid-cols-6 gap-3">
          {/* Top row */}
          <div className="col-span-2">
              <StatItem icon={<ChartBarIcon />} label="Perf. %" value={avgPerformance} />
          </div>
          <div className="col-span-2">
              <StatItem icon={<CurrencyDollarIcon />} label="Ticket" value={`$${ticketValue}`} />
          </div>
          <div className="col-span-2">
              <StatItem icon={<SparklesIcon />} label="Impact" value={impactPoints} />
          </div>
          {/* Bottom row */}
          <div className="col-start-1 col-span-3">
              <StatItem icon={<StarIcon />} label="5-Star Reviews" value={fiveStarReviews} />
          </div>
          <div className="col-start-4 col-span-3">
              <StatItem 
                icon={<MembershipIcon />} 
                label="Memberships" 
                value={membershipsSold} 
              />
          </div>
      </footer>
    </div>
  );
};
