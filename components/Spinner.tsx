import React, { useState, useEffect } from 'react';

// Using a simple star icon to avoid circular dependencies and keep it self-contained.
const StarIcon: React.FC<{className?: string}> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.321h5.365c.427 0 .621.514.298.795l-4.333 3.156a.563.563 0 00-.182.523l1.62 5.163c.123.393-.328.72-.67.483l-4.43-3.23a.563.563 0 00-.65 0l-4.43 3.23c-.342.237-.793-.09-.67-.483l1.62-5.163a.563.563 0 00-.182-.523l-4.333-3.156c-.323-.281-.129-.795.298-.795h5.365a.563.563 0 00.475-.321l2.125-5.11z" />
    </svg>
);


interface SpinnerProps {
  message?: string | string[];
}

const Spinner: React.FC<SpinnerProps> = ({ message = "Summoning insights..." }) => {
  const messages = Array.isArray(message) ? message : [message];
  const [currentMessage, setCurrentMessage] = useState(messages[0] || "");

  useEffect(() => {
    if (messages.length > 1) {
      const intervalId = setInterval(() => {
        setCurrentMessage(prev => {
          const currentIndex = messages.indexOf(prev);
          const nextIndex = (currentIndex + 1) % messages.length;
          return messages[nextIndex];
        });
      }, 2500);
      return () => clearInterval(intervalId);
    }
  }, [messages]);

  return (
    <div className="flex flex-col items-center justify-center gap-4" role="status" aria-label="Loading">
      <StarIcon className="w-12 h-12 text-accent animate-pulse-soft" />
      {currentMessage && <span key={currentMessage} className="text-sub text-center animate-fade-in">{currentMessage}</span>}
    </div>
  );
};

export default Spinner;