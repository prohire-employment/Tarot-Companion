import React from 'react';
import type { Arcana, Suit } from '../../types';

interface IconProps {
  className?: string;
}

const MajorArcanaIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.321h5.365c.427 0 .621.514.298.795l-4.333 3.156a.563.563 0 00-.182.523l1.62 5.163c.123.393-.328.72-.67.483l-4.43-3.23a.563.563 0 00-.65 0l-4.43 3.23c-.342.237-.793-.09-.67-.483l1.62-5.163a.563.563 0 00-.182-.523l-4.333-3.156c-.323-.281-.129-.795.298-.795h5.365a.563.563 0 00.475-.321l2.125-5.11z" />
  </svg>
);

const WandsIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.998 15.998 0 011.622-3.385m5.043.025a15.998 15.998 0 001.622-3.385m3.388 1.62a15.998 15.998 0 00-1.622-3.385m-5.043-.025a15.998 15.998 0 01-3.388-1.622m7.5 4.5l-3.388-1.622m0 0a15.998 15.998 0 01-3.385 1.622m3.385-1.622a15.998 15.998 0 00-3.385 1.622m0 0a15.998 15.998 0 013.388 1.622m-5.043.025a15.998 15.998 0 00-1.622 3.385" />
  </svg>
);

const CupsIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v.01a6 6 0 01-5.84-7.38C3.91 10.99 6.22 4.24 6.22 4.24v-.01L6.22 4.23a2.25 2.25 0 014.5 0v.01l.004.008c.011.022.022.043.033.065.012.022.023.044.035.066.012.022.024.044.036.066.012.022.024.044.035.066.012.022.024.044.036.066.012.022.024.043.035.065l.004.008v.01c0 0 2.31 6.75 2.31 10.14z" />
  </svg>
);

const SwordsIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l7.5-7.5 7.5 7.5m-15 6l7.5-7.5 7.5 7.5" />
  </svg>
);

const PentaclesIcon: React.FC<IconProps> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.795V12A9 9 0 103 12v.795l-.322.185A.75.75 0 002.25 14.5v.068a.75.75 0 00.322.627l.322.185v1.275A.75.75 0 003.75 18v.068a.75.75 0 00.322.627l.322.185v1.275a.75.75 0 00.82.727l.004-.002a.75.75 0 00.727-.82V20.5l.322-.185a.75.75 0 00.322-.627v-.068a.75.75 0 00-.82-.727l-.004.002a.75.75 0 00-.727.82v.982l-.322-.185a.75.75 0 00-.322-.627v-1.275l.322-.185a.75.75 0 00.322-.627v-.068a.75.75 0 00-.82-.727l-.004.002a.75.75 0 00-.727.82v.982l-.322-.185a.75.75 0 00-.322-.627v-1.275l.322-.185a.75.75 0 00.322-.627V14.5a.75.75 0 00-.82-.727l-.004.002a.75.75 0 00-.727.82v.982l-.322-.185a.75.75 0 00-.322-.627V14.5a.75.75 0 00-.427-.693z" />
  </svg>
);


interface SuitIconProps {
  arcana: Arcana;
  suit: Suit;
  className?: string;
}

export const SuitIcon: React.FC<SuitIconProps> = ({ arcana, suit, className }) => {
  if (arcana === 'Major') {
    return <MajorArcanaIcon className={className} />;
  }
  
  switch (suit) {
    case 'Wands':
      return <WandsIcon className={className} />;
    case 'Cups':
      return <CupsIcon className={className} />;
    case 'Swords':
      return <SwordsIcon className={className} />;
    case 'Pentacles':
      return <PentaclesIcon className={className} />;
    default:
      return null;
  }
};
