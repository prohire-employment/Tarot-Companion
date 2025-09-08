
import React from 'react';

interface IconProps {
  className?: string;
  title?: string;
}

const BaseMoonIcon: React.FC<IconProps & { children: React.ReactNode }> = ({ className, title, children }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-label={title}
  >
    {title && <title>{title}</title>}
    {children}
  </svg>
);

const NewMoonIcon: React.FC<IconProps> = (props) => (
  <BaseMoonIcon {...props}>
    <circle cx="12" cy="12" r="9" fill="none" className="stroke-current opacity-70" />
  </BaseMoonIcon>
);

const FullMoonIcon: React.FC<IconProps> = (props) => (
  <BaseMoonIcon {...props}>
    <circle cx="12" cy="12" r="9" />
  </BaseMoonIcon>
);

const WaxingCrescentIcon: React.FC<IconProps> = (props) => (
  <BaseMoonIcon {...props}>
    <circle cx="12" cy="12" r="9" fill="none" className="stroke-current opacity-70" />
    <path d="M12,21 A9,9 0,0,1 12,3 A4.5,9 0,0,0 12,21 Z" />
  </BaseMoonIcon>
);

const FirstQuarterIcon: React.FC<IconProps> = (props) => (
  <BaseMoonIcon {...props}>
    <circle cx="12" cy="12" r="9" fill="none" className="stroke-current opacity-70" />
    <path d="M12 3 v18 a9 9 0 0 0 0-18z" />
  </BaseMoonIcon>
);

const WaxingGibbousIcon: React.FC<IconProps> = (props) => (
  <BaseMoonIcon {...props}>
    <circle cx="12" cy="12" r="9" fill="none" className="stroke-current opacity-70" />
    <path d="M12,21 A9,9 0,0,1 12,3 A13.5,9 0,0,0 12,21 Z" />
  </BaseMoonIcon>
);

const WaningGibbousIcon: React.FC<IconProps> = (props) => (
  <BaseMoonIcon {...props}>
    <circle cx="12" cy="12" r="9" fill="none" className="stroke-current opacity-70" />
    <path d="M12,21 A9,9 0,0,0 12,3 A13.5,9 0,0,1 12,21 Z" />
  </BaseMoonIcon>
);

const LastQuarterIcon: React.FC<IconProps> = (props) => (
  <BaseMoonIcon {...props}>
    <circle cx="12" cy="12" r="9" fill="none" className="stroke-current opacity-70" />
    <path d="M12 3 v18 a9 9 0 0 1 0-18z" />
  </BaseMoonIcon>
);

const WaningCrescentIcon: React.FC<IconProps> = (props) => (
  <BaseMoonIcon {...props}>
    <circle cx="12" cy="12" r="9" fill="none" className="stroke-current opacity-70" />
    <path d="M12,21 A9,9 0,0,0 12,3 A4.5,9 0,0,1 12,21 Z" />
  </BaseMoonIcon>
);


export const SabbatIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    {props.title && <title>{props.title}</title>}
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

export const LunarPhaseIcon: React.FC<{ phase: string; className?: string }> = ({ phase, className }) => {
  switch (phase) {
    case 'New Moon': return <NewMoonIcon className={className} title={phase} />;
    case 'Waxing Crescent': return <WaxingCrescentIcon className={className} title={phase} />;
    case 'First Quarter': return <FirstQuarterIcon className={className} title={phase} />;
    case 'Waxing Gibbous': return <WaxingGibbousIcon className={className} title={phase} />;
    case 'Full Moon': return <FullMoonIcon className={className} title={phase} />;
    case 'Waning Gibbous': return <WaningGibbousIcon className={className} title={phase} />;
    case 'Last Quarter': return <LastQuarterIcon className={className} title={phase} />;
    case 'Waning Crescent': return <WaningCrescentIcon className={className} title={phase} />;
    default: return null;
  }
};
