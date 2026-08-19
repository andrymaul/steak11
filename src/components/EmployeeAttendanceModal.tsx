import React, { useState, useEffect, useRef } from 'react';
import {
  UserCheck,
  X,
  Clock,
  MapPin,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Calendar,
  Sparkles,
  ShieldCheck,
  Camera,
  RefreshCw,
  Upload,
  Image as ImageIcon,
  Eye,
  AlertTriangle,
  Award,
  Send,
  MessageSquare
} from 'lucide-react';
import { Employee, AttendanceRecord, LocationItem } from '../types';
import {
  getStoredEmployees,
  getStoredAttendance,
  saveAttendance,
  getStoredLocations,
  getStoredWaSettings,
  getStoredBranding
} from '../utils';

interface EmployeeAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdmin: () => void;
  initialEmpId?: string;
  initialPin?: string;
}

interface WhatsAppConfirmData {
  type: 'MASUK' | 'PULANG';
  empName: string;
  empRole: string;
  outlet: string;
  date: string;
  time: string;
  statusText: string;
  lateOrEarlyText: string;
  address: string;
  hoursWorked?: number;
  notes: string;
  selfieUrl: string | null;
  waMessage: string;
}

export const EmployeeAttendanceModal: React.FC<EmployeeAttendanceModalProps> = ({
  isOpen,
  onClose,
  onOpenAdmin,
  initialEmpId,
  initialPin,
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);

  // Clock In / Out Form State
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [pin, setPin] = useState('');
  const [selectedOutlet, setSelectedOutlet] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // WhatsApp Confirmation Modal State
  const [waConfirmData, setWaConfirmData] = useState<WhatsAppConfirmData | null>(null);
  const [targetWaPhone, setTargetWaPhone] = useState('');

  // Camera & Watermark Selfie State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedSelfie, setCapturedSelfie] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLocationText, setGpsLocationText] = useState('Mengambil lokasi GPS...');
  const [isLocating, setIsLocating] = useState(false);
  const [previewModalImg, setPreviewModalImg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const handleLocUpdate = () => {
      const locList = getStoredLocations();
      setLocations(locList);
    };

    if (isOpen) {
      const locList = getStoredLocations();
      setLocations(locList);

      const empList = (getStoredEmployees() || []).filter((e) => e.status === 'Aktif');
      setEmployees(empList);

      const cleanInit = initialEmpId ? initialEmpId.trim().toLowerCase() : '';
      const matchedEmp = cleanInit
        ? empList.find(
            (e) =>
              e.id.toLowerCase() === cleanInit ||
              e.name.toLowerCase() === cleanInit ||
              (e.username && e.username.toLowerCase() === cleanInit) ||
              cleanInit.includes(e.name.toLowerCase()) ||
              e.name.toLowerCase().includes(cleanInit)
          )
        : null;

      const targetEmpId = matchedEmp ? matchedEmp.id : (empList.length > 0 ? empList[0].id : '');

      setSelectedEmpId(targetEmpId);

      const activeEmp = matchedEmp || empList.find((e) => e.id === targetEmpId);
      if (activeEmp) {
        setSelectedOutlet(activeEmp.outlet || (locList.length > 0 ? locList[0].name : 'Steak 11, Kalisari'));
      } else if (locList.length > 0) {
        setSelectedOutlet(locList[0].name);
      }

      if (initialPin) {
        setPin(initialPin);
      } else {
        setPin('');
      }

      setAttendance(getStoredAttendance());
      setErrorMsg('');
      setSuccessMsg('');
      setCapturedSelfie(null);
      fetchGpsLocation();
    } else {
      stopCamera();
    }

    window.addEventListener('locations_updated', handleLocUpdate);
    return () => {
      window.removeEventListener('locations_updated', handleLocUpdate);
    };
  }, [isOpen]);

  // Clean up camera on unmount or tab change
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const getOutletAddress = (outletName: string) => {
    if (!outletName) return locations[0]?.address || 'Lokasi Outlet';
    const clean = outletName.trim().toLowerCase();
    const loc = locations.find((l) =>
      l.name.trim().toLowerCase() === clean ||
      clean.includes(l.name.trim().toLowerCase()) ||
      l.name.trim().toLowerCase().includes(clean)
    );
    if (loc && loc.address) {
      return loc.address;
    }
    return `${outletName}`;
  };

  useEffect(() => {
    if (selectedOutlet) {
      fetchGpsLocation();
    }
  }, [selectedOutlet]);

  const fetchGpsLocation = () => {
    setIsLocating(true);
    const defaultAddr = getOutletAddress(selectedOutlet);
    setGpsLocationText('Mengambil alamat lokasi GPS saat presensi...');

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = +position.coords.latitude.toFixed(5);
          const lng = +position.coords.longitude.toFixed(5);
          setCoords({ lat, lng });

          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 6000);
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
              {
                headers: { 'Accept-Language': 'id,en;q=0.9' },
                signal: controller.signal
              }
            );
            clearTimeout(timeoutId);
            if (res.ok) {
              const data = await res.json();
              if (data && data.display_name) {
                const road = data.address?.road || data.address?.suburb || data.address?.city_district || '';
                const city = data.address?.city || data.address?.town || data.address?.county || '';
                const shortAddr = road ? `${road}${city ? ', ' + city : ''}` : data.display_name.split(',').slice(0, 3).join(',');
                setGpsLocationText(`${shortAddr} (${lat}, ${lng})`);
                setIsLocating(false);
                return;
              }
            }
          } catch (err) {
            console.warn('Reverse geocoding fetch error/timeout:', err);
          }

          setGpsLocationText(`${defaultAddr} (GPS: ${lat}, ${lng})`);
          setIsLocating(false);
        },
        (err) => {
          console.warn('Geolocation error:', err);
          setGpsLocationText(defaultAddr);
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setGpsLocationText(defaultAddr);
      setIsLocating(false);
    }
  };

  const startCamera = async () => {
    setErrorMsg('');
    try {
      setIsCameraActive(true);
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
        });
      } catch {
        // Fallback to basic video constraint if facingMode constraint fails on PC/laptop
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setErrorMsg('Kamera tidak terdeteksi atau tidak diizinkan. Silakan pilih tombol "Upload Foto Selfie" sebagai alternatif.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Watermark Renderer on Canvas (Orange & Purple Steak 11 Theme, No Icons, Direct Address)
  const createWatermarkedPhoto = (
    imageSource: HTMLVideoElement | HTMLImageElement,
    empName: string,
    empRole: string,
    outletName: string,
    gpsInfo: string,
    actionType: 'MASUK' | 'PULANG'
  ): string => {
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // 1. Draw base picture
    ctx.drawImage(imageSource, 0, 0, canvas.width, canvas.height);

    // 2. Top Watermark Header (Steak 11 Purple & Orange, No Emojis/Icons, No Border Lines)
    const topGrad = ctx.createLinearGradient(0, 0, 0, 70);
    topGrad.addColorStop(0, 'rgba(37, 8, 56, 0.95)');
    topGrad.addColorStop(1, 'rgba(37, 8, 56, 0)');
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, canvas.width, 70);

    ctx.fillStyle = '#FF8A00'; // Steak 11 Orange
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('STEAK 11 - PRESENSI KARYAWAN', 18, 30);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(`VERIFIED SELFIE RECORD • SHIFT ${actionType}`, 18, 50);

    // 3. Bottom Watermark Panel (Steak 11 Purple & Orange, No Emojis/Icons, No Border Lines)
    const panelHeight = 125;
    const panelY = canvas.height - panelHeight;

    const bottomGrad = ctx.createLinearGradient(0, panelY, 0, canvas.height);
    bottomGrad.addColorStop(0, 'rgba(26, 6, 40, 0.2)');
    bottomGrad.addColorStop(0.3, 'rgba(37, 8, 56, 0.92)');
    bottomGrad.addColorStop(1, 'rgba(37, 8, 56, 0.98)');
    ctx.fillStyle = bottomGrad;
    ctx.fillRect(0, panelY, canvas.width, panelHeight);

    const now = new Date();
    const dateFormatted = now.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const timeFormatted = now.toLocaleTimeString('id-ID', { hour12: false });

    // Text Overlay (No Emojis/Icons)
    ctx.fillStyle = '#FF8A00'; // Steak 11 Orange
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(`${empName.toUpperCase()} (${empRole})`, 18, panelY + 28);

    ctx.fillStyle = '#ffffff';
    ctx.font = '13px sans-serif';
    ctx.fillText(`${outletName}`, 18, panelY + 50);

    ctx.fillStyle = '#f3e8ff';
    ctx.font = '12px sans-serif';
    ctx.fillText(`${dateFormatted} | ${timeFormatted} WIB`, 18, panelY + 72);

    // Address Only (No "Lokasi:")
    const cleanAddress = (gpsInfo || '').replace(/^Lokasi:\s*/i, '');
    ctx.fillStyle = '#ffa000'; // Warm Orange
    ctx.font = '11px sans-serif';
    ctx.fillText(cleanAddress, 18, panelY + 94);

    // Explicitly export camera selfie in Base64 Data URL format (data:image/jpeg;base64,...)
    return canvas.toDataURL('image/jpeg', 0.88);
  };

  const handleTakeSnap = (actionType: 'MASUK' | 'PULANG') => {
    if (!videoRef.current) return;
    if (!currentEmp) return;

    const watermarkedData = createWatermarkedPhoto(
      videoRef.current,
      currentEmp.name,
      currentEmp.role,
      selectedOutlet,
      gpsLocationText,
      actionType
    );

    setCapturedSelfie(watermarkedData);
    stopCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, actionType: 'MASUK' | 'PULANG') => {
    const file = e.target.files?.[0];
    if (!file || !currentEmp) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const watermarkedData = createWatermarkedPhoto(
          img,
          currentEmp.name,
          currentEmp.role,
          selectedOutlet,
          gpsLocationText,
          actionType
        );
        setCapturedSelfie(watermarkedData);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  const currentEmp = employees.find((e) => e.id === selectedEmpId);

  // Match current outlet rules
  const currentOutletObj = locations.find((l) => l.name === selectedOutlet) || locations[0] || {
    name: 'Steak 11, Kalisari',
    startWorkTime: '15:00',
    endWorkTime: '22:00'
  };
  const startWorkTime = currentOutletObj.startWorkTime || '15:00';
  const endWorkTime = currentOutletObj.endWorkTime || '22:00';

  // Check if today employee already clocked in
  const todayRecord = attendance.find(
    (a) =>
      a.date === todayStr &&
      (a.employeeId === selectedEmpId ||
        (currentEmp && (a.employeeName || '').toLowerCase() === currentEmp.name.toLowerCase()))
  );

  // Time Comparison Helper
  const getClockInEvaluation = () => {
    const now = new Date();
    const nowStr = now.toTimeString().split(' ')[0]; // HH:mm:ss
    const [startH, startM] = startWorkTime.split(':').map(Number);
    const [nowH, nowM] = nowStr.split(':').map(Number);

    let startTotal = startH * 60 + startM;
    let nowTotal = nowH * 60 + nowM;

    const lateMin = Math.max(0, nowTotal - startTotal);

    if (lateMin > 0) {
      return {
        clockInStatus: 'Terlambat Masuk' as const,
        status: 'Terlambat' as const,
        lateMinutes: lateMin,
        badgeText: `Terlambat ${lateMin} Menit`,
        badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300'
      };
    } else {
      return {
        clockInStatus: 'Tepat Waktu' as const,
        status: 'Hadir' as const,
        lateMinutes: 0,
        badgeText: 'Hadir Tepat Waktu',
        badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300'
      };
    }
  };

  const getClockOutEvaluation = () => {
    const now = new Date();
    const nowStr = now.toTimeString().split(' ')[0];
    const [startH, startM] = startWorkTime.split(':').map(Number);
    const [endH, endM] = endWorkTime.split(':').map(Number);
    const [nowH, nowM] = nowStr.split(':').map(Number);

    const startTotal = startH * 60 + startM;
    let endTotal = endH * 60 + endM;
    let nowTotal = nowH * 60 + nowM;

    if (endTotal < startTotal) endTotal += 24 * 60; // Overnight shift
    if (nowTotal < startTotal && endTotal >= 24 * 60) nowTotal += 24 * 60;

    const earlyOutMin = Math.max(0, endTotal - nowTotal);

    if (earlyOutMin > 0) {
      return {
        clockOutStatus: 'Pulang Awal' as const,
        earlyOutMinutes: earlyOutMin,
        badgeText: `Pulang Awal ${earlyOutMin} Menit`,
        badgeColor: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300'
      };
    } else {
      return {
        clockOutStatus: 'Pulang Tepat Waktu' as const,
        earlyOutMinutes: 0,
        badgeText: 'Selesai Shift Tepat Waktu',
        badgeColor: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/80 dark:text-blue-300'
      };
    }
  };

  const handleClockIn = () => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!currentEmp) {
      setErrorMsg('Pilih karyawan terlebih dahulu.');
      return;
    }

    if (todayRecord) {
      setErrorMsg(`${currentEmp.name} sudah melakukan Presensi Masuk hari ini pukul ${todayRecord.clockInTime}!`);
      return;
    }

    if (!capturedSelfie) {
      setErrorMsg(`Wajib melampirkan Foto Selfie Watermark kehadiran sebelum klik Presensi Masuk.`);
      return;
    }

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0]; // HH:mm:ss
    const evalResult = getClockInEvaluation();

    const newRecord: AttendanceRecord = {
      id: `ATT-${Date.now()}`,
      employeeId: currentEmp.id,
      employeeName: currentEmp.name,
      date: todayStr,
      clockInTime: timeStr,
      hoursWorked: 0,
      outlet: selectedOutlet,
      status: evalResult.status,
      clockInStatus: evalResult.clockInStatus,
      lateMinutes: evalResult.lateMinutes,
      selfieUrl: capturedSelfie,
      notes: notes || `Presensi Masuk (${evalResult.badgeText})`,
      locationName: gpsLocationText,
      latitude: coords?.lat,
      longitude: coords?.lng
    };

    const updated = [newRecord, ...attendance];
    setAttendance(updated);
    saveAttendance(updated);

    const waText =
      `🥩 *LAPORAN PRESENSI MASUK - STEAK 11*\n` +
      `------------------------------------\n` +
      `👤 *Nama Staff:* ${currentEmp.name} (${currentEmp.role})\n` +
      `🏪 *Outlet Jaga:* ${selectedOutlet}\n` +
      `📅 *Tanggal:* ${todayStr}\n` +
      `⏰ *Jam Masuk:* ${timeStr} WIB\n` +
      `📌 *Status Shift:* ${evalResult.badgeText}\n` +
      `*Alamat:* ${gpsLocationText}\n` +
      `📝 *Catatan:* ${notes || 'Presensi Masuk'}\n\n` +
      `_Terverifikasi via Portal Presensi Digital Steak 11_`;

    setWaConfirmData({
      type: 'MASUK',
      empName: currentEmp.name,
      empRole: currentEmp.role,
      outlet: selectedOutlet,
      date: todayStr,
      time: timeStr,
      statusText: evalResult.status,
      lateOrEarlyText: evalResult.badgeText,
      address: gpsLocationText,
      notes: notes || 'Presensi Masuk',
      selfieUrl: capturedSelfie,
      waMessage: waText
    });

    setSuccessMsg(`Berhasil Presensi Masuk untuk ${currentEmp.name} di ${selectedOutlet} [${evalResult.badgeText}] pukul ${timeStr}! Foto watermark telah disimpan.`);
    setPin('');
    setNotes('');
    setCapturedSelfie(null);
  };

  const handleClockOut = () => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!currentEmp) {
      setErrorMsg('Pilih karyawan terlebih dahulu.');
      return;
    }

    if (!todayRecord) {
      setErrorMsg(`${currentEmp.name} belum Presensi Masuk hari ini! Silakan Presensi Masuk terlebih dahulu.`);
      return;
    }

    if (todayRecord.clockOutTime) {
      setErrorMsg(`${currentEmp.name} sudah melakukan Presensi Pulang hari ini pukul ${todayRecord.clockOutTime}.`);
      return;
    }

    if (!capturedSelfie) {
      setErrorMsg(`Wajib melampirkan Foto Selfie Watermark kepulangan sebelum klik Presensi Pulang.`);
      return;
    }

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const evalResult = getClockOutEvaluation();

    // Calculate hours worked
    const clockInParts = todayRecord.clockInTime.split(':').map(Number);
    const clockOutParts = timeStr.split(':').map(Number);

    const inMinutes = clockInParts[0] * 60 + clockInParts[1];
    const outMinutes = clockOutParts[0] * 60 + clockOutParts[1];
    let diffMinutes = outMinutes - inMinutes;
    if (diffMinutes < 0) diffMinutes += 24 * 60; // Overnight shift

    const hours = +(diffMinutes / 60).toFixed(1);
    const finalHours = hours > 0 ? hours : 8.0;

    const updated = attendance.map((rec) => {
      if (rec.id === todayRecord.id) {
        return {
          ...rec,
          clockOutTime: timeStr,
          clockOutStatus: evalResult.clockOutStatus,
          earlyOutMinutes: evalResult.earlyOutMinutes,
          clockOutSelfieUrl: capturedSelfie,
          hoursWorked: finalHours,
          notes: rec.notes ? `${rec.notes} | Pulang: ${evalResult.badgeText}` : evalResult.badgeText
        };
      }
      return rec;
    });

    setAttendance(updated);
    saveAttendance(updated);

    const waText =
      `🥩 *LAPORAN PRESENSI PULANG - STEAK 11*\n` +
      `------------------------------------\n` +
      `👤 *Nama Staff:* ${currentEmp.name} (${currentEmp.role})\n` +
      `🏪 *Outlet Jaga:* ${selectedOutlet}\n` +
      `📅 *Tanggal:* ${todayStr}\n` +
      `⏰ *Jam Pulang:* ${timeStr} WIB\n` +
      `⏱️ *Total Jam Kerja:* ${finalHours} Jam\n` +
      `📌 *Status Shift:* ${evalResult.badgeText}\n` +
      `*Alamat:* ${gpsLocationText}\n` +
      `📝 *Catatan:* ${todayRecord.notes || 'Presensi Pulang'}\n\n` +
      `_Terverifikasi via Portal Presensi Digital Steak 11_`;

    setWaConfirmData({
      type: 'PULANG',
      empName: currentEmp.name,
      empRole: currentEmp.role,
      outlet: selectedOutlet,
      date: todayStr,
      time: timeStr,
      statusText: 'Hadir',
      lateOrEarlyText: evalResult.badgeText,
      address: gpsLocationText,
      hoursWorked: finalHours,
      notes: todayRecord.notes || 'Presensi Pulang',
      selfieUrl: capturedSelfie,
      waMessage: waText
    });

    setSuccessMsg(`Berhasil Presensi Pulang untuk ${currentEmp.name}! [${evalResult.badgeText}] Total durasi kerja: ${finalHours} Jam.`);
    setPin('');
    setCapturedSelfie(null);
  };

  const handleSendWaMessage = () => {
    if (!waConfirmData) return;
    let targetPhone = (targetWaPhone || '').replace(/\D/g, '');
    if (!targetPhone) {
      const waSettings = getStoredWaSettings();
      const branding = getStoredBranding();
      targetPhone = (waSettings.targetWaNumber || branding.mainWhatsapp || '6281223233299').replace(/\D/g, '');
    }
    if (targetPhone.startsWith('0')) {
      targetPhone = '62' + targetPhone.slice(1);
    }
    const encodedMsg = encodeURIComponent(waConfirmData.waMessage);

    fetch('/api/wa/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: targetPhone, message: waConfirmData.waMessage })
    }).catch(() => {});

    window.open(`https://wa.me/${targetPhone}?text=${encodedMsg}`, '_blank');
    setWaConfirmData(null);
  };

  const todayRecords = (attendance || []).filter((a) => a.date === todayStr);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-purple-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white dark:bg-[#180C25] text-slate-800 dark:text-slate-100 rounded-2xl overflow-hidden shadow-2xl border border-purple-900/50 p-5 sm:p-6 space-y-6 my-auto">
        
        {/* Canvas Hidden for rendering watermark */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-purple-900/50 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-purple-950 font-extrabold flex items-center justify-center shadow-xs">
              <UserCheck className="w-6 h-6 text-purple-950" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg sm:text-xl font-baloo text-[#3D1259] dark:text-amber-400">
                Portal Absensi Digital Staff Steak 11
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <span>Hari ini: {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-purple-900/50 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main Form Section */}
        <div className="bg-amber-50/70 dark:bg-purple-950/40 p-4 sm:p-5 rounded-xl border border-amber-200/80 dark:border-purple-900/50 space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h4 className="font-bold text-sm text-[#3D1259] dark:text-amber-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-500" /> Presensi Digital Selfie & Shift Tracking
            </h4>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-purple-900 dark:text-amber-300 bg-amber-200/80 dark:bg-purple-900 px-3 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Watermark Otentik (Base64 JPEG)
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-100 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Employee & Outlet Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Pilih Karyawan:
              </label>
              <select
                value={selectedEmpId}
                onChange={(e) => {
                  setSelectedEmpId(e.target.value);
                  const emp = employees.find((empItem) => empItem.id === e.target.value);
                  if (emp) setSelectedOutlet(emp.outlet || (locations.length > 0 ? locations[0].name : 'Steak 11, Kalisari'));
                }}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-purple-800 bg-white dark:bg-[#12071B] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {(employees || []).map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name} ({e.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Outlet Jaga:
              </label>
              <select
                value={selectedOutlet}
                onChange={(e) => setSelectedOutlet(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 dark:border-purple-800 bg-white dark:bg-[#12071B] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {(locations || []).map((loc) => (
                  <option key={loc.id} value={loc.name}>
                    {loc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Shift Rules & Realtime Evaluation Info Card */}
          <div className="p-3.5 rounded-xl bg-purple-900/10 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 flex items-start justify-between flex-wrap gap-3">
            <div className="space-y-1">
              <div className="text-xs font-bold text-[#3D1259] dark:text-amber-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" /> Aturan Shift Outlet ({selectedOutlet}):
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-3">
                <span>🟢 Batas Jam Masuk: <strong className="text-emerald-700 dark:text-emerald-400 font-extrabold">{startWorkTime} WIB</strong></span>
                <span>🔴 Batas Jam Pulang: <strong className="text-rose-700 dark:text-rose-400 font-extrabold">{endWorkTime} WIB</strong></span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!todayRecord ? (
                <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border ${getClockInEvaluation().badgeColor}`}>
                  Status Masuk: {getClockInEvaluation().badgeText}
                </span>
              ) : !todayRecord.clockOutTime ? (
                <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border ${getClockOutEvaluation().badgeColor}`}>
                  Status Pulang: {getClockOutEvaluation().badgeText}
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-emerald-200 text-emerald-900 border border-emerald-400">
                  Shift Hari Ini Selesai
                </span>
              )}
            </div>
          </div>

          {/* Selfie Camera with Watermark Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-amber-300 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-amber-500" /> Foto Selfie Kehadiran (Watermark Steak 11 + GPS + Waktu):
              </label>

              <button
                type="button"
                onClick={fetchGpsLocation}
                disabled={isLocating}
                className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <MapPin className="w-3 h-3 text-emerald-500" /> {isLocating ? 'Mencari GPS...' : 'Update GPS'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              {/* Camera Stream / Captured Photo Preview */}
              <div className="relative aspect-4/3 bg-slate-900 rounded-xl overflow-hidden border-2 border-dashed border-amber-400/50 flex flex-col items-center justify-center text-center p-2 group shadow-inner">
                {capturedSelfie ? (
                  <div className="relative w-full h-full">
                    <img
                      src={capturedSelfie}
                      alt="Watermarked Selfie"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute top-2 right-2 flex gap-1">
                      <button
                        type="button"
                        onClick={() => setPreviewModalImg(capturedSelfie)}
                        className="px-2 py-1 bg-black/70 hover:bg-black text-amber-300 text-[10px] font-bold rounded-md flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3 h-3" /> Zoom
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setCapturedSelfie(null);
                          startCamera();
                        }}
                        className="px-2 py-1 bg-red-600/90 hover:bg-red-600 text-white text-[10px] font-bold rounded-md flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" /> Ulang
                      </button>
                    </div>
                  </div>
                ) : isCameraActive ? (
                  <div className="relative w-full h-full">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2 px-2">
                      <button
                        type="button"
                        onClick={() => handleTakeSnap(!todayRecord ? 'MASUK' : 'PULANG')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-full shadow-lg flex items-center gap-1.5 cursor-pointer"
                      >
                        <Camera className="w-4 h-4" /> Ambil Foto & Tambah Watermark
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-3 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs rounded-full font-bold cursor-pointer"
                      >
                        Batal
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 p-4 text-slate-300">
                    <div className="w-12 h-12 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-400 flex items-center justify-center mx-auto">
                      <Camera className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-semibold text-slate-200">
                      Belum ada foto selfie kehadiran
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Sistem akan menyematkan watermark Logo Steak 11, waktu, outlet & titik GPS secara otomatis.
                    </p>
                  </div>
                )}
              </div>

              {/* Camera Trigger & Upload Controls */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={startCamera}
                  disabled={isCameraActive}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#3D1259] text-amber-300 hover:bg-purple-900 font-extrabold text-xs border border-amber-400/30 flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span>Buka Kamera Selfie HP / Laptop</span>
                </button>

                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={(e) => handleFileUpload(e, !todayRecord ? 'MASUK' : 'PULANG')}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="w-full py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-purple-900/40 text-slate-700 dark:text-slate-200 hover:bg-slate-200 font-bold text-xs border border-slate-300 dark:border-purple-800 flex items-center justify-center gap-2 cursor-pointer">
                    <Upload className="w-4 h-4 text-amber-500" />
                    <span>Upload Foto dari Galeri (Dengan Auto-Watermark)</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-amber-100/60 dark:bg-amber-950/30 text-[10px] text-amber-900 dark:text-amber-300 border border-amber-300/60 space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-amber-600" /> Informasi Watermark Otomatis:
                  </div>
                  <div>• Label: STEAK 11 - PRESENSI STAFF</div>
                  <div>• Alamat: {gpsLocationText}</div>
                  <div>• Waktu: Real-time Jam & Tanggal Presisi</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleClockIn}
              disabled={!!todayRecord}
              className={`py-3.5 rounded-xl font-extrabold text-xs shadow-xs transition-all flex items-center justify-center gap-2 ${
                todayRecord
                  ? 'bg-slate-200 dark:bg-purple-900/30 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md cursor-pointer'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>1. Presensi Masuk (Clock In + Selfie)</span>
            </button>

            <button
              onClick={handleClockOut}
              disabled={!todayRecord || !!todayRecord?.clockOutTime}
              className={`py-3.5 rounded-xl font-extrabold text-xs shadow-xs transition-all flex items-center justify-center gap-2 ${
                !todayRecord || todayRecord?.clockOutTime
                  ? 'bg-slate-200 dark:bg-purple-900/30 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                  : 'bg-amber-400 text-purple-950 hover:bg-amber-300 shadow-md cursor-pointer'
              }`}
            >
              <LogOut className="w-4 h-4" />
              <span>2. Presensi Pulang (Clock Out + Selfie)</span>
            </button>
          </div>
        </div>

        {/* Live Attendance Board for Today */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs sm:text-sm text-[#3D1259] dark:text-amber-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Log Presensi & Watermark Selfie Hari Ini ({todayRecords.length})
            </h4>
            <button
              onClick={() => {
                stopCamera();
                onClose();
                onOpenAdmin();
              }}
              className="text-[11px] font-bold text-purple-700 dark:text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-amber-500" /> Kelola Shift & Laporan Penggajian Admin →
            </button>
          </div>

          <div className="border border-slate-200 dark:border-purple-900/50 rounded-xl overflow-hidden bg-white dark:bg-[#12071B] max-h-56 overflow-y-auto">
            {todayRecords.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                Belum ada karyawan yang melakukan absensi masuk hari ini.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-purple-900/30">
                {todayRecords.map((rec, idx) => (
                  <div key={`${rec.id}-${idx}`} className="p-3 text-xs flex items-center justify-between flex-wrap gap-2 hover:bg-amber-50/50 dark:hover:bg-purple-950/30">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        {rec.selfieUrl && (
                          <div
                            onClick={() => setPreviewModalImg(rec.selfieUrl || null)}
                            className="w-10 h-10 rounded-lg overflow-hidden border border-emerald-500 cursor-pointer hover:scale-105 transition-transform relative group shadow-xs"
                            title="Foto Selfie Masuk"
                          >
                            <img src={rec.selfieUrl} alt="Selfie Masuk" className="w-full h-full object-cover" />
                            <div className="absolute inset-x-0 bottom-0 bg-black/60 text-emerald-300 text-[7px] font-black text-center">
                              MASUK
                            </div>
                          </div>
                        )}
                        {rec.clockOutSelfieUrl && (
                          <div
                            onClick={() => setPreviewModalImg(rec.clockOutSelfieUrl || null)}
                            className="w-10 h-10 rounded-lg overflow-hidden border border-amber-400 cursor-pointer hover:scale-105 transition-transform relative group shadow-xs"
                            title="Foto Selfie Pulang"
                          >
                            <img src={rec.clockOutSelfieUrl} alt="Selfie Pulang" className="w-full h-full object-cover" />
                            <div className="absolute inset-x-0 bottom-0 bg-black/60 text-amber-300 text-[7px] font-black text-center">
                              PULANG
                            </div>
                          </div>
                        )}
                        {!rec.selfieUrl && !rec.clockOutSelfieUrl && (
                          <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-900 dark:text-amber-300 font-bold flex items-center justify-center text-xs">
                            {rec.employeeName.charAt(0)}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                          <span>{rec.employeeName}</span>
                          {rec.clockInStatus === 'Terlambat Masuk' ? (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-extrabold border border-amber-300">
                              Terlambat {rec.lateMinutes || 0}m
                            </span>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold border border-emerald-300">
                              Tepat Waktu
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-amber-500" /> {rec.outlet} • {rec.notes || 'Hadir'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          Masuk: {rec.clockInTime}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Pulang: {rec.clockOutTime ? rec.clockOutTime : 'Sedang Bertugas'}
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        rec.status === 'Hadir'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300'
                      }`}>
                        {rec.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Enlarge Watermark Selfie Preview */}
        {previewModalImg && (
          <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="relative max-w-lg w-full bg-[#12071B] rounded-2xl p-4 border border-amber-400/50 space-y-3">
              <div className="flex items-center justify-between border-b border-purple-900 pb-2">
                <h4 className="font-bold text-sm text-amber-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Verifikasi Foto Watermark Steak 11
                </h4>
                <button
                  type="button"
                  onClick={() => setPreviewModalImg(null)}
                  className="w-7 h-7 rounded-full bg-purple-900 text-amber-300 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <img
                src={previewModalImg}
                alt="Watermarked Selfie Full"
                className="w-full rounded-xl border border-purple-800 shadow-2xl"
              />
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setPreviewModalImg(null)}
                  className="px-5 py-2 bg-amber-400 text-purple-950 font-extrabold text-xs rounded-full hover:bg-amber-300 cursor-pointer"
                >
                  Tutup Pratinjau
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Bukti Presensi & Konfirmasi WA (Scrollable, Structured Fields) */}
        {waConfirmData && (
          <div className="fixed inset-0 z-60 bg-purple-950/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="relative max-w-md w-full bg-white dark:bg-[#180C25] text-slate-800 dark:text-slate-100 rounded-2xl p-5 sm:p-6 border-2 border-amber-400/80 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in duration-200">
              
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-purple-900/50 pb-3">
                <h3 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-emerald-500" />
                  Bukti Presensi & Konfirmasi WA
                </h3>
                <button
                  type="button"
                  onClick={() => setWaConfirmData(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold text-sm cursor-pointer p-1"
                >
                  ✕
                </button>
              </div>

              <div className="text-center space-y-1">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                  Data Presensi {waConfirmData.type} Berhasil Disimpan!
                </h4>
              </div>

              {/* Foto Selfie Watermark Preview */}
              {waConfirmData.selfieUrl && (
                <div className="rounded-xl overflow-hidden border-2 border-amber-400/80 shadow-sm">
                  <img
                    src={waConfirmData.selfieUrl}
                    alt="Bukti Selfie Watermark"
                    className="w-full max-h-48 object-cover"
                  />
                </div>
              )}

              {/* Structured Attendance Details */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 dark:bg-purple-950/60 border border-amber-400/40 dark:border-purple-800/80 space-y-2.5 text-xs">
                <div className="grid grid-cols-2 gap-2 pb-2 border-b border-amber-300/40 dark:border-purple-800">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Tipe Presensi</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 uppercase">{waConfirmData.type}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Status Shift</span>
                    <span className="font-bold text-purple-900 dark:text-amber-300">{waConfirmData.lateOrEarlyText || waConfirmData.statusText}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pb-2 border-b border-amber-300/40 dark:border-purple-800">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Nama Karyawan</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">{waConfirmData.empName} ({waConfirmData.empRole})</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Lokasi Outlet</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">{waConfirmData.outlet}</span>
                  </div>
                </div>

                <div className="pb-2 border-b border-amber-300/40 dark:border-purple-800">
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Tanggal & Waktu</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{waConfirmData.date} | {waConfirmData.time} WIB</span>
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[10px] uppercase font-bold">Alamat Outlet</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 leading-snug">{waConfirmData.address}</span>
                </div>
              </div>

              {/* Target WhatsApp Phone Input (Optional) */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>Nomor WhatsApp Tujuan (Opsional):</span>
                  <span className="text-[10px] text-slate-400 font-normal">Kosongkan jika default</span>
                </label>
                <input
                  type="text"
                  value={targetWaPhone}
                  onChange={(e) => setTargetWaPhone(e.target.value)}
                  placeholder="Contoh: 081223233299"
                  className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 dark:border-purple-800 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-amber-300 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={handleSendWaMessage}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Kirim Bukti Presensi ke WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWaConfirmData(null)}
                  className="w-full py-2 rounded-xl bg-slate-100 dark:bg-purple-900/40 text-slate-700 dark:text-slate-300 hover:bg-slate-200 font-bold text-xs cursor-pointer"
                >
                  Selesai / Tutup
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
