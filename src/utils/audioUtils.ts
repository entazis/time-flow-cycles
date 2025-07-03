
export const playNotificationSound = () => {
  try {
    // Create a zen-like chime sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Create multiple oscillators for a harmonious chime effect
    const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5 - a pleasant C major chord
    const oscillators: OscillatorNode[] = [];
    const gainNodes: GainNode[] = [];
    
    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Configure each tone
      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
      oscillator.type = 'sine'; // Smooth sine wave for zen-like quality
      
      // Set volume with slight delay for each note to create a gentle cascade
      const startTime = audioContext.currentTime + (index * 0.1);
      const fadeTime = startTime + 1.5;
      
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.15, startTime + 0.05); // Gentle volume
      gainNode.gain.exponentialRampToValueAtTime(0.01, fadeTime);
      
      // Play each note with slight staggering
      oscillator.start(startTime);
      oscillator.stop(fadeTime);
      
      oscillators.push(oscillator);
      gainNodes.push(gainNode);
    });
  } catch (error) {
    console.log('Could not play notification sound:', error);
  }
};
