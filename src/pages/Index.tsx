import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { playNotificationSound } from '@/utils/audioUtils';

type TimerState = 'idle' | 'working' | 'breaking';

const Index = () => {
  const [state, setState] = useState<TimerState>('idle');
  const [workTime, setWorkTime] = useState(0); // in seconds
  const [breakTime, setBreakTime] = useState(0); // in seconds
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const startTimer = () => {
    if (state === 'idle') {
      // Start work session
      setState('working');
      setWorkTime(0);
      setIsRunning(true);
    } else if (state === 'working') {
      // Stop work and prepare break
      setIsRunning(false);
      const calculatedBreakTime = Math.max(Math.floor(workTime / 5), 60); // Minimum 1 minute break
      setBreakTime(calculatedBreakTime);
      setState('breaking');
    } else if (state === 'breaking') {
      // Start break countdown
      setIsRunning(true);
    }
  };

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setState('idle');
    setWorkTime(0);
    setBreakTime(0);
  };

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        if (state === 'working') {
          setWorkTime(prev => prev + 1);
        } else if (state === 'breaking') {
          setBreakTime(prev => {
            if (prev <= 1) {
              // Break finished - play sound notification
              playNotificationSound();
              setIsRunning(false);
              setState('idle');
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, state]);

  const getStateColor = () => {
    switch (state) {
      case 'working':
        return 'from-sage-500 to-sage-600';
      case 'breaking':
        return 'from-amber-400 to-orange-400';
      default:
        return 'from-stone-400 to-stone-500';
    }
  };

  const getStateText = () => {
    switch (state) {
      case 'working':
        return isRunning ? 'Working...' : 'Work Session';
      case 'breaking':
        return isRunning ? 'Break Time' : `Break Ready: ${formatTime(breakTime)}`;
      default:
        return 'Ready to Focus';
    }
  };

  const getButtonText = () => {
    if (state === 'idle') return 'Start Work';
    if (state === 'working') return isRunning ? 'Finish Work' : 'Resume';
    if (state === 'breaking') return isRunning ? 'Pause Break' : 'Start Break';
    return 'Start';
  };

  const displayTime = state === 'working' ? workTime : (state === 'breaking' ? breakTime : 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header with Theme Toggle */}
        <div className="text-center space-y-3 relative">
          <div className="absolute top-0 right-0">
            <ThemeToggle />
          </div>
          <h1 className="text-4xl font-serif font-light bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent tracking-wide">
            Flowmodoro
          </h1>
          <p className="text-muted-foreground text-sm font-light tracking-wide">
            Work with your natural flow, break proportionally
          </p>
        </div>

        {/* Main Timer Card */}
        <Card className="p-8 text-center space-y-8 shadow-lg border-0 bg-card/90 backdrop-blur-sm rounded-2xl">
          {/* State Indicator */}
          <div className={`inline-flex items-center px-6 py-3 rounded-full text-white text-sm font-light bg-gradient-to-r ${getStateColor()} shadow-md`}>
            {getStateText()}
          </div>

          {/* Timer Display */}
          <div className="space-y-6">
            <div className={`text-7xl font-serif font-light transition-colors duration-700 ${
              state === 'working' ? 'text-sage-500 dark:text-sage-500' : 
              state === 'breaking' ? 'text-amber-500 dark:text-amber-400' : 
              'text-muted-foreground'
            }`}>
              {formatTime(displayTime)}
            </div>
            
            {state === 'working' && workTime > 0 && (
              <div className="text-sm text-muted-foreground font-light">
                Break will be: {formatTime(Math.max(Math.floor(workTime / 5), 60))}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex justify-center gap-4">
            <Button
              onClick={startTimer}
              disabled={state === 'breaking' && breakTime === 0}
              size="lg"
              className={`px-8 py-4 text-lg font-light tracking-wide transition-all duration-500 transform hover:scale-105 rounded-xl ${
                state === 'working' ? 'bg-sage-500 hover:bg-sage-600 text-white' :
                state === 'breaking' ? 'bg-amber-500 hover:bg-amber-600 text-white' :
                'bg-primary hover:bg-primary/80 text-primary-foreground'
              }`}
            >
              {isRunning && (state === 'working' || state === 'breaking') ? (
                <Pause className="w-5 h-5 mr-2" />
              ) : (
                <Play className="w-5 h-5 mr-2" />
              )}
              {getButtonText()}
            </Button>

            {(state !== 'idle' || workTime > 0) && (
              <Button
                onClick={resetTimer}
                variant="outline"
                size="lg"
                className="px-6 py-4 transition-all duration-500 transform hover:scale-105 rounded-xl border-muted-foreground/20 hover:border-muted-foreground/40"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
            )}
          </div>
        </Card>

        {/* Info Section */}
        <div className="text-center space-y-6 text-sm text-muted-foreground">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/50">
              <div className="font-medium text-sage-500 dark:text-sage-500 mb-2 font-serif">Work Flow</div>
              <div className="font-light">Focus until natural fade</div>
            </div>
            <div className="p-6 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/50">
              <div className="font-medium text-amber-500 dark:text-amber-400 mb-2 font-serif">Smart Break</div>
              <div className="font-light">Work time ÷ 5</div>
            </div>
          </div>
          
          <p className="text-xs opacity-75 font-light leading-relaxed max-w-sm mx-auto">
            Work as long as you can focus, then take a proportional break. 
            This technique adapts to your natural rhythm for deeper productivity.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
