
import React, { useRef, useCallback } from 'react';
import type { Technician } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { MembershipIcon } from './icons/MembershipIcon';

declare const htmlToImage: any;

interface LeaderboardProps {
  technicians: Technician[];
  onRemove: (technicianId: string) => void;
  companyLogo?: string | null;
  companyName?: string;
  quarter: string;
  year: string;
  leaderboardPeriod: 'Weekly' | 'Monthly' | 'Quarterly';
  onPeriodChange: (period: 'Weekly' | 'Monthly' | 'Quarterly') => void;
}

const badgeIcons: { [key: string]: React.ReactNode } = {
  'MVP': '🏆',
  'Ironman': '💪',
  'Playmaker': '✨',
  'Fan Favorite': '⭐',
  'Club Captain': <MembershipIcon className="w-5 h-5 text-[#EBCF10]" />,
};

export const Leaderboard: React.FC<LeaderboardProps> = ({ technicians, onRemove, companyLogo, companyName, quarter, year, leaderboardPeriod, onPeriodChange }) => {
  const sortedTechnicians = [...technicians].sort((a, b) => b.avgPerformance - a.avgPerformance);
  const leaderboardRef = useRef<HTMLDivElement>(null);

  const handleDownloadLeaderboard = useCallback(() => {
    if (leaderboardRef.current === null) {
      return;
    }
    htmlToImage.toPng(leaderboardRef.current, { cacheBust: true, pixelRatio: 2 })
      .then((dataUrl: string) => {
        const link = document.createElement('a');
        link.download = `${leaderboardPeriod}-leaderboard-${quarter}-${year}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err: any) => {
        console.error('Failed to generate leaderboard image', err);
        // Optionally, show an error to the user
      });
  }, [leaderboardPeriod, quarter, year]);

  const lastUpdatedTimestamp = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return (
    <div ref={leaderboardRef} className="rounded-2xl shadow-2xl overflow-hidden bg-[#121A27]">
      <div className="relative z-10 p-4 sm:p-6">
        <div className="flex justify-between items-center mb-6 h-20">
            <div className="flex-1 flex items-center gap-4">
                {companyLogo && (
                    <img src={companyLogo} alt="Company Logo" className="w-20 h-20 object-contain" />
                )}
                {companyName && (
                    <span className="text-2xl font-bold text-[#EAF0F6]">{companyName}</span>
                )}
            </div>
            <div className="flex-1 text-center">
                <h2 className="text-3xl font-bold text-[#EAF0F6] tracking-tight">{leaderboardPeriod} Leaderboard</h2>
            </div>
            <div className="flex-1 text-right">
                 <div className="text-right">
                    <p className="text-lg font-bold text-[#C7D0DC] uppercase tracking-wider">{quarter} {year}</p>
                    <p className="text-xs text-[#C7D0DC] opacity-70 mt-1">Updated {lastUpdatedTimestamp}</p>
                </div>
            </div>
        </div>
        
        <div className="overflow-x-auto rounded-lg border border-[#2A394D]">
          <table className="min-w-full text-sm text-left table-fixed">
            <thead className="text-xs font-semibold uppercase tracking-wider bg-[#1E2B3A] text-[#C7D0DC] opacity-80">
              <tr>
                <th className="p-3 sm:p-4 w-16">Rank</th>
                <th className="p-3 sm:p-4 w-48">Technician</th>
                <th className="p-3 sm:p-4 text-center">Avg. Performance %</th>
                <th className="p-3 sm:p-4 text-center">Avg. Job Ticket Value ($)</th>
                <th className="p-3 sm:p-4 text-center">Avg. Impact Points</th>
                <th className="p-3 sm:p-4 text-center">5-Star Reviews</th>
                <th className="p-3 sm:p-4 text-center">Memberships Sold</th>
                <th className="p-3 sm:p-4 text-center">Badges</th>
                <th className="p-3 sm:p-4 w-20 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A394D]">
              {sortedTechnicians.map((tech, index) => {
                const isTopPlayer = index === 0;
                const rowBgClass = index % 2 === 0 ? 'bg-[#131F2D]' : 'bg-[#0F1826]';
                const topPlayerClass = isTopPlayer ? 'border-l-4 border-[#EBCF10]' : '';
                return (
                  <tr 
                    key={tech.id}
                    className={`${rowBgClass} ${topPlayerClass}`}
                  >
                    <td className="p-3 sm:p-4 font-bold text-lg text-[#EAF0F6] whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span>{index + 1}</span>
                        {isTopPlayer && <span className="text-lg" role="img" aria-label="winner">👑</span>}
                      </div>
                    </td>
                    <td className="p-3 sm:p-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img src={tech.photoUrl} alt={tech.name} className="w-10 h-10 rounded-full object-cover border-2 border-gray-500"/>
                        <div>
                          <p className="font-bold text-[#EAF0F6]">{tech.name}</p>
                          <p className="text-xs text-[#C7D0DC] opacity-70">{tech.position}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 sm:p-4 text-center font-semibold text-teal-300">{tech.avgPerformance}%</td>
                    <td className="p-3 sm:p-4 text-center font-semibold text-[#EAF0F6]">${tech.ticketValue}</td>
                    <td className="p-3 sm:p-4 text-center font-semibold text-[#EAF0F6]">{tech.impactPoints}</td>
                    <td className="p-3 sm:p-4 text-center font-semibold text-[#EAF0F6]">{tech.fiveStarReviews}</td>
                    <td className="p-3 sm:p-4 text-center font-semibold text-[#EAF0F6]">{tech.membershipsSold}</td>
                    <td className="p-3 sm:p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {(tech.badges && tech.badges.length > 0) ? (
                          tech.badges.map(badge => {
                            const badgeContent = badgeIcons[badge];
                            return typeof badgeContent === 'string' ? (
                              <span key={badge} title={badge} className="text-lg">
                                {badgeContent}
                              </span>
                            ) : (
                              <div key={badge} className="inline-flex items-center justify-center w-5 h-5" title={badge}>
                                {badgeContent}
                              </div>
                            );
                          })
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 sm:p-4 text-center">
                        <button 
                            onClick={() => onRemove(tech.id)}
                            className="p-1.5 text-gray-400 hover:text-[#0083F9] hover:bg-gray-700 rounded-full transition-colors"
                            aria-label={`Remove ${tech.name}`}
                        >
                            <TrashIcon className="w-5 h-5" />
                        </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-6 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <label htmlFor="leaderboard-period" className="text-sm font-medium text-[#C7D0DC]">
                Period:
                </label>
                <select
                id="leaderboard-period"
                value={leaderboardPeriod}
                onChange={(e) => onPeriodChange(e.target.value as 'Weekly' | 'Monthly' | 'Quarterly')}
                className="bg-[#1E2B3A] border border-[#2A394D] text-[#EAF0F6] rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors cursor-pointer"
                >
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                </select>
            </div>
            <button
                onClick={handleDownloadLeaderboard}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-300"
            >
                Download Leaderboard
            </button>
        </div>
      </div>
    </div>
  );
};
