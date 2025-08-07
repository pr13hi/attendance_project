
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Play, 
  Pause, 
  Users, 
  Clock,
  CheckSquare,
  UserCheck
} from 'lucide-react';

interface HostControlsProps {
  attendanceInterval: number;
  setAttendanceInterval: (interval: number) => void;
  isAttendanceActive: boolean;
  setIsAttendanceActive: (active: boolean) => void;
  participants: Array<{name: string, roll: string}>;
  onTakeAttendance: (targetUser: string) => void;
}

const HostControls: React.FC<HostControlsProps> = ({
  attendanceInterval,
  setAttendanceInterval,
  isAttendanceActive,
  setIsAttendanceActive,
  participants,
  onTakeAttendance
}) => {
  const [nextTarget, setNextTarget] = React.useState<string>('');

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isAttendanceActive && participants.length > 0) {
      console.log(`🤖 Starting automated attendance system (every ${attendanceInterval}s)`);
      
      interval = setInterval(() => {
        // Select random participant for attendance check (excluding HOST users)
        const availableParticipants = participants.filter(p => !p.roll.startsWith('HOST'));
        
        console.log(`👥 Available participants for attendance:`, availableParticipants);
        
        if (availableParticipants.length > 0) {
          const randomParticipant = availableParticipants[
            Math.floor(Math.random() * availableParticipants.length)
          ];
          
          console.log(`🎯 Auto-selecting ${randomParticipant.name} for attendance check`);
          setNextTarget(randomParticipant.name);
          onTakeAttendance(randomParticipant.name);
        } else {
          console.log('⚠️ No non-host participants available for attendance check');
        }
      }, attendanceInterval * 1000);
    }

    return () => {
      if (interval) {
        console.log('⏹️ Stopping automated attendance system');
        clearInterval(interval);
      }
    };
  }, [isAttendanceActive, attendanceInterval, participants, onTakeAttendance]);

  const handleManualAttendance = (participantName: string) => {
    console.log(`👨‍🏫 Manual attendance check for ${participantName}`);
    onTakeAttendance(participantName);
  };

  const toggleAttendanceSystem = () => {
    const newState = !isAttendanceActive;
    setIsAttendanceActive(newState);
    console.log(`${newState ? '▶️ Started' : '⏸️ Stopped'} automated attendance system`);
    
    if (!newState) {
      setNextTarget('');
    }
  };

  // Filter out HOST users for attendance checks
  const eligibleParticipants = participants.filter(p => !p.roll.startsWith('HOST'));

  return (
    <Card className="bg-slate-700 border-slate-600">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Settings className="w-5 h-5 mr-2" />
          Host Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Attendance System Toggle */}
        <div className="space-y-2">
          <Label className="text-slate-300">Automated Attendance System</Label>
          <div className="flex items-center space-x-2">
            <Button
              onClick={toggleAttendanceSystem}
              variant={isAttendanceActive ? "default" : "outline"}
              size="sm"
              className={
                isAttendanceActive 
                  ? "bg-green-600 hover:bg-green-700" 
                  : "border-slate-600 text-white hover:bg-slate-600"
              }
            >
              {isAttendanceActive ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Stop Auto
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Auto
                </>
              )}
            </Button>
            <Badge 
              variant={isAttendanceActive ? "default" : "secondary"}
              className={isAttendanceActive ? "bg-green-600" : ""}
            >
              {isAttendanceActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-xs text-slate-400">
            Automatically prompts random participants for face verification
          </p>
        </div>

        {/* Interval Setting */}
        <div className="space-y-2">
          <Label className="text-slate-300">Check Interval (seconds)</Label>
          <Input
            type="number"
            min="10"
            max="300"
            value={attendanceInterval}
            onChange={(e) => {
              const newInterval = Number(e.target.value);
              setAttendanceInterval(newInterval);
              console.log(`⏱️ Attendance interval updated to ${newInterval}s`);
            }}
            className="bg-slate-600 border-slate-500 text-white"
            disabled={isAttendanceActive}
          />
          <p className="text-xs text-slate-400">
            {isAttendanceActive ? 'Stop system to change interval' : 'Time between automatic checks'}
          </p>
        </div>

        {/* Next Target Indicator */}
        {isAttendanceActive && nextTarget && (
          <div className="p-3 bg-blue-600/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-center text-blue-400">
              <Clock className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Next Target: {nextTarget}</span>
            </div>
          </div>
        )}

        {/* System Status */}
        <div className="p-3 bg-slate-600 rounded-lg">
          <h4 className="text-white font-medium mb-2 flex items-center">
            <UserCheck className="w-4 h-4 mr-2" />
            System Status
          </h4>
          <div className="text-sm text-slate-300 space-y-1">
            <div className="flex justify-between">
              <span>Total Participants:</span>
              <span className="text-white font-medium">{participants.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Eligible for Attendance:</span>
              <span className="text-white font-medium">{eligibleParticipants.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Auto System:</span>
              <Badge 
                variant={isAttendanceActive ? "default" : "secondary"}
                className={`text-xs ${isAttendanceActive ? "bg-green-600" : ""}`}
              >
                {isAttendanceActive ? "Running" : "Stopped"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Check Every:</span>
              <span className="text-white font-medium">{attendanceInterval}s</span>
            </div>
          </div>
        </div>

        {/* Manual Attendance */}
        <div className="space-y-2">
          <Label className="text-slate-300">Manual Attendance Check</Label>
          {eligibleParticipants.length === 0 ? (
            <div className="p-3 bg-slate-600 rounded text-center">
              <p className="text-slate-400 text-sm">
                No non-host participants available for attendance check
              </p>
              <p className="text-slate-500 text-xs mt-1">
                Total participants: {participants.length} (including hosts)
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {eligibleParticipants.map((participant, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-slate-600 rounded text-sm"
                >
                  <div>
                    <p className="font-medium text-white">{participant.name}</p>
                    <p className="text-slate-300">{participant.roll}</p>
                  </div>
                  <Button
                    onClick={() => handleManualAttendance(participant.name)}
                    size="sm"
                    variant="outline"
                    className="border-slate-500 text-white hover:bg-slate-500"
                  >
                    <CheckSquare className="w-3 h-3 mr-1" />
                    Check
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default HostControls;
