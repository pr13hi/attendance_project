
import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, CheckCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';

interface AttendanceSystemProps {
  targetUser: string;
  onVerified: (name: string, roll: string) => void;
  onClose: () => void;
}

const AttendanceSystem: React.FC<AttendanceSystemProps> = ({
  targetUser,
  onVerified,
  onClose
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [countdown, setCountdown] = useState(10);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [faceDetected, setFaceDetected] = useState(false);

  useEffect(() => {
    startCamera();
    
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          handleVerification();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      console.log('🎥 Requesting camera access...');
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 }, 
          height: { ideal: 480 },
          facingMode: 'user'
        },
        audio: false
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
        console.log('✅ Camera started successfully');
        startFaceDetection();
      }
      
      setIsLoading(false);
      setCameraError(null);
    } catch (error) {
      console.error('❌ Camera access error:', error);
      setIsLoading(false);
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setCameraError('Camera permission denied. Please allow camera access and try again.');
        } else if (error.name === 'NotFoundError') {
          setCameraError('No camera found. Please ensure a camera is connected.');
        } else {
          setCameraError(`Camera error: ${error.message}`);
        }
      } else {
        setCameraError('Unknown camera error occurred.');
      }
    }
  };

  const startFaceDetection = () => {
    // Simple face detection simulation
    const detectFaces = () => {
      if (videoRef.current && videoRef.current.readyState === 4) {
        // Simulate face detection - in production, you'd use face-api.js or similar
        const hasVideoFeed = videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0;
        setFaceDetected(hasVideoFeed);
        
        if (canvasRef.current && hasVideoFeed) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          
          if (ctx) {
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            
            // Draw detection rectangle (simulated)
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 3;
            ctx.strokeRect(
              canvas.width * 0.25,
              canvas.height * 0.2,
              canvas.width * 0.5,
              canvas.height * 0.6
            );
            
            // Add label
            ctx.fillStyle = '#10b981';
            ctx.font = '16px Arial';
            ctx.fillText('Face Detected', canvas.width * 0.25, canvas.height * 0.15);
          }
        }
      }
    };

    const interval = setInterval(detectFaces, 500);
    return () => clearInterval(interval);
  };

  const handleVerification = async () => {
    if (!videoRef.current || !stream) {
      setVerificationStatus('failed');
      return;
    }
    
    setIsVerifying(true);
    console.log(`🔍 Starting face verification for ${targetUser}...`);
    
    try {
      // Simulate verification process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, we'll have high success rate if face is detected
      const isVerified = faceDetected && Math.random() > 0.1; // 90% success rate with face
      
      if (isVerified) {
        console.log(`✅ Face verification successful for ${targetUser}`);
        setVerificationStatus('success');
        
        setTimeout(() => {
          // Extract or generate roll number
          const roll = targetUser.includes('ST') 
            ? targetUser 
            : `ST${Math.floor(Math.random() * 999).toString().padStart(3, '0')}`;
          onVerified(targetUser, roll);
        }, 1500);
      } else {
        console.log(`❌ Face verification failed for ${targetUser}`);
        setVerificationStatus('failed');
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error('Face verification error:', error);
      setVerificationStatus('failed');
      setTimeout(() => {
        onClose();
      }, 2000);
    }
    
    setIsVerifying(false);
  };

  const handleRetry = () => {
    setVerificationStatus('pending');
    setCountdown(10);
    setCameraError(null);
    if (!stream) {
      startCamera();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 bg-slate-800 border-slate-600">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center">
              <Camera className="w-6 h-6 mr-2" />
              Face Recognition Attendance
            </div>
            <Badge variant="outline" className="border-blue-500 text-blue-400">
              Target: {targetUser}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full h-80 bg-slate-700 rounded-lg object-cover"
              autoPlay
              muted
              playsInline
            />
            <canvas
              ref={canvasRef}
              className="absolute top-0 left-0 w-full h-full pointer-events-none"
            />
            
            {/* Face Detection Indicator */}
            {!isLoading && !cameraError && (
              <div className="absolute top-4 left-4">
                <Badge 
                  variant={faceDetected ? "default" : "secondary"}
                  className={faceDetected ? "bg-green-600" : "bg-yellow-600"}
                >
                  {faceDetected ? "Face Detected" : "No Face"}
                </Badge>
              </div>
            )}
            
            {isLoading && (
              <div className="absolute inset-0 bg-slate-700 rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p>Initializing camera...</p>
                </div>
              </div>
            )}

            {cameraError && (
              <div className="absolute inset-0 bg-slate-700 rounded-lg flex items-center justify-center">
                <div className="text-center text-white p-4">
                  <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Camera Error</h3>
                  <p className="text-sm text-slate-300 mb-4">{cameraError}</p>
                  <Button onClick={startCamera} variant="outline" size="sm">
                    Retry Camera
                  </Button>
                </div>
              </div>
            )}
            
            {verificationStatus === 'success' && (
              <div className="absolute inset-0 bg-green-600/90 rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <CheckCircle className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold">Attendance Verified!</h3>
                  <p>Welcome, {targetUser}</p>
                </div>
              </div>
            )}
            
            {verificationStatus === 'failed' && (
              <div className="absolute inset-0 bg-red-600/90 rounded-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <XCircle className="w-16 h-16 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold">Verification Failed</h3>
                  <p>Please ensure your face is clearly visible</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-white">
              <p className="text-sm text-slate-400">
                {isVerifying ? 'Analyzing face...' : 
                 cameraError ? 'Camera unavailable' :
                 !faceDetected ? 'Position your face in the frame' :
                 `Auto-verify in ${countdown}s`}
              </p>
              <p className="text-lg font-semibold">
                {verificationStatus === 'success' ? 'Verification Complete!' :
                 verificationStatus === 'failed' ? 'Verification Failed' :
                 isVerifying ? 'Processing...' : 'Ready for verification'}
              </p>
            </div>
            
            <div className="flex space-x-2">
              <Button
                onClick={handleVerification}
                disabled={isLoading || isVerifying || verificationStatus !== 'pending' || !!cameraError}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Now'
                )}
              </Button>
              
              {verificationStatus === 'failed' && (
                <Button
                  onClick={handleRetry}
                  variant="outline"
                  className="border-slate-600 text-white hover:bg-slate-700"
                >
                  Retry
                </Button>
              )}
              
              <Button
                onClick={onClose}
                variant="outline"
                disabled={isVerifying}
                className="border-slate-600 text-white hover:bg-slate-700"
              >
                Cancel
              </Button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-slate-700 p-3 rounded-lg">
            <h4 className="text-white font-medium mb-2">Instructions:</h4>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>• Position your face clearly in the camera frame</li>
              <li>• Ensure good lighting and remove any obstructions</li>
              <li>• Look directly at the camera for best results</li>
              <li>• Verification will start automatically when ready</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceSystem;
