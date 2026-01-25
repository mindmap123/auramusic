import { useState, useEffect } from 'react';

interface GreetingData {
  greeting: string;
  currentTime: string;
}

export function useGreeting(): GreetingData {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [greeting, setGreeting] = useState<string>('');

  useEffect(() => {
    const updateGreeting = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      
      // Format time as HH:MM
      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      setCurrentTime(timeString);
      
      // Determine greeting based on time
      let greetingText = '';
      if (hours >= 5 && hours < 12) {
        greetingText = 'Bonjour';
      } else if (hours >= 12 && hours < 18) {
        greetingText = 'Bon après-midi';
      } else {
        greetingText = 'Bonsoir';
      }
      setGreeting(greetingText);
    };

    // Update immediately
    updateGreeting();
    
    // Update every minute
    const interval = setInterval(updateGreeting, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return { greeting, currentTime };
}