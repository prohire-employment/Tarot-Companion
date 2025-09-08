import React, { useState, useEffect, useRef } from 'react';
import type { JournalEntry } from '../../types';
import { useJournalStore } from '../../store/journalStore';
import { useUiStore } from '../../store/uiStore';
import TagInput from '../home/TagInput';
import { useModalFocus } from '../../hooks/useModalFocus';

interface EntryEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  entryToEdit: JournalEntry | null;
}

const EntryEditorModal: React.FC<EntryEditorModalProps> = ({ isOpen, onClose, entryToEdit }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { updateEntry } = useJournalStore();
  const { showToast } = useUiStore();

  const [question, setQuestion] = useState('');
  const [impression, setImpression] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  useModalFocus({ isOpen, onClose, modalRef });

  useEffect(() => {
    if (isOpen && entryToEdit) {
      setQuestion(entryToEdit.question || '');
      setImpression(entryToEdit.impression || '');
      setTags(entryToEdit.tags || []);
    }
  }, [isOpen, entryToEdit]);

  if (!isOpen || !entryToEdit) return null;

  const handleSave = () => {
    const updatedEntry: JournalEntry = {
      ...entryToEdit,
      question: question.trim() || undefined,
      impression: impression.trim(),
      tags: tags.length > 0 ? tags : undefined,
    };
    
    updateEntry(updatedEntry);
    showToast('Entry updated successfully.');
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 animate-fade-in"
      role="dialog" aria-modal="true" aria-labelledby="entry-editor-title"
      onClick={onClose}
    >
      <div
        ref={modalRef} onClick={e => e.stopPropagation()}
        className="bg-surface rounded-card shadow-main p-6 card-border max-w-2xl w-full flex flex-col font-serif"
        style={{ maxHeight: '90vh' }}
      >
        <div className="flex justify-between items-start mb-4 flex-shrink-0">
          <h2 id="entry-editor-title" className="text-2xl font-bold text-accent">
            Edit Journal Entry
          </h2>
          <button onClick={onClose} className="text-sub hover:text-text p-1 -mt-2 -mr-2" aria-label="Close">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="space-y-4 overflow-y-auto pr-2 flex-grow no-scrollbar font-sans">
          <div>
            <label htmlFor="edit-question" className="font-bold text-sub block mb-1">Question</label>
            <input 
              id="edit-question" 
              type="text" 
              value={question} 
              onChange={e => setQuestion(e.target.value)} 
              placeholder="What was your question or focus?"
              className="w-full bg-bg/50 border border-border rounded-ui p-2 text-text" 
            />
          </div>
          <div>
            <label htmlFor="edit-impression" className="font-bold text-sub block mb-1">Personal Impression</label>
            <textarea 
              id="edit-impression" 
              value={impression} 
              onChange={e => setImpression(e.target.value)} 
              rows={5} 
              placeholder="How did this reading feel to you?"
              className="w-full bg-bg/50 border border-border rounded-ui p-2 text-text" 
            />
          </div>
          <TagInput tags={tags} setTags={setTags} />
        </div>

        <div className="flex gap-4 justify-end pt-6 mt-4 border-t border-border font-sans flex-shrink-0">
          <button onClick={onClose} className="bg-border text-text font-bold py-2 px-4 rounded-ui">Cancel</button>
          <button onClick={handleSave} className="bg-accent text-accent-dark font-bold py-2 px-4 rounded-ui">Save Changes</button>
        </div>
      </div>
    </div>
  );
};

export default EntryEditorModal;