import { Spread } from '../types';

export const SPREADS: Spread[] = [
  {
    id: 'single-card',
    name: 'Card of the Day',
    description: 'A single card for daily focus and guidance.',
    cardCount: 1,
    positions: [
      { title: 'Card of the Day', description: 'The central theme or energy for the day.' }
    ]
  },
  {
    id: 'past-present-future',
    name: 'Past, Present, Future',
    description: 'A three-card spread to understand the flow of events.',
    cardCount: 3,
    positions: [
      { title: 'Past', description: 'Past influences and events that have led to the present.' },
      { title: 'Present', description: 'The current situation and your state of being.' },
      { title: 'Future', description: 'The potential outcome or direction things are heading.' }
    ]
  },
    {
    id: 'situation-obstacle-advice',
    name: 'Situation, Obstacle, Advice',
    description: 'Get clarity on a specific challenge.',
    cardCount: 3,
    positions: [
      { title: 'The Situation', description: 'Represents the core of the matter or your current position.' },
      { title: 'The Obstacle', description: 'Highlights the primary challenge or block you are facing.' },
      { title: 'Advice', description: 'Suggests a course of action or approach to resolve the issue.' }
    ]
  },
  {
    id: 'mind-body-spirit',
    name: 'Mind, Body, Spirit',
    description: 'A check-in for your personal alignment and well-being.',
    cardCount: 3,
    positions: [
      { title: 'Mind', description: 'Your current thoughts, beliefs, and mental state.' },
      { title: 'Body', description: 'Your physical health, energy, and connection to the material world.' },
      { title: 'Spirit', description: 'Your spiritual path, intuition, and higher self.' }
    ]
  },
  {
    id: 'four-elements',
    name: 'Four Elements Check-In',
    description: 'Assess balance across the four key areas of your life.',
    cardCount: 4,
    positions: [
      { title: 'Earth (Body)', description: 'Represents your physical health, finances, and material world.' },
      { title: 'Air (Mind)', description: 'Represents your thoughts, communication, and intellectual state.' },
      { title: 'Fire (Spirit)', description: 'Represents your passion, creativity, energy, and actions.' },
      { title: 'Water (Heart)', description: 'Represents your emotions, relationships, and intuition.' }
    ]
  },
  {
    id: 'relationship-spread',
    name: 'Relationship Spread',
    description: 'Explore the dynamics between you and another person.',
    cardCount: 5,
    positions: [
      { title: 'You', description: 'Your energy and perspective in the relationship.' },
      { title: 'The Other', description: 'The other person\'s energy and perspective.' },
      { title: 'The Connection', description: 'The current state and nature of the relationship itself.' },
      { title: 'The Challenge', description: 'An obstacle or area for growth within the connection.' },
      { title: 'The Potential', description: 'The possible future direction of the relationship.' }
    ]
  },
  {
    id: 'career-path',
    name: 'Career Path',
    description: 'Gain insight into your professional life and future direction.',
    cardCount: 5,
    positions: [
      { title: 'Current Situation', description: 'Where you are now in your career.' },
      { title: 'Your Strengths', description: 'The skills and talents you should leverage.' },
      { title: 'Hidden Obstacles', description: 'What might be blocking your progress, internally or externally.' },
      { title: 'Actionable Advice', description: 'A suggested course of action to move forward.' },
      { title: 'Long-Term Potential', description: 'The potential outcome or future of your career path.' }
    ]
  },
  {
    id: 'the-week-ahead',
    name: 'The Week Ahead',
    description: 'A 7-card spread for an overview of the upcoming week.',
    cardCount: 7,
    positions: [
        { title: 'Overall Theme', description: 'The main energy or theme for the week.' },
        { title: 'Challenge', description: 'An obstacle you may face this week.' },
        { title: 'Work & Productivity', description: 'Guidance related to your career or projects.' },
        { title: 'Relationships', description: 'Insight into your connections with others.' },
        { title: 'Personal Growth', description: 'An area for self-improvement or introspection.' },
        { title: 'Unexpected Event', description: 'Something to be aware of that you may not see coming.' },
        { title: 'Key Lesson', description: 'The primary lesson to learn by the end of the week.' }
    ]
  },
  {
    id: 'celtic-cross',
    name: 'Celtic Cross',
    description: 'A comprehensive 10-card spread for deep insight into a complex situation.',
    cardCount: 10,
    positions: [
      { title: '1. The Heart of the Matter', description: 'The core of the situation, your current state.' },
      { title: '2. The Challenge', description: 'The immediate obstacle or crossing influence.' },
      { title: '3. The Foundation', description: 'The underlying basis or root cause.' },
      { title: '4. The Recent Past', description: 'Events that have just passed but still influence you.' },
      { title: '5. The Crown', description: 'Your conscious awareness, goals, or the best possible outcome.' },
      { title: '6. The Near Future', description: 'What lies immediately ahead.' },
      { title: '7. Your Attitude', description: 'Your own feelings and perspective on the situation.' },
      { title: '8. External Influences', description: 'The environment, other people, or external factors.' },
      { title: '9. Hopes and Fears', description: 'Your inner hopes or fears regarding the outcome.' },
      { title: '10. The Final Outcome', description: 'The likely long-term result if things continue on their current path.' }
    ]
  },
];
