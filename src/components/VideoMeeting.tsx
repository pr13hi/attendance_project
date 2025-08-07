
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  VideoOff, 
  Users, 
  Clock, 
  Download,
  Settings,
  LogOut
} from 'lucide-react';
import ZegoMeetingManager from '@/components/ZegoMeetingManager';
import AttendanceSystem from '@/components/AttendanceSystem';
import HostControls from '@/components/HostControls';

interface VideoMeetingProps {
  userName: string;
  userRoll: string;
  meetingId: string;
  isHost: boolean;
  onLeaveMeeting: () => void;
}

interface AttendanceRecord {
  name: string;
  roll: string;
  timestamp: Date;
  verified: boolean;
}

const VideoMeeting: React.FC<VideoMeetingProps> = ({
  userName,
  userRoll,
  meetingId,
  isHost,
  onLeaveMeeting
}) => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [currentAttendanceTarget, setCurrentAttendanceTarget] = useState<string | null>(null);
  const [attendanceInterval, setAttendanceInterval] = useState(30); // seconds
  const [isAttendanceActive, setIsAttendanceActive] = useState(false);
  const [participants, setParticipants] = useState<Array<{name: string, roll: string}>>([]);

  // Simulate participants for demo
  useEffect(() => {
    const demoParticipants = [
      { name: userName, roll: userRoll || 'HOST' },
      { name: 'Alice Johnson', roll: 'ST001' },
      { name: 'Bob Smith', roll: 'ST002' },
      { name: 'Carol Davis', roll: 'ST003' },
    ];
    setParticipants(demoParticipants);
  }, [userName, userRoll]);

  const handleAttendanceVerified = (name: string, roll: string) => {
    const newRecord: AttendanceRecord = {
      name,
      roll,
      timestamp: new Date(),
      verified: true
    };
    setAttendanceRecords(prev => [...prev, newRecord]);
    setCurrentAttendanceTarget(null);
  };

  const exportAttendanceCSV = () => {
    const csvContent = [
      ['Name', 'Roll Number', 'Timestamp', 'Status'],
      ...attendanceRecords.map(record => [
        record.name,
        record.roll,
        record.timestamp.toLocaleString(),
        record.verified ? 'Present' : 'Absent'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${meetingId}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">Meeting: {meetingId}</h1>
              <p className="text-slate-400 text-sm">
                {isHost ? 'Host' : 'Participant'} • {userName}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="border-green-500 text-green-400">
              <Users className="w-3 h-3 mr-1" />
              {participants.length} participants
            </Badge>
            
            {isHost && (
              <Button
                onClick={exportAttendanceCSV}
                variant="outline"
                size="sm"
                className="border-slate-600 hover:bg-slate-700"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            )}
            
            <Button
              onClick={onLeaveMeeting}
              variant="destructive"
              size="sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Leave
            </Button>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Video Area */}
        <div className="flex-1 p-4">
          <ZegoMeetingManager
            userName={userName}
            meetingId={meetingId}
            isHost={isHost}
            onParticipantsChange={setParticipants}
          />
          
          {/* Attendance Modal */}
          {currentAttendanceTarget && (
            <AttendanceSystem
              targetUser={currentAttendanceTarget}
              onVerified={(name, roll) => handleAttendanceVerified(name, roll)}
              onClose={() => setCurrentAttendanceTarget(null)}
            />
          )}
        </div>

        {/* Side Panel */}
        <div className="w-80 bg-slate-800 border-l border-slate-700 p-4 space-y-4">
          {isHost && (
            <HostControls
              attendanceInterval={attendanceInterval}
              setAttendanceInterval={setAttendanceInterval}
              isAttendanceActive={isAttendanceActive}
              setIsAttendanceActive={setIsAttendanceActive}
              participants={participants}
              onTakeAttendance={setCurrentAttendanceTarget}
            />
          )}

          {/* Attendance Records */}
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Attendance Log
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {attendanceRecords.length === 0 ? (
                <p className="text-slate-400 text-sm">No attendance records yet</p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {attendanceRecords.map((record, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-slate-600 rounded text-sm"
                    >
                      <div>
                        <p className="font-medium">{record.name}</p>
                        <p className="text-slate-300">{record.roll}</p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={record.verified ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {record.verified ? "Present" : "Absent"}
                        </Badge>
                        <p className="text-slate-400 text-xs mt-1">
                          {record.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Participants List */}
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Participants ({participants.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {participants.map((participant, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-2 bg-slate-600 rounded text-sm"
                >
                  <div>
                    <p className="font-medium">{participant.name}</p>
                    <p className="text-slate-300">{participant.roll}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className="border-green-500 text-green-400 text-xs"
                  >
                    Online
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VideoMeeting;
