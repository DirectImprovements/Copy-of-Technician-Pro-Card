import React, { useState, useCallback, useRef, useEffect } from 'react';
import { PlayerCard } from './components/PlayerCard';
import { StatsInput } from './components/StatsInput';
import { DropdownInput } from './components/DropdownInput';
import { TechnicianModal } from './components/TechnicianModal';
import { Leaderboard } from './components/Leaderboard';
import { TrashIcon } from './components/icons/TrashIcon';
import { PencilIcon } from './components/icons/PencilIcon';
import { GeneratedCard } from './components/GeneratedCard';
import type { Technician, TechnicianStats, TemplateTechnician } from './types';

const INITIAL_TECHNICIAN_PHOTO = 'https://storage.googleapis.com/generative-ai-pro-isv-creativetool/83134ca4-6654-4649-bff3-a00d81b21235.png';
const DEFAULT_COMPANY_LOGO = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAgVBMVEUiAAD////pSzrpRzjpRjhkAABmAABkAABlAABnAAF3BweKAACMAADpSTDtUC/sUy/tVC/rUjBkAABjAAAHAADpSDTtUSB1AgLaAADpSDHqSjLqRzXoRjHpRzTqSTTqSDRpAADpPyDoQjLpQTTpQDTpOzLpOzTpOC3pNi3pNC3pMCzpLCz5pqz7uLr9z9P+7vBh8hTDAAAEXElEQVR4nO2da3uqOBSGM8EYb0VAxQvUaq219v//7W5rQERBEChycp/2WWvPY0IScs9kEtJkBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPyT/v56E5f5/X6/f7u6/b73+22z/d3vK7f9t91v/z5f3x/5+m0/b7l/37e3V+/vV+8/b7v/fm+3/n7fX/39vuvtS4VpLP+7X/9e9v/6e/S/5e/b7z+vXzYudn3FmM1fE+3+fN9923//vuv2l0p/pPx/e3nL/P35+qU+T/i+2s9S/p/y/fr7D9nf3t+vp3w/5+uK769L5R+2l/L+9d9LpZ8T/p/uV+9fi+5b5W+d/l86/VP5/pW+l/B/nf7e+f9V/n6/fv0+4vt1/n34fMv8b8q/p/w/5f+T769/L/v7/9ufT/k+5ftr/y9+v/L9tZ9v+S6V/6f8H+XrS+f/S+ffK3+f8v2d7+9/L3+/cn25b9//8y3/t+e7z/fn+/fXf+/fP9+v/+8/7+8f/35/v//9+f79eS/y/S/kv9H5f9M+b/U/s/0/1N+X/L/W36f8f1r+X3L/9e+Xz7/W/r/U/6f8n+V71/+f+X76y/b3//sv3/Zb7/9f2v7/df2/z//v35/v2T7+9S/n+l/B/l+yv/p3z/kv9T/r/i+yvfX/n+yvdX/n/l/2t+f/v/S/5/xfcr36/6f6T8v/L/qu9X/n+l+yv/t/L/S/e/kv/3+f8l+0sAAAAAZBv/71fR91fRnyv7XxX/p/h+VfS/Kvpf5f9S2Z8q+1+V/Sv/z/D9lf9TfP8q+1/R/Sv935T9q/jfRf8vS//7ov9d9P9D//tD/zsy/B8Z+V8V/C8K/ncF/zsD/wsj/y0j/60B/wsT/80J/M8K/vMh/I8g/Ccg/BMS/kkB/vMj/IcB+M+H8D8OwX8Ygv84BP9xCP4zIfiPhfAvCuF/GIH/OAT/Qwj+gyH4TwfgPx6A/3gA/sMA/IcB+A8D8B8G4D8MgP8wAP/BAPyHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD+P4j77e233G+/32f+92+f75fuH3d66/v71V8oPz/a7f8t8/f17/d/pT7L+L4k/G/9vuv6fN/fbfv13w9X+m0vla+c/0/T/6Xy/f7u+/X7z6/bb7+/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD+h1k0/E8I/mcE/zMC/4kB/8QAf+IAf/EA//EAP/CAf/AAPvDAfvCAfvAAPvAAPvAAPvAAPvCAPvCAPnAAPvBAPnAAPnDAn3DAn3DAnzDAnzDAnzDAnzDAnzDAny3AnzLAnyjAnyjAnzDAnzC/nyzAnzLAnzC/nzS/nzS/nzTAnzbAnzbAnzS/nzTAnzbAnza/nxTAnzbAnxTAnxbAnxbAnxTAnxbAnxS/nyS/nyS/nwRkBAAAAABAQAAAAAAAAAAAAKz4B1QkL2DIfv0aAAAAAElFTkSuQmCC';
const DEFAULT_COMPANY_NAME = 'Direct Improvements';

const positionOptions = ['Apprentice', 'Tier 1 Lead', 'Tier 2 Lead', 'Tier 3 Lead', 'Tier 4 Senior Lead', 'Tier 5 Veteran Lead'];
const quarterOptions = ['Q1', 'Q2', 'Q3', 'Q4'];
const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 2050 - currentYear + 1 }, (_, i) => currentYear + i);

const clearedStats: TechnicianStats = {
  name: '',
  position: 'Apprentice',
  technicianNumber: 0,
  avgPerformance: 0,
  ticketValue: 0,
  impactPoints: 0,
  fiveStarReviews: 0,
  membershipsSold: 0,
  badges: [],
};

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const recalculateBadges = (technicians: Technician[]): Technician[] => {
  if (technicians.length === 0) {
    return [];
  }

  // Find max values across the board. Use 0 as a default if the list is empty or all values are negative.
  const maxPerformance = Math.max(0, ...technicians.map(t => t.avgPerformance));
  const maxImpact = Math.max(0, ...technicians.map(t => t.impactPoints));
  const maxReviews = Math.max(0, ...technicians.map(t => t.fiveStarReviews));
  const maxMemberships = Math.max(0, ...technicians.map(t => t.membershipsSold));

  // Recalculate badges for each technician
  return technicians.map(tech => {
    const newBadges: string[] = [];

    // Check if the technician's score is the max and is not zero
    const isTopPerformance = tech.avgPerformance === maxPerformance && maxPerformance > 0;
    const isTopImpact = tech.impactPoints === maxImpact && maxImpact > 0;
    const isTopReviews = tech.fiveStarReviews === maxReviews && maxReviews > 0;
    const isTopMemberships = tech.membershipsSold === maxMemberships && maxMemberships > 0;

    if (isTopPerformance && isTopImpact) {
      newBadges.push('MVP');
    }
    if (isTopPerformance) {
      newBadges.push('Ironman');
    }
    if (isTopImpact) {
      newBadges.push('Playmaker');
    }
    if (isTopReviews) {
      newBadges.push('Fan Favorite');
    }
    if (isTopMemberships) {
      newBadges.push('Club Captain');
    }

    return { ...tech, badges: newBadges };
  });
};


const App: React.FC = () => {
  const [stats, setStats] = useState<TechnicianStats>(clearedStats);
  const [photoUrl, setPhotoUrl] = useState<string>(INITIAL_TECHNICIAN_PHOTO);
  const [quarter, setQuarter] = useState<string>('Q3');
  const [year, setYear] = useState<string>('2024');
  const [error, setError] = useState<string | null>(null);

  const [companyLogo, setCompanyLogo] = useState<string | null>(DEFAULT_COMPANY_LOGO);
  const [companyName, setCompanyName] = useState<string>(DEFAULT_COMPANY_NAME);

  const [templateTechnicians, setTemplateTechnicians] = useState<TemplateTechnician[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTechnician, setEditingTechnician] = useState<TemplateTechnician | null>(null);

  const [generatedTechnicians, setGeneratedTechnicians] = useState<Technician[]>([]);
  const [leaderboardPeriod, setLeaderboardPeriod] = useState<'Weekly' | 'Monthly' | 'Quarterly'>('Weekly');


  const logoInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateScale = () => {
        const { clientWidth, clientHeight } = document.documentElement;
        
        const contentWidth = container.offsetWidth;
        const contentHeight = container.offsetHeight;

        if (contentWidth === 0 || contentHeight === 0) return;

        const scale = Math.min(clientWidth / contentWidth, clientHeight / contentHeight);

        container.style.transform = `scale(${scale})`;
    };
    
    const resizeObserver = new ResizeObserver(() => {
        window.requestAnimationFrame(updateScale);
    });
    resizeObserver.observe(container);

    window.addEventListener('resize', updateScale);
    
    const timeoutId = setTimeout(updateScale, 100);

    return () => {
        clearTimeout(timeoutId);
        resizeObserver.disconnect();
        window.removeEventListener('resize', updateScale);
    };
  }, []);

  // Effect for loading from localStorage on initial mount
  useEffect(() => {
    try {
      const storedTechnicians = localStorage.getItem('technicianTemplates');
      if (storedTechnicians) {
        const parsedTechnicians = JSON.parse(storedTechnicians).map((tech: any) => ({
          ...tech,
          technicianNumber: tech.technicianNumber || 0,
          position: tech.position || 'Apprentice', // Backward compatibility
        }));
        setTemplateTechnicians(parsedTechnicians);
      }
    } catch (error) {
      console.error("Failed to load technician templates from localStorage", error);
    }
  }, []);

  // Effect for saving to localStorage whenever the templates change
  useEffect(() => {
    try {
      localStorage.setItem('technicianTemplates', JSON.stringify(templateTechnicians));
    } catch (error) {
      console.error("Failed to save technician templates to localStorage", error);
    }
  }, [templateTechnicians]);

  const resetFormAndCard = () => {
    setSelectedTemplateId('');
    setStats({...clearedStats});
    setPhotoUrl(INITIAL_TECHNICIAN_PHOTO);
  };

  const handleStatChange = (field: keyof TechnicianStats, value: string) => {
    let finalValue: string | number = value;

    if (field === 'avgPerformance') {
        const num = Number(value);
        if (num > 100) finalValue = 100;
        else if (num < 0) finalValue = 0;
        else finalValue = num;
    } else {
        const numericFields: (keyof TechnicianStats)[] = ['ticketValue', 'impactPoints', 'fiveStarReviews', 'membershipsSold', 'technicianNumber'];
        if (numericFields.includes(field)) {
            finalValue = Number(value);
        }
    }
    
    setStats(prev => ({
      ...prev,
      [field]: finalValue,
    }));
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const base64 = await fileToBase64(file);
      setCompanyLogo(base64);
    }
  };

  const handleClear = () => {
    resetFormAndCard();
    setQuarter('Q1');
    setYear(new Date().getFullYear().toString());
    setCompanyLogo(DEFAULT_COMPANY_LOGO);
    setCompanyName(DEFAULT_COMPANY_NAME);
    if (logoInputRef.current) logoInputRef.current.value = '';
    setError(null);
  };

  const handleTemplateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    if (value === 'add') {
      handleOpenAddModal();
    } else {
      setSelectedTemplateId(value);
      if (value === '') {
        resetFormAndCard();
      } else {
        const selectedTech = templateTechnicians.find(t => t.id === value);
        if (selectedTech) {
          setStats(prev => ({ ...prev, name: selectedTech.name, technicianNumber: selectedTech.technicianNumber, position: selectedTech.position, badges: [] })); // Clear badges when switching
          setPhotoUrl(selectedTech.photoUrl);
        }
      }
    }
  };
  
  const handleSaveTechnician = (techData: Omit<TemplateTechnician, 'id'> & { id?: string }) => {
    let updatedTechnicians;
    let newSelectedId: string;

    if (techData.id) { // Editing existing
      updatedTechnicians = templateTechnicians.map(t =>
        t.id === techData.id ? { ...t, ...techData } as TemplateTechnician : t
      );
      newSelectedId = techData.id;
    } else { // Adding new
      const newTechnician: TemplateTechnician = {
        name: techData.name,
        photoUrl: techData.photoUrl,
        technicianNumber: techData.technicianNumber,
        position: techData.position,
        id: Date.now().toString(),
      };
      updatedTechnicians = [...templateTechnicians, newTechnician];
      newSelectedId = newTechnician.id;
    }

    setTemplateTechnicians(updatedTechnicians);
    
    const currentTech = updatedTechnicians.find(t => t.id === newSelectedId);
    if (currentTech) {
      setSelectedTemplateId(currentTech.id);
      setStats(prev => ({ 
          ...prev, 
          name: currentTech.name, 
          technicianNumber: currentTech.technicianNumber,
          position: currentTech.position,
      }));
      setPhotoUrl(currentTech.photoUrl);
    }

    setIsModalOpen(false);
    setEditingTechnician(null);
  };
  
  const handleDeleteTechnician = () => {
    if (!selectedTemplateId) return;

    const techToDelete = templateTechnicians.find(t => t.id === selectedTemplateId);
    if (!techToDelete) return;

    const isConfirmed = window.confirm(`Are you sure you want to delete the template for "${techToDelete.name}"?`);
    if (isConfirmed) {
        setTemplateTechnicians(prev => prev.filter(t => t.id !== selectedTemplateId));
        // Directly reset the form and card state here to ensure reliability.
        setSelectedTemplateId('');
        setStats({...clearedStats});
        setPhotoUrl(INITIAL_TECHNICIAN_PHOTO);
    }
  };

  const handleOpenAddModal = () => {
    setEditingTechnician(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = () => {
    const technicianToEdit = templateTechnicians.find(t => t.id === selectedTemplateId);
    if (technicianToEdit) {
      setEditingTechnician(technicianToEdit);
      setIsModalOpen(true);
    }
  };

  const handleAddTechnicianToLeaderboard = () => {
    if (!stats.name) {
        setError("Technician name is required to add to leaderboard.");
        return;
    }
    const newTechnician: Technician = {
      ...stats,
      photoUrl,
      quarter,
      year,
      id: `${stats.name}-${Date.now()}` // Simple unique ID
    };

    setGeneratedTechnicians(prev => {
        const updatedList = [...prev, newTechnician];
        return recalculateBadges(updatedList);
    });
  };
  
  const handleRemoveTechnicianFromLeaderboard = (technicianId: string) => {
     setGeneratedTechnicians(prev => {
        const updatedList = prev.filter(tech => tech.id !== technicianId);
        return recalculateBadges(updatedList);
    });
  };

  const technicianData: Technician = { ...stats, photoUrl, id: '', quarter, year };

  return (
    <div className="app-container" ref={containerRef}>
      <div className="bg-white text-gray-900 font-sans p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
              Technician Pro Cards and Leaderboard
            </h1>
            <p className="text-lg text-gray-600 mt-2 max-w-2xl mx-auto">
              See who’s leading the pack—recognize standouts and reward results so the whole team raises the bar.
            </p>
          </header>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/3 bg-gray-50 p-6 rounded-2xl shadow-lg border border-gray-200">
              <h2 className="text-2xl font-semibold mb-6 text-gray-800">Generate Pro Card</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Company Logo</label>
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-500 file:text-white hover:file:bg-teal-600 transition-colors cursor-pointer"
                  />
                </div>
                <StatsInput
                  label="Company Name"
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                />

                <div className="border-t border-gray-200 my-4"></div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Technician</label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-grow">
                      <select
                        value={selectedTemplateId}
                        onChange={handleTemplateChange}
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors appearance-none cursor-pointer pr-8"
                        aria-label="Select Technician Template"
                      >
                        <option value="">-- New Card --</option>
                        {templateTechnicians.map(tech => (
                          <option key={tech.id} value={tech.id}>{tech.name}</option>
                        ))}
                        <option value="add" className="font-bold text-blue-400">＋ Add New Technician...</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                    {selectedTemplateId && (
                       <div className="flex items-center gap-2">
                        <button 
                          onClick={handleOpenEditModal}
                          className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-lg transition-colors"
                          aria-label="Edit Technician"
                        >
                          <PencilIcon className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={handleDeleteTechnician}
                          className="p-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors"
                          aria-label="Delete Technician"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              
                <div className="grid grid-cols-2 gap-4">
                  <DropdownInput
                      label="Quarter"
                      value={quarter}
                      onChange={e => setQuarter(e.target.value)}
                      options={quarterOptions}
                  />
                  <DropdownInput
                      label="Year"
                      value={year}
                      onChange={e => setYear(e.target.value)}
                      options={yearOptions}
                  />
                </div>
                <StatsInput
                  label="Avg. Performance %"
                  type="number"
                  value={stats.avgPerformance.toString()}
                  onChange={e => handleStatChange('avgPerformance', e.target.value)}
                  max={100}
                />
                <StatsInput
                  label="Avg. Job Ticket Value ($)"
                  type="number"
                  value={stats.ticketValue.toString()}
                  onChange={e => handleStatChange('ticketValue', e.target.value)}
                />
                <StatsInput
                  label="Avg. Impact Points"
                  type="number"
                  value={stats.impactPoints.toString()}
                  onChange={e => handleStatChange('impactPoints', e.target.value)}
                />
                <StatsInput
                  label="5-Star Reviews"
                  type="number"
                  value={stats.fiveStarReviews.toString()}
                  onChange={e => handleStatChange('fiveStarReviews', e.target.value)}
                />
                <StatsInput
                  label="Memberships Sold"
                  type="number"
                  value={stats.membershipsSold.toString()}
                  onChange={e => handleStatChange('membershipsSold', e.target.value)}
                />

                <div className="flex flex-col gap-3 pt-4">
                   <button
                        onClick={handleAddTechnicianToLeaderboard}
                        className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-300"
                    >
                        Add to Leaderboard
                    </button>
                  <div className="flex flex-col sm:flex-row gap-3">
                      <button
                      onClick={handleClear}
                      className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg shadow-md transition-colors"
                      >
                      Reset
                      </button>
                  </div>
                </div>
                {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
              </div>
            </div>

            <div className="lg:w-2/3 flex items-center justify-center p-4">
              <div className="w-full max-w-sm">
                  <PlayerCard 
                    technician={technicianData} 
                    quarter={quarter} 
                    year={year}
                    companyLogo={companyLogo}
                    companyName={companyName}
                  />
              </div>
            </div>
          </div>
           {generatedTechnicians.length > 0 && (
            <>
              <div className="mt-12">
                <Leaderboard 
                  technicians={generatedTechnicians}
                  onRemove={handleRemoveTechnicianFromLeaderboard}
                  companyLogo={companyLogo}
                  companyName={companyName}
                  quarter={quarter}
                  year={year}
                  leaderboardPeriod={leaderboardPeriod}
                  onPeriodChange={setLeaderboardPeriod}
                />
              </div>
              <div className="mt-12">
                <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Generated Pro Cards</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {generatedTechnicians.map((tech) => (
                    <GeneratedCard
                      key={tech.id}
                      technician={tech}
                      companyLogo={companyLogo}
                      companyName={companyName}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <TechnicianModal 
        isOpen={isModalOpen}
        onClose={() => {
            setIsModalOpen(false);
            setEditingTechnician(null);
            // This logic ensures the dropdown doesn't get stuck on "Add New..."
            if (!templateTechnicians.find(t => t.id === selectedTemplateId)) {
                setSelectedTemplateId('');
            }
        }}
        onSave={handleSaveTechnician}
        technicianToEdit={editingTechnician}
        positionOptions={positionOptions}
      />
    </div>
  );
};

export default App;
