
import React, { useEffect, useRef, useState } from 'react';
import { ZegoUIKitPrebuilt } from '@zegocloud/zego-uikit-prebuilt';

interface ImprovedZegoManagerProps {
  userName: string;
  meetingId: string;
  isHost: boolean;
  onParticipantsChange: (participants: Array<{name: string, roll: string}>) => void;
  onConnectionStatusChange: (status: 'connecting' | 'connected' | 'failed' | 'disconnected') => void;
}

const ImprovedZegoManager: React.FC<ImprovedZegoManagerProps> = ({
  userName,
  meetingId,
  isHost,
  onParticipantsChange,
  onConnectionStatusChange
}) => {
  const meetingRef = useRef<HTMLDivElement>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [currentParticipants, setCurrentParticipants] = useState<Array<{name: string, roll: string}>>([]);
  const MAX_RETRIES = 3;

  const generateRollNumber = (userName: string, isHost: boolean) => {
    if (isHost) {
      return `HOST${Math.floor(Math.random() * 999).toString().padStart(3, '0')}`;
    }
    return userName.includes('ST') ? userName : `ST${Math.floor(Math.random() * 999).toString().padStart(3, '0')}`;
  };

  const initializeZego = async () => {
    if (!meetingRef.current) return;

    // Replace with your actual ZegoCloud credentials
    const appID = 1376605215; // Your App ID
    const serverSecret = "60ed4291e39187fcb2899d33f348c8db"; // Your Server Secret
    
    console.log(`🔄 Attempting ZegoCloud connection (Attempt ${retryCount + 1}/${MAX_RETRIES + 1})`);
    onConnectionStatusChange('connecting');

    try {
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        meetingId,
        Date.now().toString(),
        userName
      );

      const zp = ZegoUIKitPrebuilt.create(kitToken);

      await zp.joinRoom({
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
          console.log('✅ Successfully joined ZegoCloud room');
          onConnectionStatusChange('connected');
          setRetryCount(0);
          
          // Add current user to participants list
          const currentUserRoll = generateRollNumber(userName, isHost);
          const initialParticipants = [{ name: userName, roll: currentUserRoll }];
          setCurrentParticipants(initialParticipants);
          onParticipantsChange(initialParticipants);
        },
        onLeaveRoom: () => {
          console.log('👋 Left ZegoCloud room');
          onConnectionStatusChange('disconnected');
        },
        onUserJoin: (users) => {
          console.log('👤 User joined:', users);
          
          // Update participants list with proper roll numbers
          const updatedParticipants = users.map(user => ({
            name: user.userName,
            roll: generateRollNumber(user.userName, user.userName === userName && isHost)
          }));
          
          setCurrentParticipants(updatedParticipants);
          onParticipantsChange(updatedParticipants);
          
          console.log('📝 Updated participants list:', updatedParticipants);
        },
        onUserLeave: (users) => {
          console.log('👤 User left:', users);
          
          // Update participants list when users leave
          const updatedParticipants = users.map(user => ({
            name: user.userName,
            roll: generateRollNumber(user.userName, user.userName === userName && isHost)
          }));
          
          setCurrentParticipants(updatedParticipants);
          onParticipantsChange(updatedParticipants);
        }
      });
    } catch (error) {
      console.error('❌ ZegoCloud initialization failed:', error);
      onConnectionStatusChange('failed');
      
      if (retryCount < MAX_RETRIES) {
        console.log(`🔄 Retrying in 3 seconds... (${retryCount + 1}/${MAX_RETRIES})`);
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
        }, 3000);
      }
    }
  };

  useEffect(() => {
    initializeZego();
  }, [retryCount]);

  const handleManualRetry = () => {
    setRetryCount(0);
    initializeZego();
  };

  return (
    <div className="w-full h-full relative">
      <div 
        ref={meetingRef} 
        className="w-full h-full bg-slate-800 rounded-lg"
        style={{ minHeight: '500px' }}
      />
      
      {/* Retry button overlay */}
      <div className="absolute top-4 right-4">
        <button
          onClick={handleManualRetry}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
        >
          Retry Connection
        </button>
      </div>
    </div>
  );
};

export default ImprovedZegoManager;
