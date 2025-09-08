import React, { useState, useEffect } from 'react';

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
      <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      {currentMessage && <span className="text-sub text-center">{currentMessage}</span>}
    </div>
  );
};

export default Spinner;
