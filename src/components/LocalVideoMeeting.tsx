
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  Users, 
  Clock, 
  Download,
  LogOut,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import ImprovedZegoManager from '@/components/ImprovedZegoManager';
import AttendanceSystem from '@/components/AttendanceSystem';
import HostControls from '@/components/HostControls';

interface LocalVideoMeetingProps {
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

const LocalVideoMeeting: React.FC<LocalVideoMeetingProps> = ({
  userName,
  userRoll,
  meetingId,
  isHost,
  onLeaveMeeting
}) => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [participants, setParticipants] = useState<Array<{name: string, roll: string}>>([]);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'failed' | 'disconnected'>('connecting');
  const [meetingStartTime] = useState(new Date());
  const [currentAttendanceTarget, setCurrentAttendanceTarget] = useState<string | null>(null);
  const [attendanceInterval, setAttendanceInterval] = useState(30);
  const [isAttendanceActive, setIsAttendanceActive] = useState(false);

  // Initialize with current user and generate proper roll number
  useEffect(() => {
    const hostRoll = isHost ? 'HOST001' : userRoll || `ST${Math.floor(Math.random() * 999).toString().padStart(3, '0')}`;
    setParticipants([{ name: userName, roll: hostRoll }]);
    console.log(`🎯 Initialized user: ${userName} with roll: ${hostRoll}`);
  }, [userName, userRoll, isHost]);

  // Update participants when new users join
  const handleParticipantsChange = (newParticipants: Array<{name: string, roll: string}>) => {
    console.log('👥 Participants updated:', newParticipants);
    
    // Ensure proper roll number assignment
    const updatedParticipants = newParticipants.map(participant => ({
      ...participant,
      roll: participant.roll === 'HOST' || participant.roll.startsWith('HOST') 
        ? `HOST${Math.floor(Math.random() * 999).toString().padStart(3, '0')}`
        : participant.roll.startsWith('ST') 
          ? participant.roll 
          : `ST${Math.floor(Math.random() * 999).toString().padStart(3, '0')}`
    }));
    
    setParticipants(updatedParticipants);
  };

  // Load attendance records from localStorage
  useEffect(() => {
    const savedRecords = localStorage.getItem(`attendance_${meetingId}`);
    if (savedRecords) {
      const records = JSON.parse(savedRecords).map((record: any) => ({
        ...record,
        timestamp: new Date(record.timestamp)
      }));
      setAttendanceRecords(records);
    }
  }, [meetingId]);

  // Save attendance records to localStorage
  useEffect(() => {
    if (attendanceRecords.length > 0) {
      localStorage.setItem(`attendance_${meetingId}`, JSON.stringify(attendanceRecords));
    }
  }, [attendanceRecords, meetingId]);

  const handleAttendanceVerified = (name: string, roll: string) => {
    const newRecord: AttendanceRecord = {
      name,
      roll,
      timestamp: new Date(),
      verified: true
    };
    setAttendanceRecords(prev => [...prev, newRecord]);
    setCurrentAttendanceTarget(null);
    
    console.log(`✅ Attendance verified for ${name} (${roll})`);
  };

  const handleTakeAttendance = (targetUser: string) => {
    console.log(`🎯 Taking attendance for: ${targetUser}`);
    setCurrentAttendanceTarget(targetUser);
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-400 border-green-500';
      case 'failed': return 'text-red-400 border-red-500';
      case 'connecting': return 'text-yellow-400 border-yellow-500';
      default: return 'text-gray-400 border-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <AlertCircle className="w-4 h-4" />;
      case 'connecting': return <Loader2 className="w-4 h-4 animate-spin" />;
      default: return <Video className="w-4 h-4" />;
    }
  };

  const exportAttendanceCSV = () => {
    const allAttendance = [
      // Verified attendance records
      ...attendanceRecords,
      // Current participants not yet verified
      ...participants
        .filter(p => !attendanceRecords.some(r => r.name === p.name))
        .map(p => ({
          name: p.name,
          roll: p.roll,
          timestamp: meetingStartTime,
          verified: false
        }))
    ];

    const csvContent = [
      ['Meeting ID', 'Name', 'Roll Number', 'Join Time', 'Status', 'Verification'],
      ...allAttendance.map(record => [
        meetingId,
        record.name,
        record.roll,
        record.timestamp.toLocaleString(),
        'Present',
        record.verified ? 'Verified' : 'Not Verified'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${meetingId}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    console.log(`📊 Exported attendance CSV for ${allAttendance.length} participants`);
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
                {isHost ? 'Host' : 'Participant'} • {userName} • {participants.find(p => p.name === userName)?.roll}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className={`${getStatusColor()}`}>
              {getStatusIcon()}
              <span className="ml-1 capitalize">{connectionStatus}</span>
            </Badge>
            
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
          {connectionStatus === 'failed' ? (
            <div className="w-full h-full bg-slate-800 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Connection Failed</h3>
                <p className="text-slate-400 mb-4">
                  Unable to connect to video service. Please check your credentials.
                </p>
                <p className="text-slate-500 text-sm">
                  Make sure you've updated your ZegoCloud App ID and Server Secret
                </p>
              </div>
            </div>
          ) : (
            <ImprovedZegoManager
              userName={userName}
              meetingId={meetingId}
              isHost={isHost}
              onParticipantsChange={handleParticipantsChange}
              onConnectionStatusChange={setConnectionStatus}
            />
          )}

          {/* Attendance Modal */}
          {currentAttendanceTarget && (
            <AttendanceSystem
              targetUser={currentAttendanceTarget}
              onVerified={(name, roll) => {
                // Use the participant's actual roll number
                const participant = participants.find(p => p.name === name);
                const actualRoll = participant ? participant.roll : roll;
                handleAttendanceVerified(name, actualRoll);
              }}
              onClose={() => setCurrentAttendanceTarget(null)}
            />
          )}
        </div>

        {/* Side Panel */}
        <div className="w-80 bg-slate-800 border-l border-slate-700 p-4 space-y-4 overflow-y-auto">
          {/* Host Controls */}
          {isHost && (
            <HostControls
              attendanceInterval={attendanceInterval}
              setAttendanceInterval={setAttendanceInterval}
              isAttendanceActive={isAttendanceActive}
              setIsAttendanceActive={setIsAttendanceActive}
              participants={participants}
              onTakeAttendance={handleTakeAttendance}
            />
          )}

          {/* Meeting Info */}
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Meeting Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Started:</span>
                  <span className="text-white">{meetingStartTime.toLocaleTimeString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Duration:</span>
                  <span className="text-white">
                    {Math.floor((Date.now() - meetingStartTime.getTime()) / 60000)} min
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className={`capitalize ${getStatusColor().split(' ')[0]}`}>
                    {connectionStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Verified:</span>
                  <span className="text-white">{attendanceRecords.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attendance Records */}
          <Card className="bg-slate-700 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                Attendance Log ({attendanceRecords.length})
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
                        <p className="font-medium text-white">{record.name}</p>
                        <p className="text-slate-300">{record.roll}</p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="default"
                          className="text-xs bg-green-600"
                        >
                          Verified
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
              {participants.map((participant, index) => {
                const isVerified = attendanceRecords.some(r => r.name === participant.name);
                return (
                  <div
                    key={index}
                    className="flex justify-between items-center p-2 bg-slate-600 rounded text-sm"
                  >
                    <div>
                      <p className="font-medium text-white">{participant.name}</p>
                      <p className="text-slate-300">{participant.roll}</p>
                    </div>
                    <div className="flex flex-col items-end space-y-1">
                      <Badge
                        variant="outline"
                        className="border-green-500 text-green-400 text-xs"
                      >
                        Online
                      </Badge>
                      {isVerified && (
                        <Badge
                          variant="default"
                          className="text-xs bg-blue-600"
                        >
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LocalVideoMeeting;
