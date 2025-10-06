
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { PlayerCard } from './components/PlayerCard';
import { StatsInput } from './components/StatsInput';
import { DropdownInput } from './components/DropdownInput';
import { TechnicianModal } from './components/TechnicianModal';
import { TrashIcon } from './components/icons/TrashIcon';
import { PencilIcon } from './components/icons/PencilIcon';
import { generateTechnicianData } from './services/geminiService';
import type { Technician, TechnicianStats, TemplateTechnician } from './types';

const INITIAL_TECHNICIAN_PHOTO = 'https://storage.googleapis.com/generative-ai-pro-isv-creativetool/83134ca4-6654-4649-bff3-a00d81b21235.png';
const DEFAULT_COMPANY_LOGO = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMjAiIGZpbGw9IiNGQUNDMTUiLz4KPHRleHQgeD0iNTAlIiB5PSI1MiUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaGyPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zערpZiIgZm9udC1zaXplPSIyNCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IiMwRjE3MkEiPkQ8L3RleHQ+Cjwvc3ZnPgo=';
const DEFAULT_COMPANY_NAME = 'Direct Improvements';

const positionOptions = ['Apprentice', 'Tier 1 Lead', 'Tier 2 Lead', 'Tier 3 Lead', 'Tier 4 Senior Lead', 'Tier 5 Veteran Lead'];
const quarterOptions = ['Q1', 'Q2', 'Q3', 'Q4'];
const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 2050 - currentYear + 1 }, (_, i) => currentYear + i);
const badgeOptions = ['MVP', 'Ironman', 'Playmaker', 'Fan Favorite', 'Club Captain'];

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


const App: React.FC = () => {
  const [stats, setStats] = useState<TechnicianStats>(clearedStats);
  const [photoUrl, setPhotoUrl] = useState<string>(INITIAL_TECHNICIAN_PHOTO);
  const [quarter, setQuarter] = useState<string>('Q3');
  const [year, setYear] = useState<string>('2024');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [companyLogo, setCompanyLogo] = useState<string | null>(DEFAULT_COMPANY_LOGO);
  const [companyName, setCompanyName] = useState<string>(DEFAULT_COMPANY_NAME);

  const [templateTechnicians, setTemplateTechnicians] = useState<TemplateTechnician[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTechnician, setEditingTechnician] = useState<TemplateTechnician | null>(null);


  const logoInputRef = useRef<HTMLInputElement>(null);

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

  const resetFormAndCard = useCallback(() => {
    setSelectedTemplateId('');
    setStats({...clearedStats});
    setPhotoUrl(INITIAL_TECHNICIAN_PHOTO);
  }, []);

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

  const handleBadgeChange = (badge: string) => {
    setStats(prev => {
      const newBadges = prev.badges?.includes(badge)
        ? prev.badges.filter(b => b !== badge)
        : [...(prev.badges || []), badge];
      return { ...prev, badges: newBadges };
    });
  };

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const base64 = await fileToBase64(file);
      setCompanyLogo(base64);
    }
  };
  
  const handleGenerateData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const generatedData = await generateTechnicianData();
      if (generatedData) {
        setStats(generatedData);
        setSelectedTemplateId('');
        setPhotoUrl(INITIAL_TECHNICIAN_PHOTO);
      }
    } catch (err) {
      setError('Failed to generate data. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleClear = useCallback(() => {
    resetFormAndCard();
    setQuarter('Q1');
    setYear(new Date().getFullYear().toString());
    setCompanyLogo(DEFAULT_COMPANY_LOGO);
    setCompanyName(DEFAULT_COMPANY_NAME);
    if (logoInputRef.current) logoInputRef.current.value = '';
    setError(null);
  }, [resetFormAndCard]);

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
          setStats(prev => ({ ...prev, name: selectedTech.name, technicianNumber: selectedTech.technicianNumber, position: selectedTech.position, badges: prev.badges })); // Keep badges, but update other info
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
        // Directly reset the form and card state after deletion.
        resetFormAndCard();
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

  const technicianData: Technician = { ...stats, photoUrl };

  return (
    <>
      <div className="min-h-screen bg-white text-gray-900 font-sans p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto">
          <header className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
              Technician Pro Cards
            </h1>
            <p className="text-lg text-gray-600 mt-2 max-w-2xl mx-auto">
              Celebrate excellence by creating sports-style performance cards for your team members.
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

                <div className="border-t border-gray-200 my-4"></div>

                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Badges</label>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                        {badgeOptions.map(badge => (
                            <label key={badge} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={stats.badges?.includes(badge) || false}
                                    onChange={() => handleBadgeChange(badge)}
                                    className="h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                                />
                                <span className="text-sm text-gray-700">{badge}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <div className="flex flex-col sm:flex-row gap-3">
                      <button
                      onClick={handleGenerateData}
                      disabled={isLoading}
                      className="w-full flex items-center justify-center bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                      {isLoading ? (
                          <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating...
                          </>
                      ) : (
                          'Generate Random Data'
                      )}
                      </button>
                      <button
                      onClick={handleClear}
                      className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg shadow-md transition-colors"
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
    </>
  );
};

export default App;
