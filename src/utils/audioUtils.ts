
export const playNotificationSound = () => {
  try {
    // Create a deeply zen meditation bell sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Use 432Hz tuning for more meditative frequencies - pentatonic scale
    const frequencies = [432, 486, 648, 729]; // A4, B4, E5, F#5 in 432Hz tuning
    const oscillators: OscillatorNode[] = [];
    const gainNodes: GainNode[] = [];
    
    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Add subtle reverb-like effect with multiple oscillators per frequency
      const harmonicOscillator = audioContext.createOscillator();
      const harmonicGain = audioContext.createGain();
      
      oscillator.connect(gainNode);
      harmonicOscillator.connect(harmonicGain);
      gainNode.connect(audioContext.destination);
      harmonicGain.connect(audioContext.destination);
      
      // Configure main tone - bell-like with slight detune for richness
      oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
      oscillator.type = 'sine';
      
      // Add subtle harmonic for bell-like quality
      harmonicOscillator.frequency.setValueAtTime(freq * 2.01, audioContext.currentTime); // Slightly detuned octave
      harmonicOscillator.type = 'sine';
      
      // Much gentler timing for deeper meditation feel
      const startTime = audioContext.currentTime + (index * 0.3); // Slower cascade
      const peakTime = startTime + 0.2; // Gentle attack
      const fadeTime = startTime + 3; // Longer sustain
      
      // Main tone - very gentle volume curve
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.08, peakTime); // Softer volume
      gainNode.gain.exponentialRampToValueAtTime(0.01, fadeTime);
      
      // Harmonic tone - much quieter for subtle richness
      harmonicGain.gain.setValueAtTime(0, startTime);
      harmonicGain.gain.exponentialRampToValueAtTime(0.02, peakTime + 0.1);
      harmonicGain.gain.exponentialRampToValueAtTime(0.001, fadeTime);
      
      // Start with longer overlap for singing bowl effect
      oscillator.start(startTime);
      oscillator.stop(fadeTime);
      harmonicOscillator.start(startTime + 0.1);
      harmonicOscillator.stop(fadeTime);
      
      oscillators.push(oscillator, harmonicOscillator);
      gainNodes.push(gainNode, harmonicGain);
    });
  } catch (error) {
    console.log('Could not play notification sound:', error);
  }
};
