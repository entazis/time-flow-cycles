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
        return 'from-blue to-indigo';
      case 'breaking':
        return 'from-orange to-pink';
      default:
        return 'from-muted-foreground to-secondary';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header with Theme Toggle */}
        <div className="text-center space-y-3 relative">
          <div className="absolute top-0 right-0">
            <ThemeToggle />
          </div>
          <h1 className="text-5xl font-display font-medium bg-gradient-to-r from-blue via-indigo to-purple bg-clip-text text-transparent tracking-tight">
            Flowmodoro
          </h1>
          <p className="text-muted-foreground text-sm tracking-wide">
            Work with your natural flow, break proportionally
          </p>
        </div>

        {/* Main Timer Card */}
        <Card className="p-8 text-center space-y-8 shadow-xl border-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg rounded-3xl ring-1 ring-black/5 dark:ring-white/10">
          {/* State Indicator */}
          <div className={`inline-flex items-center px-6 py-3 rounded-full text-white text-sm font-medium bg-gradient-to-r ${getStateColor()} shadow-lg`}>
            {getStateText()}
          </div>

          {/* Timer Display */}
          <div className="space-y-6">
            <div className={`text-7xl font-display font-semibold transition-colors duration-700 ${
              state === 'working' ? 'text-blue dark:text-blue' : 
              state === 'breaking' ? 'text-orange dark:text-orange' : 
              'text-muted-foreground'
            }`}>
              {formatTime(displayTime)}
            </div>
            
            {state === 'working' && workTime > 0 && (
              <div className="text-sm text-muted-foreground">
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
              className={`px-8 py-4 text-lg font-medium tracking-wide transition-all duration-300 transform hover:scale-105 rounded-2xl shadow-lg ${
                state === 'working' ? 'bg-gradient-to-r from-blue to-indigo hover:shadow-blue/25 text-white' :
                state === 'breaking' ? 'bg-gradient-to-r from-orange to-pink hover:shadow-orange/25 text-white' :
                'bg-gradient-to-r from-blue to-indigo hover:shadow-blue/25 text-white'
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
                className="px-6 py-4 transition-all duration-300 transform hover:scale-105 rounded-2xl border-2"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
            )}
          </div>
        </Card>

        {/* Info Section */}
        <div className="text-center space-y-6 text-sm text-muted-foreground">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue/10 to-indigo/10 dark:from-blue/5 dark:to-indigo/5 backdrop-blur-sm border border-blue/20 dark:border-blue/10">
              <div className="font-semibold text-blue dark:text-blue mb-2 font-display">Work Flow</div>
              <div>Focus until natural fade</div>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-orange/10 to-pink/10 dark:from-orange/5 dark:to-pink/5 backdrop-blur-sm border border-orange/20 dark:border-orange/10">
              <div className="font-semibold text-orange dark:text-orange mb-2 font-display">Smart Break</div>
              <div>Work time ÷ 5</div>
            </div>
          </div>
          
          <p className="text-xs opacity-75 leading-relaxed max-w-sm mx-auto">
            Work as long as you can focus, then take a proportional break. 
            This technique adapts to your natural rhythm for deeper productivity.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
