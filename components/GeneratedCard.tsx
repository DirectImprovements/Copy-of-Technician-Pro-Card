import React, { useRef, useCallback } from 'react';
import { PlayerCard } from './PlayerCard';
import type { Technician } from '../types';

declare const htmlToImage: any;

interface GeneratedCardProps {
    technician: Technician;
    companyLogo?: string | null;
    companyName?: string;
}

export const GeneratedCard: React.FC<GeneratedCardProps> = ({ technician, companyLogo, companyName }) => {
    const cardRef = useRef<HTMLDivElement>(null);

    const handleDownloadCard = useCallback(() => {
        if (cardRef.current === null) {
            return;
        }
        htmlToImage.toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 })
            .then((dataUrl: string) => {
                const link = document.createElement('a');
                link.download = `pro-card-${technician.name.replace(/\s+/g, '-')}.png`;
                link.href = dataUrl;
                link.click();
            })
            .catch((err: any) => {
                console.error('Failed to generate card image', err);
            });
    }, [technician.name]);

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="w-full max-w-sm">
                <PlayerCard
                    ref={cardRef}
                    technician={technician}
                    quarter={technician.quarter}
                    year={technician.year}
                    companyLogo={companyLogo}
                    companyName={companyName}
                />
            </div>
            <button
                onClick={handleDownloadCard}
                className="w-full max-w-xs bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-300"
            >
                Download Card
            </button>
        </div>
    );
};
