import React from 'react';
import { WarningIcon } from './icons/WarningIcon';

interface AgeConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const AgeConfirmationModal: React.FC<AgeConfirmationModalProps> = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-dynamic-fade-in"
      onClick={onCancel}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-gray-800 border border-red-500/50 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-2xl shadow-red-900/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center">
          <div className="p-3 bg-red-500/20 rounded-full border-2 border-red-500/40 mb-4">
            <WarningIcon className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-red-300">Warning: 18+ Content</h2>
          <p className="mt-2 text-gray-300">
            The following content is intended for mature audiences only. It contains extremely vulgar, graphic, and offensive language that may be shocking. 
            <br/><br/>
            <strong>Viewer discretion is strongly advised.</strong>
          </p>
          <p className="mt-4 font-semibold text-gray-200">
            Please confirm you are 18 years of age or older to proceed.
          </p>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button
            onClick={onCancel}
            className="w-full px-5 py-3 font-semibold text-white bg-gray-600 rounded-xl hover:bg-gray-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="w-full px-5 py-3 font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500"
          >
            I am 18 or older
          </button>
        </div>
      </div>
    </div>
  );
};
