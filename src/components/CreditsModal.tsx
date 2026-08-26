import React from 'react';
import { X, Heart, Shield, BookOpen, ExternalLink, Award, Sparkles } from 'lucide-react';

interface CreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreditsModal: React.FC<CreditsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="credits-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="credits-modal-container"
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 text-slate-200 relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-inner">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">About & Project Attribution</h2>
              <p className="text-xs text-slate-400">Anatomy 3D — Human Muscle Atlas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          {/* Educational Purpose */}
          <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 space-y-1.5">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-rose-400" />
              <span>Educational & Artistic Mission</span>
            </h3>
            <p className="text-slate-300 leading-relaxed">
              Anatomy 3D — Human Muscle Atlas is an interactive, client-side educational platform built for medical students, anatomical researchers, physical therapists, artists, and educators to study the human muscular system with spatial precision in interactive 3D.
            </p>
          </div>

          {/* Z-Anatomy & BodyParts3D Attribution */}
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-800/40 space-y-2.5">
            <h3 className="font-bold text-sm text-rose-300 flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-400" />
              <span>3D Anatomical Assets & Licensing</span>
            </h3>
            <p className="text-rose-100/90 leading-relaxed">
              The 3D muscular system models loaded by this application are derived from the open-source anatomical datasets provided by:
            </p>
            <ul className="space-y-1.5 pl-3 list-disc text-rose-200">
              <li>
                <strong>Z-Anatomy Project</strong> (<a href="https://www.z-anatomy.com" target="_blank" rel="noreferrer" className="underline hover:text-rose-300">z-anatomy.com</a>) — An open-source 3D human atlas.
              </li>
              <li>
                <strong>BodyParts3D / The Database Center for Life Science (DBCLS)</strong> — High-definition anatomically verified polygon models.
              </li>
            </ul>
            <div className="text-[11px] text-rose-200/90 bg-rose-950/40 p-3 rounded-xl border border-rose-900/50 space-y-1">
              <p>
                <strong>License:</strong> Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0).
              </p>
              <p className="text-slate-400">
                This application does not claim original authorship of the anatomical 3D geometry and preserves all mesh hierarchy, metadata, and <em>Terminologia Anatomica</em> nomenclature.
              </p>
            </div>
          </div>

          {/* Medical Disclaimer */}
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 space-y-1.5 text-amber-200/90">
            <h3 className="font-bold text-sm text-amber-300 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <span>Medical & Academic Disclaimer</span>
            </h3>
            <p className="text-[11px] text-amber-200/80 leading-relaxed">
              This software is designed exclusively for educational, artistic study, and academic reference. It is not intended for diagnostic or clinical treatment planning. Consult board-certified medical professionals and authoritative medical literature for clinical advice.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
