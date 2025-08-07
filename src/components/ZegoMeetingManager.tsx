
import React, { useEffect, useRef, useState } from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

interface ZegoMeetingManagerProps {
  userName: string;
  meetingId: string;
  isHost: boolean;
  onParticipantsChange: (participants: Array<{name: string, roll: string}>) => void;
}

const ZegoMeetingManager: React.FC<ZegoMeetingManagerProps> = ({
  userName,
  meetingId,
  isHost,
  onParticipantsChange
}) => {
  const meetingRef = useRef<HTMLDivElement>(null);
  const [isZegoLoaded, setIsZegoLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!meetingRef.current) return;

    // TODO: Replace these with your actual ZegoCloud credentials
    const appID = 1484647939; // Replace with your actual App ID from ZegoCloud Console
    const serverSecret = "your_server_secret_here"; // Replace with your actual Server Secret from ZegoCloud Console
    
    console.log("Initializing ZegoCloud with:", { appID, serverSecret: serverSecret.substring(0, 10) + "..." });
    
    // Check if credentials are still demo values
    if (appID === 1484647939 || serverSecret === "your_server_secret_here") {
      console.warn("Demo credentials detected - please replace with your actual ZegoCloud App ID and Server Secret");
      setError("Demo credentials detected");
      return;
    }

    try {
      console.log("Generating Kit Token...");
      
      // Generate Kit Token
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        meetingId,
        Date.now().toString(),
        userName
      );

      console.log("Kit Token generated successfully");
      console.log("Creating ZegoUIKit instance...");

      const zp = ZegoUIKitPrebuilt.create(kitToken);

      console.log("Joining room...");

      zp.joinRoom({
        container: meetingRef.current,
        scenario: {
          mode: ZegoUIKitPrebuilt.VideoConference,
        },
        showScreenSharingButton: isHost,
        showInviteToCohostButton: isHost,
        showMyCameraToggleButton: true,
        showMyMicrophoneToggleButton: true,
        showAudioVideoSettingsButton: true,
        showTextChat: true,
        showUserList: true,
        maxUsers: 50,
        layout: "Grid",
        showLayoutButton: true,
        onJoinRoom: () => {
          console.log('Successfully joined room');
          setIsZegoLoaded(true);
          setError(null);
        },
        onLeaveRoom: () => {
          console.log('Left room');
          setIsZegoLoaded(false);
        },
        onUserJoin: (users) => {
          console.log('User joined:', users);
          // Update participants list
          const participants = users.map(user => ({
            name: user.userName,
            roll: user.userID.includes('ST') ? user.userID : 'HOST'
          }));
          onParticipantsChange(participants);
        },
        onUserLeave: (users) => {
          console.log('User left:', users);
        }
      });
    } catch (error) {
      console.error('Error initializing ZegoCloud:', error);
      setError(`ZegoCloud Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return () => {
      // Cleanup if needed
    };
  }, [meetingId, userName, isHost, onParticipantsChange]);

  return (
    <div className="w-full h-full bg-slate-800 rounded-lg overflow-hidden relative">
      <div 
        ref={meetingRef} 
        className="w-full h-full"
        style={{ minHeight: '500px' }}
      />
      
      {/* Show fallback UI only if ZegoCloud hasn't loaded or there's an error */}
      {(!isZegoLoaded || error) && (
        <div className="absolute inset-0 bg-slate-800 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="bg-slate-700 rounded-lg p-8 mb-4">
              <div className="w-24 h-24 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">
                  {userName.charAt(0).toUpperCase()}
                </span>
              </div>
              <p className="text-white font-medium">{userName}</p>
              <p className="text-slate-400 text-sm">
                {error ? "Connection Failed" : "Connecting..."}
              </p>
            </div>
            <div className="space-y-2">
              {error && (
                <p className="text-red-400 text-sm">
                  {error}
                </p>
              )}
              <p className="text-slate-400 text-sm">
                {error ? "Please check your ZegoCloud credentials" : "Loading video interface..."}
              </p>
              <p className="text-slate-500 text-xs">
                Meeting ID: {meetingId} | Role: {isHost ? 'Host' : 'Participant'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZegoMeetingManager;
