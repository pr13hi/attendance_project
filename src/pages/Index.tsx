
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, Users, Clock } from 'lucide-react';
import VideoMeeting from '@/components/VideoMeeting';

const Index = () => {
  const [meetingState, setMeetingState] = useState<'home' | 'meeting'>('home');
  const [userRole, setUserRole] = useState<'host' | 'participant'>('participant');
  const [userName, setUserName] = useState('');
  const [userRoll, setUserRoll] = useState('');
  const [meetingId, setMeetingId] = useState('');

  const handleJoinMeeting = () => {
    if (userName && meetingId && (userRole === 'host' || userRoll)) {
      setMeetingState('meeting');
    }
  };

  const generateMeetingId = () => {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    setMeetingId(id);
  };

  if (meetingState === 'meeting') {
    return (
      <VideoMeeting 
        userName={userName}
        userRoll={userRoll}
        meetingId={meetingId}
        isHost={userRole === 'host'}
        onLeaveMeeting={() => setMeetingState('home')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <Video className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">MeetConnect</h1>
          <p className="text-slate-300">Secure video meetings with smart attendance</p>
        </div>

        <Card className="bg-white/10 backdrop-blur-md border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-center">Join Meeting</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Your Name
              </label>
              <Input
                type="text"
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Role
              </label>
              <div className="flex space-x-2">
                <Button
                  variant={userRole === 'host' ? 'default' : 'outline'}
                  onClick={() => setUserRole('host')}
                  className={userRole === 'host' ? 'bg-blue-600 hover:bg-blue-700' : 'border-white/20 text-white hover:bg-white/10'}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Host
                </Button>
                <Button
                  variant={userRole === 'participant' ? 'default' : 'outline'}
                  onClick={() => setUserRole('participant')}
                  className={userRole === 'participant' ? 'bg-blue-600 hover:bg-blue-700' : 'border-white/20 text-white hover:bg-white/10'}
                >
                  <Video className="w-4 h-4 mr-2" />
                  Participant
                </Button>
              </div>
            </div>

            {userRole === 'participant' && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Roll Number
                </label>
                <Input
                  type="text"
                  placeholder="Enter your roll number"
                  value={userRoll}
                  onChange={(e) => setUserRoll(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Meeting ID
              </label>
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Enter meeting ID"
                  value={meetingId}
                  onChange={(e) => setMeetingId(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-slate-400"
                />
                {userRole === 'host' && (
                  <Button
                    onClick={generateMeetingId}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Generate
                  </Button>
                )}
              </div>
            </div>

            <Button
              onClick={handleJoinMeeting}
              disabled={!userName || !meetingId || (userRole === 'participant' && !userRoll)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Video className="w-4 h-4 mr-2" />
              Join Meeting
            </Button>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm flex items-center justify-center">
            <Clock className="w-4 h-4 mr-1" />
            Automated attendance with face recognition
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
