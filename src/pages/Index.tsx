
import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
        return 'from-blue-500 to-indigo-600';
      case 'breaking':
        return 'from-orange-400 to-red-500';
      default:
        return 'from-gray-400 to-gray-600';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Flowmodoro
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Work with your natural flow, break proportionally
          </p>
        </div>

        {/* Main Timer Card */}
        <Card className="p-8 text-center space-y-6 shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          {/* State Indicator */}
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-white text-sm font-medium bg-gradient-to-r ${getStateColor()} shadow-lg`}>
            {getStateText()}
          </div>

          {/* Timer Display */}
          <div className="space-y-4">
            <div className={`text-6xl font-mono font-bold transition-colors duration-500 ${
              state === 'working' ? 'text-blue-600 dark:text-blue-400' : 
              state === 'breaking' ? 'text-orange-500 dark:text-orange-400' : 
              'text-gray-600 dark:text-gray-400'
            }`}>
              {formatTime(displayTime)}
            </div>
            
            {state === 'working' && workTime > 0 && (
              <div className="text-sm text-gray-500 dark:text-gray-400">
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
              className={`px-8 py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                state === 'working' ? 'bg-blue-600 hover:bg-blue-700' :
                state === 'breaking' ? 'bg-orange-500 hover:bg-orange-600' :
                'bg-green-600 hover:bg-green-700'
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
                className="px-6 py-4 transition-all duration-300 transform hover:scale-105"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
            )}
          </div>
        </Card>

        {/* Info Section */}
        <div className="text-center space-y-4 text-sm text-gray-600 dark:text-gray-400">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <div className="font-semibold text-blue-600 dark:text-blue-400">Work Flow</div>
              <div>Focus until natural fade</div>
            </div>
            <div className="p-4 rounded-lg bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
              <div className="font-semibold text-orange-500 dark:text-orange-400">Smart Break</div>
              <div>Work time ÷ 5</div>
            </div>
          </div>
          
          <p className="text-xs opacity-75">
            Work as long as you can focus, then take a proportional break. 
            This technique adapts to your natural rhythm for deeper productivity.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
