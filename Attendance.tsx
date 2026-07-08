import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { User, UserRole, AttendanceRecord } from '../types';
import { db } from '../services/mockDatabase';
import { Camera, RefreshCw, CheckCircle, XCircle, QrCode } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface AttendanceProps {
  user: User;
  method: 'FACE' | 'QR';
}

export const Attendance: React.FC<AttendanceProps> = ({ user, method }) => {
  const webcamRef = useRef<Webcam>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ success: boolean; msg: string } | null>(null);
  const [scanStep, setScanStep] = useState(0); // 0: Idle, 1: Scanning, 2: Success

  // --- FACE RECOGNITION LOGIC ---
  const capture = React.useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImgSrc(imageSrc);
      processAttendance('FACE');
    }
  }, [webcamRef]);

  // --- GENERIC PROCESSING LOGIC ---
  const processAttendance = async (type: 'FACE' | 'QR') => {
    setProcessing(true);
    setScanStep(1);

    // Simulate AI Latency
    setTimeout(async () => {
      try {
        await db.markAttendance({
          studentId: user.id,
          studentName: user.name,
          date: new Date().toISOString().split('T')[0],
          timestamp: new Date().toISOString(),
          status: 'PRESENT',
          method: type,
          verified: true
        });
        
        setResult({ success: true, msg: `Attendance Marked Successfully via ${type === 'FACE' ? 'Face ID' : 'QR Code'}!` });
        setScanStep(2);
      } catch (e) {
        setResult({ success: false, msg: 'Verification Failed. Please try again.' });
      } finally {
        setProcessing(false);
      }
    }, 2000);
  };

  // --- QR LOGIC ---
  // Simulate QR Scanning (in a real app, use a QR scanner lib reading the video stream)
  useEffect(() => {
    let timer: any;
    if (method === 'QR' && !result) {
      // Simulate "Searching for QR code"
      timer = setTimeout(() => {
        processAttendance('QR');
      }, 3000); 
    }
    return () => clearTimeout(timer);
  }, [method, result]);


  const reset = () => {
    setImgSrc(null);
    setResult(null);
    setScanStep(0);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-800">
          {method === 'FACE' ? 'Face Recognition Attendance' : 'QR Code Attendance'}
        </h2>
        <p className="text-gray-500">
          {method === 'FACE' 
            ? 'Align your face within the frame to mark attendance.' 
            : 'Present your generated QR code to the kiosk scanner.'}
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 relative min-h-[400px] flex flex-col items-center justify-center">
        
        {result ? (
          // RESULT SCREEN
          <div className="text-center p-8 animate-in fade-in zoom-in duration-300">
            {result.success ? (
              <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-4" />
            ) : (
              <XCircle className="w-24 h-24 text-red-500 mx-auto mb-4" />
            )}
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {result.success ? 'Success!' : 'Failed'}
            </h3>
            <p className="text-gray-600 mb-8">{result.msg}</p>
            <button
              onClick={reset}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" /> Mark Another
            </button>
          </div>
        ) : (
          // CAPTURE SCREEN
          <div className="w-full h-full relative">
            {method === 'FACE' ? (
              <>
                {imgSrc ? (
                   <img src={imgSrc} alt="captured" className="w-full h-full object-cover" />
                ) : (
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="w-full h-full object-cover"
                    videoConstraints={{ facingMode: "user" }}
                  />
                )}
                
                {/* Face Overlay */}
                {!imgSrc && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-64 h-64 border-2 border-white/50 rounded-full relative">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                        Align Face
                      </div>
                      {/* Scanning Animation Line */}
                      <div className="absolute top-0 left-0 w-full h-1 bg-green-400/80 shadow-[0_0_15px_rgba(74,222,128,0.8)] animate-[scan_2s_ease-in-out_infinite]"></div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              // QR Display Mode (For Student to show) or Scanner (For Kiosk)
              // Here we simulate the Camera scanning a QR Code
              <div className="relative w-full h-[400px] bg-black flex items-center justify-center">
                 <div className="w-full h-full absolute opacity-30">
                     <img src="https://images.unsplash.com/photo-1555421689-d68471e189f2?auto=format&fit=crop&q=80&w=1000" className="w-full h-full object-cover" alt="bg"/>
                 </div>
                 <div className="z-10 bg-white p-4 rounded-xl shadow-lg">
                    {/* Unique QR for the user */}
                    <QRCodeSVG value={`STUDENT:${user.id}`} size={200} />
                    <p className="text-center mt-2 font-mono text-sm">ID: {user.id}</p>
                 </div>
                 <div className="absolute inset-0 border-4 border-green-500/30 pointer-events-none"></div>
                 <div className="absolute top-1/2 w-full h-1 bg-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-[scan_1.5s_linear_infinite]"></div>
              </div>
            )}

            {/* Controls */}
            {method === 'FACE' && !imgSrc && (
              <div className="absolute bottom-8 left-0 right-0 flex justify-center z-20">
                <button
                  onClick={capture}
                  className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform ring-4 ring-indigo-500/30"
                >
                  <div className="w-12 h-12 bg-indigo-600 rounded-full"></div>
                </button>
              </div>
            )}
            
            {/* Processing Overlay */}
            {processing && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-white">
                <div className="w-16 h-16 border-4 border-t-indigo-500 border-r-indigo-500 border-b-transparent border-l-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-lg font-medium animate-pulse">
                  {method === 'FACE' ? 'Analyzing Biometrics...' : 'Verifying Token...'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
      `}</style>
    </div>
  );
};