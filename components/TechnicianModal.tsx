
import React, { useState, useRef, useEffect } from 'react';
import type { TemplateTechnician } from '../types';

interface TechnicianModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (technician: Omit<TemplateTechnician, 'id'> & { id?: string }) => void;
  technicianToEdit: TemplateTechnician | null;
  positionOptions: string[];
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
};

export const TechnicianModal: React.FC<TechnicianModalProps> = ({ isOpen, onClose, onSave, technicianToEdit, positionOptions }) => {
  const [name, setName] = useState('');
  const [technicianNumber, setTechnicianNumber] = useState('');
  const [position, setPosition] = useState(positionOptions[0] || '');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (technicianToEdit) {
        setName(technicianToEdit.name);
        setTechnicianNumber(String(technicianToEdit.technicianNumber));
        setPosition(technicianToEdit.position);
        setPhotoPreview(technicianToEdit.photoUrl);
        setPhotoFile(null); // Clear file input as we are using a URL
      } else {
        // Reset for "Add New"
        setName('');
        setTechnicianNumber('');
        setPosition(positionOptions[0] || '');
        setPhotoFile(null);
        setPhotoPreview(null);
      }
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [isOpen, technicianToEdit, positionOptions]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      // Only revoke if the preview is a temporary blob URL, not a base64 string
      if (photoPreview && photoPreview.startsWith('blob:')) {
        URL.revokeObjectURL(photoPreview);
      }
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Technician name is required.');
      return;
    }
    const num = parseInt(technicianNumber, 10);
    if (isNaN(num) || num <= 0) {
        setError('Please enter a valid technician number.');
        return;
    }
    
    let finalPhotoUrl = technicianToEdit?.photoUrl;
    if (photoFile) {
        try {
            finalPhotoUrl = await fileToBase64(photoFile);
        } catch (e) {
            setError('Could not process the image file. Please try another one.');
            return;
        }
    }

    if (!finalPhotoUrl) {
        setError('Technician photo is required.');
        return;
    }

    onSave({
        id: technicianToEdit?.id,
        name,
        photoUrl: finalPhotoUrl,
        technicianNumber: num,
        position,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50" aria-modal="true" role="dialog">
      <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-md m-4 animate-fade-in-up border border-gray-200">
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">{technicianToEdit ? 'Edit Technician' : 'Add New Technician'}</h2>
        <div className="space-y-4">
            <div>
                <label htmlFor="tech-name" className="block text-sm font-medium text-gray-600 mb-1">Technician Name</label>
                <input
                id="tech-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                placeholder="e.g., Jane Smith"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                  <label htmlFor="tech-number" className="block text-sm font-medium text-gray-600 mb-1">Tech #</label>
                  <input
                  id="tech-number"
                  type="number"
                  value={technicianNumber}
                  onChange={(e) => setTechnicianNumber(e.target.value)}
                  className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors"
                  placeholder="e.g., 42"
                  />
              </div>
              <div>
                  <label htmlFor="tech-position" className="block text-sm font-medium text-gray-600 mb-1">Position</label>
                   <div className="relative">
                      <select
                          id="tech-position"
                          value={position}
                          onChange={(e) => setPosition(e.target.value)}
                          className="w-full bg-gray-100 border border-gray-300 rounded-lg px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors appearance-none cursor-pointer pr-8"
                      >
                          {positionOptions.map(option => (
                              <option key={option} value={option}>{option}</option>
                          ))}
                      </select>
                       <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                  </div>
              </div>
            </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">Technician Photo</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600 transition-colors cursor-pointer"
            />
          </div>
          {photoPreview && (
            <div className="flex justify-center">
              <img src={photoPreview} alt="Preview" className="mt-2 rounded-lg w-32 h-32 object-cover border-2 border-slate-600" />
            </div>
          )}
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        <div className="flex justify-end gap-4 mt-8">
          <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg shadow-md transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="bg-gradient-to-r from-blue-500 to-teal-400 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all duration-300 hover:from-blue-600 hover:to-teal-500">
            Save Technician
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};