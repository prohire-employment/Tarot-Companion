import React, { useState } from 'react';

interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
}

const TagInput: React.FC<TagInputProps> = ({ tags, setTags }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = inputValue.trim().replace(/,/g, '');
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && inputValue === '' && tags.length > 0) {
      e.preventDefault();
      setTags(tags.slice(0, -1));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="font-sans">
      <label htmlFor="tags-input" className="font-bold text-accent text-lg block mb-2 font-serif">
        Tags
      </label>
      <div className="flex flex-wrap gap-2 items-center w-full bg-bg/50 border border-border rounded-ui p-2 focus-within:ring-2 focus-within:ring-accent">
        {tags.map(tag => (
          <span key={tag} className="flex items-center gap-1 bg-accent/20 text-accent text-sm font-medium px-2 py-1 rounded">
            {tag}
            <button onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`} className="text-accent hover:text-text focus:outline-none focus:bg-accent/40 rounded-full w-4 h-4 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        ))}
        <input
          id="tags-input"
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? "Add tags (e.g., love, career)..." : "Add more..."}
          className="flex-grow bg-transparent outline-none text-text placeholder-sub/70 p-1"
        />
      </div>
    </div>
  );
};

export default TagInput;