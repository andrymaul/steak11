import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  RefreshCw,
  Upload,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  LogOut,
  Send,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  UserCheck,
  AlertTriangle,
  Eye,
  Image as ImageIcon,
  Calendar,
  Search,
  Download,
  Trash2,
  Filter,
  FileSpreadsheet
} from 'lucide-react';
import { Employee, AttendanceRecord, LocationItem } from '../types';
import {
  getStoredEmployees,
  getStoredAttendance,
  saveAttendance,
  getStoredLocations,
  getStoredWaSettings,
  getStoredBranding,
  getLocalDateStr
} from '../utils';
import { pullAttendanceFromFirestore, subscribeToAttendance } from '../lib/firebaseServices';

interface PresensiKameraManagerProps {
  showToast?: (msg: string) => void;
  currentUser?: { name: string; role: string; allowedTabs?: string[] } | null;
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

export const PresensiKameraManager: React.FC<PresensiKameraManagerProps> = ({
  showToast,
  currentUser,
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);

  // Form State
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [pin, setPin] = useState('');
  const [selectedOutlet, setSelectedOutlet] = useState('');
  const [notes, setNotes] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // WhatsApp Confirm Modal
  const [waConfirmData, setWaConfirmData] = useState<WhatsAppConfirmData | null>(null);
  const [targetWaPhone, setTargetWaPhone] = useState('');

  // Camera State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedSelfie, setCapturedSelfie] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLocationText, setGpsLocationText] = useState('Mengambil lokasi GPS...');
  const [isLocating, setIsLocating] = useState(false);
  const [previewModalImg, setPreviewModalImg] = useState<string | null>(null);



  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const todayStr = getLocalDateStr();

  useEffect(() => {
    const handleAttUpdated = () => {
      setAttendance(getStoredAttendance());
    };
    window.addEventListener('attendance_updated', handleAttUpdated);

    const locList = getStoredLocations();
    setLocations(locList);

    let empList = (getStoredEmployees() || []).filter((e) => e.status === 'Aktif');

    // Robust matching function
    const findMatchedEmployee = (targetName?: string) => {
      if (!targetName) return undefined;
      const clean = targetName.trim().toLowerCase();
      return empList.find((e) =>
        e.name.toLowerCase() === clean ||
        (e.username && e.username.toLowerCase() === clean) ||
        e.id.toLowerCase() === clean ||
        clean.includes(e.name.toLowerCase()) ||
        e.name.toLowerCase().includes(clean)
      );
    };

    let defaultEmp = findMatchedEmployee(currentUser?.name);

    setEmployees(empList);

    if (!defaultEmp && empList.length > 0) {
      defaultEmp = empList[0];
    }

    if (defaultEmp) {
      setSelectedEmpId(defaultEmp.id);
      setSelectedOutlet(defaultEmp.outlet || (locList[0]?.name || 'Steak 11, Kalisari'));
      setPin(defaultEmp.pin || '');
    } else if (locList.length > 0) {
      setSelectedOutlet(locList[0].name);
    }

    setAttendance(getStoredAttendance());
    fetchGpsLocation();

    // Realtime attendance sync with Cloud Firestore
    const unsubAtt = subscribeToAttendance((liveRecords) => {
      if (liveRecords && Array.isArray(liveRecords)) {
        setAttendance(liveRecords);
      }
    });

    pullAttendanceFromFirestore().then((records) => {
      if (records && records.length > 0) {
        setAttendance(records);
      }
    }).catch(() => {});

    return () => {
      if (unsubAtt) unsubAtt();
      window.removeEventListener('attendance_updated', handleAttUpdated);
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

  // Watermark Renderer on Canvas (Template A: Executive Glass Card)
  const createWatermarkedPhoto = (
    imageSource: HTMLVideoElement | HTMLImageElement,
    empName: string,
    empRole: string,
    outletName: string,
    gpsInfo: string,
    actionType: 'MASUK' | 'PULANG'
  ): string => {
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = 480;
    canvas.height = 360;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // 1. Draw base selfie photo
    ctx.drawImage(imageSource, 0, 0, canvas.width, canvas.height);

    // Rounded rectangle path helper
    const drawRoundedRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    };

    // 2. Top-Right Verified Executive Badge
    const badgeW = 180;
    const badgeH = 26;
    const badgeX = canvas.width - badgeW - 10;
    const badgeY = 10;

    drawRoundedRect(badgeX, badgeY, badgeW, badgeH, 6);
    ctx.fillStyle = 'rgba(20, 7, 34, 0.88)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 184, 0, 0.6)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#FFB800'; // Gold Accent
    ctx.font = 'bold 9.5px sans-serif';
    ctx.fillText('STEAK 11 • PRESENSI VERIFIED', badgeX + 10, badgeY + 17);

    // 3. Bottom Executive Glass Card Panel
    const cardMarginHorizontal = 10;
    const cardMarginBottom = 10;
    const cardH = 92;
    const cardW = canvas.width - cardMarginHorizontal * 2;
    const cardX = cardMarginHorizontal;
    const cardY = canvas.height - cardH - cardMarginBottom;
    const cardRadius = 10;

    // Glass Background Fill with Gradient
    drawRoundedRect(cardX, cardY, cardW, cardH, cardRadius);
    const glassGrad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
    glassGrad.addColorStop(0, 'rgba(15, 5, 26, 0.90)');
    glassGrad.addColorStop(0.5, 'rgba(26, 8, 44, 0.94)');
    glassGrad.addColorStop(1, 'rgba(15, 5, 26, 0.96)');
    ctx.fillStyle = glassGrad;
    ctx.fill();

    // Subtle Glass Border
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Left Gold Accent Bar
    drawRoundedRect(cardX, cardY, 5, cardH, 2.5);
    ctx.fillStyle = '#FFB800'; // Gold Accent Bar
    ctx.fill();

    // Action Badge Tag (SHIFT MASUK vs SHIFT PULANG)
    const tagW = 90;
    const tagH = 18;
    const tagX = cardX + cardW - tagW - 10;
    const tagY = cardY + 8;
    drawRoundedRect(tagX, tagY, tagW, tagH, 5);
    ctx.fillStyle = actionType === 'MASUK' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)';
    ctx.fill();
    ctx.strokeStyle = actionType === 'MASUK' ? '#10B981' : '#F59E0B';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = actionType === 'MASUK' ? '#34D399' : '#FBBF24';
    ctx.font = 'bold 9px sans-serif';
    ctx.fillText(`SHIFT ${actionType}`, tagX + 12, tagY + 12);

    // Text Content Inside Executive Glass Card
    const now = new Date();
    const dateFormatted = now.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    const timeFormatted = now.toLocaleTimeString('id-ID', { hour12: false });

    const textLeftMargin = cardX + 14;

    // Line 1: Employee Name & Role
    ctx.fillStyle = '#FFB800'; // Gold accent
    ctx.font = 'bold 12.5px sans-serif';
    ctx.fillText(`${empName.toUpperCase()} • ${empRole}`, textLeftMargin, cardY + 22);

    // Line 2: Outlet Name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(`${outletName}`, textLeftMargin, cardY + 39);

    // Line 3: Timestamp Emerald Monospace
    ctx.fillStyle = '#34D399'; // Emerald Neon
    ctx.font = 'bold 10px monospace';
    ctx.fillText(`🕒 ${dateFormatted} | ${timeFormatted} WIB`, textLeftMargin, cardY + 56);

    // Line 4: Clean GPS Location Address
    const cleanAddress = (gpsInfo || '').replace(/^Lokasi:\s*/i, '');
    ctx.fillStyle = '#E9D5FF'; // Light Lavender
    ctx.font = '9.5px sans-serif';
    ctx.fillText(`📍 ${cleanAddress.slice(0, 75)}`, textLeftMargin, cardY + 73);

    // Lightweight Base64 Data URL (~25KB)
    return canvas.toDataURL('image/jpeg', 0.65);
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
    if (showToast) showToast(`📷 Foto selfie watermark berhasil diambil (${actionType})`);
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
        if (showToast) showToast('📷 Foto selfie berhasil diunggah & dikompres otomatis (< 1MB)');
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const isReadOnlyVisitor = currentUser?.role === 'Pengunjung' || currentUser?.role?.toLowerCase().includes('pengunjung');
  const checkReadOnlyPermission = (): boolean => {
    if (isReadOnlyVisitor) {
      if (showToast) showToast('🔒 Akses Read-Only: Mode Pengunjung hanya dapat melihat data (tindakan ubah/hapus dibatasi).');
      return true;
    }
    return false;
  };

  const currentEmp = employees.find((e) => e.id === selectedEmpId);

  const currentOutletObj = locations.find((l) => l.name === selectedOutlet) || locations[0] || {
    name: 'Steak 11, Kalisari',
    startWorkTime: '15:00',
    endWorkTime: '22:00'
  };
  const startWorkTime = currentOutletObj.startWorkTime || '15:00';
  const endWorkTime = currentOutletObj.endWorkTime || '22:00';

  const todayRecord = attendance.find(
    (a) =>
      a.date === todayStr &&
      (a.employeeId === selectedEmpId ||
        (currentEmp && (a.employeeName || '').toLowerCase() === currentEmp.name.toLowerCase()))
  );

  const getClockInEvaluation = () => {
    const now = new Date();
    const nowStr = now.toTimeString().split(' ')[0];
    const [startH, startM] = startWorkTime.split(':').map(Number);
    const [nowH, nowM] = nowStr.split(':').map(Number);

    const startTotal = startH * 60 + startM;
    const nowTotal = nowH * 60 + nowM;

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

  const handleSubmitClockIn = () => {
    setErrorMsg('');
    if (checkReadOnlyPermission()) return;
    if (!selectedEmpId || !currentEmp) {
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
    const timeStr = now.toTimeString().split(' ')[0];
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
      notes: notes || 'Masuk via Presensi Kamera',
      locationName: gpsLocationText,
      selfieUrl: capturedSelfie,
      latitude: coords?.lat,
      longitude: coords?.lng,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const currentStored = getStoredAttendance();
    const updated = [newRecord, ...currentStored.filter((r) => r.id !== newRecord.id)];
    setAttendance(updated);
    saveAttendance(updated);

    const waSettings = getStoredWaSettings();
    const defaultAttendanceTpl = `*PRESENSI NOTIFIKASI {TIPE} STAFF STEAK 11*\n---------------------------\n*Karyawan:* {NAMA} ({ROLE})\n*Outlet:* {OUTLET}\n*Tanggal:* {TANGGAL}\n*Jam:* {WAKTU} WIB\n*Evaluasi:* {EVALUASI}\n*Alamat:* {LOKASI}\n*Catatan:* {CATATAN}\n---------------------------\n_Terverifikasi Sistem Presensi Kamera Steak 11_`;
    const attendanceTpl = waSettings.templateAttendance || defaultAttendanceTpl;

    const waMsg = attendanceTpl
      .replace(/{TIPE}/g, 'MASUK')
      .replace(/{NAMA}/g, currentEmp.name)
      .replace(/{ROLE}/g, currentEmp.role)
      .replace(/{OUTLET}/g, selectedOutlet)
      .replace(/{TANGGAL}/g, todayStr)
      .replace(/{WAKTU}/g, timeStr)
      .replace(/{EVALUASI}/g, evalResult.badgeText)
      .replace(/{LOKASI}/g, gpsLocationText)
      .replace(/{CATATAN}/g, notes || '-');

    setWaConfirmData({
      type: 'MASUK',
      empName: currentEmp.name,
      empRole: currentEmp.role,
      outlet: selectedOutlet,
      date: todayStr,
      time: timeStr,
      statusText: evalResult.clockInStatus,
      lateOrEarlyText: evalResult.badgeText,
      address: gpsLocationText,
      notes: notes || '-',
      selfieUrl: capturedSelfie,
      waMessage: waMsg
    });

    setSuccessMsg(`Berhasil Presensi Masuk untuk ${currentEmp.name} pukul ${timeStr} WIB (${evalResult.badgeText})!`);
    setCapturedSelfie(null);
    setNotes('');
    if (showToast) showToast('✅ Presensi Masuk berhasil dicatat!');
  };

  const handleClockOut = () => {
    setErrorMsg('');
    setSuccessMsg('');

    if (!currentEmp) {
      setErrorMsg('Pilih karyawan terlebih dahulu.');
      return;
    }

    if (!todayRecord) {
      setErrorMsg(`${currentEmp.name} belum melakukan Presensi Masuk hari ini. Harus Presensi Masuk dulu.`);
      return;
    }

    if (todayRecord.clockOutTime) {
      setErrorMsg(`${currentEmp.name} sudah Presensi Pulang hari ini pukul ${todayRecord.clockOutTime}!`);
      return;
    }

    if (!capturedSelfie) {
      setErrorMsg(`Wajib melampirkan Foto Selfie Watermark kepulangan sebelum klik Presensi Pulang.`);
      return;
    }

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    const [inH, inM] = todayRecord.clockInTime.split(':').map(Number);
    const [outH, outM] = timeStr.split(':').map(Number);

    const inTotal = inH * 60 + inM;
    const outTotal = outH * 60 + outM;

    let diffMinutes = outTotal - inTotal;
    if (diffMinutes < 0) diffMinutes += 24 * 60;
    const hours = +(diffMinutes / 60).toFixed(1);

    const evalResult = getClockOutEvaluation();
    const currentStored = getStoredAttendance();
    const updated = currentStored.map((rec) => {
      if (rec.id === todayRecord.id) {
        return {
          ...rec,
          clockOutTime: timeStr,
          hoursWorked: hours,
          clockOutStatus: evalResult.clockOutStatus,
          earlyOutMinutes: evalResult.earlyOutMinutes,
          clockOutSelfieUrl: capturedSelfie,
          notes: notes ? `${rec.notes} | Pulang: ${notes}` : rec.notes,
          updatedAt: new Date().toISOString()
        };
      }
      return rec;
    });

    setAttendance(updated);
    saveAttendance(updated);

    const waSettings = getStoredWaSettings();
    const defaultAttendanceTpl = `*PRESENSI NOTIFIKASI {TIPE} STAFF STEAK 11*\n---------------------------\n*Karyawan:* {NAMA} ({ROLE})\n*Outlet:* {OUTLET}\n*Tanggal:* {TANGGAL}\n*Jam:* {WAKTU} WIB\n*Evaluasi:* {EVALUASI}\n*Alamat:* {LOKASI}\n*Catatan:* {CATATAN}\n---------------------------\n_Terverifikasi Sistem Presensi Kamera Steak 11_`;
    const attendanceTpl = waSettings.templateAttendance || defaultAttendanceTpl;

    const waMsg = attendanceTpl
      .replace(/{TIPE}/g, 'PULANG')
      .replace(/{NAMA}/g, currentEmp.name)
      .replace(/{ROLE}/g, currentEmp.role)
      .replace(/{OUTLET}/g, selectedOutlet)
      .replace(/{TANGGAL}/g, todayStr)
      .replace(/{WAKTU}/g, `${timeStr} (Total: ${hours} Jam)`)
      .replace(/{EVALUASI}/g, evalResult.badgeText)
      .replace(/{LOKASI}/g, gpsLocationText)
      .replace(/{CATATAN}/g, notes || '-');

    setWaConfirmData({
      type: 'PULANG',
      empName: currentEmp.name,
      empRole: currentEmp.role,
      outlet: selectedOutlet,
      date: todayStr,
      time: timeStr,
      statusText: evalResult.clockOutStatus,
      lateOrEarlyText: evalResult.badgeText,
      address: gpsLocationText,
      hoursWorked: hours,
      notes: notes || '-',
      selfieUrl: capturedSelfie,
      waMessage: waMsg
    });

    setSuccessMsg(`Berhasil Absen Pulang untuk ${currentEmp.name} pukul ${timeStr} WIB (Durasi: ${hours} Jam)!`);
    setCapturedSelfie(null);
    setNotes('');
    if (showToast) showToast('✅ Absen Pulang berhasil dicatat!');
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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#1f0e30] p-6 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-[11px] flex items-center gap-1">
              <Camera className="w-3.5 h-3.5" /> CAMERA SELFIE SYSTEM
            </span>
            <span className="text-xs text-slate-400 font-bold">
              ID: {currentEmp ? currentEmp.id : '-'}
            </span>
          </div>
          <h2 className="font-extrabold text-xl text-[#3D1259] dark:text-amber-400 font-baloo flex items-center gap-2">
            Presensi Kamera Selfie & Lokasi GPS Watermark
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Lakukan Presensi Masuk dan Presensi Pulang dengan bukti foto selfie terverifikasi jam & alamat outlet secara otomatis.
          </p>
        </div>

        <button
          onClick={fetchGpsLocation}
          className="px-4 py-2.5 rounded-xl bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-amber-300 hover:bg-purple-200 dark:hover:bg-purple-900 font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer border border-purple-200 dark:border-purple-800 shrink-0"
        >
          <MapPin className="w-4 h-4 text-amber-500" />
          <span>{isLocating ? 'Memuat GPS...' : 'Refresh Lokasi GPS'}</span>
        </button>
      </div>

      {/* Main Grid: Form Left, Camera Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Employee Selection & Controls (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#1f0e30] p-6 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm space-y-5">
          <h3 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo flex items-center gap-2 border-b border-slate-100 dark:border-purple-900/50 pb-3">
            <UserCheck className="w-5 h-5 text-emerald-500" /> Data Karyawan & Aturan Shift
          </h3>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Employee Selection / Locked Display */}
          {(() => {
            const cleanUser = (currentUser?.name || '').trim().toLowerCase();
            const loggedInEmp = employees.find(
              (e) =>
                cleanUser && (
                  e.name.toLowerCase() === cleanUser ||
                  (e.username && e.username.toLowerCase() === cleanUser) ||
                  e.id.toLowerCase() === cleanUser ||
                  cleanUser.includes(e.name.toLowerCase()) ||
                  e.name.toLowerCase().includes(cleanUser)
                )
            );
            const isLockedEmp = Boolean(
              loggedInEmp &&
              currentUser?.role !== 'Admin' &&
              currentUser?.role !== 'Owner' &&
              currentUser?.role !== 'Super Admin'
            );

            return (
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Pilih Karyawan:
                </label>
                {isLockedEmp && loggedInEmp ? (
                  <div className="p-3.5 rounded-xl border border-purple-200 dark:border-purple-800/80 bg-purple-50/70 dark:bg-purple-950/60 flex items-center justify-between shadow-xs">
                    <div>
                      <span className="font-extrabold text-sm text-[#3D1259] dark:text-amber-300 block">
                        {loggedInEmp.name}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">
                        {loggedInEmp.role} • {loggedInEmp.outlet}
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Akun Terkunci
                    </span>
                  </div>
                ) : (
                  <select
                    value={selectedEmpId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setSelectedEmpId(id);
                      setErrorMsg('');
                      setSuccessMsg('');
                      const emp = employees.find((item) => item.id === id);
                      if (emp) {
                        setSelectedOutlet(emp.outlet || (locations[0]?.name || 'Steak 11, Kalisari'));
                        setPin(emp.pin || '');
                      }
                    }}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            );
          })()}

          {/* Outlet Selection */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Outlet Penugasan:
            </label>
            <select
              value={selectedOutlet}
              onChange={(e) => setSelectedOutlet(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* Shift Schedule Box - Template 1: Minimalist Modern Left Accent Border */}
          <div className="p-4 rounded-xl bg-amber-500/5 dark:bg-purple-950/40 border border-slate-200 dark:border-purple-800/60 border-l-4 border-l-amber-500 dark:border-l-amber-400 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-amber-400 text-purple-950 font-black text-[10px]">
                  ⏰ SHIFT
                </div>
                <span className="font-extrabold text-[#3D1259] dark:text-amber-300 font-baloo tracking-wide text-xs">
                  Batas Operasional Shift
                </span>
              </div>
              <span className="font-mono font-black text-xs sm:text-sm px-3 py-1 rounded-xl bg-purple-900 text-amber-300 dark:bg-purple-950 dark:text-amber-300 border border-purple-800 shadow-xs">
                {startWorkTime} - {endWorkTime} WIB
              </span>
            </div>
            <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 leading-relaxed">
              Presensi masuk lewat pukul <strong className="text-amber-600 dark:text-amber-400 font-bold">{startWorkTime} WIB</strong> otomatis tercatat <span className="text-rose-600 dark:text-rose-400 font-extrabold">Terlambat</span>.
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Catatan Khusus (Opsional):
            </label>
            <input
              type="text"
              placeholder="Contoh: Izin terlambat hujan, shift pengganti..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Today's Status Box */}
          {todayRecord ? (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-extrabold text-emerald-800 dark:text-emerald-300">
                <span>✅ Sudah Presensi Masuk Hari Ini</span>
                <span className="font-mono">{todayRecord.clockInTime} WIB</span>
              </div>
              <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between">
                <span>Presensi Pulang:</span>
                <span className="font-mono font-bold">
                  {todayRecord.clockOutTime ? `${todayRecord.clockOutTime} WIB (${todayRecord.hoursWorked} Jam)` : 'Belum Pulang'}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center justify-between">
              <span>⏳ Status Hari Ini: Belum Presensi Masuk</span>
              <span className="text-[11px] font-normal">Silakan Foto Selfie & Klik Presensi</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleSubmitClockIn}
              disabled={!!todayRecord}
              className={`py-3 px-4 rounded-xl font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                todayRecord
                  ? 'bg-slate-200 dark:bg-purple-950 text-slate-400 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <UserCheck className="w-4 h-4" /> PRESENSI MASUK
            </button>

            <button
              onClick={handleClockOut}
              disabled={!todayRecord || !!todayRecord.clockOutTime}
              className={`py-3 px-4 rounded-xl font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                !todayRecord || todayRecord.clockOutTime
                  ? 'bg-slate-200 dark:bg-purple-950 text-slate-400 cursor-not-allowed'
                  : 'bg-[#3D1259] dark:bg-amber-400 hover:bg-purple-900 dark:hover:bg-amber-300 text-amber-300 dark:text-purple-950'
              }`}
            >
              <LogOut className="w-4 h-4" /> PRESENSI PULANG
            </button>
          </div>
        </div>

        {/* Right Col: Camera Live View & Watermarked Snapshot (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#1f0e30] p-6 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-purple-900/50 pb-3">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-amber-500" />
              <h3 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo flex items-center gap-2">
                Kamera & Watermark Selfie
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-600 dark:text-amber-300 text-[10px] font-extrabold font-mono border border-amber-400/30">
                  Format: Base64
                </span>
              </h3>
            </div>
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
              GPS: <span className="text-emerald-500 font-mono">{coords ? `${coords.lat}, ${coords.lng}` : 'Aktif'}</span>
            </div>
          </div>

          {/* Camera Viewport Area */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 border-2 border-purple-900/40 aspect-[4/3] flex flex-col items-center justify-center shadow-inner">
            {capturedSelfie ? (
              <div className="relative w-full h-full group">
                <img
                  src={capturedSelfie}
                  alt="Selfie Watermark Record"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => setPreviewModalImg(capturedSelfie)}
                    className="p-2.5 rounded-xl bg-white/20 backdrop-blur-md text-white font-extrabold text-xs flex items-center gap-1.5 hover:bg-white/30 cursor-pointer"
                  >
                    <Eye className="w-4 h-4" /> Perbesar
                  </button>
                  <button
                    onClick={() => {
                      setCapturedSelfie(null);
                      startCamera();
                    }}
                    className="p-2.5 rounded-xl bg-amber-400 text-purple-950 font-extrabold text-xs flex items-center gap-1.5 hover:bg-amber-300 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" /> Foto Ulang
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
                  className="w-full h-full object-cover"
                />
                {/* Live Watermark Overlay Guidelines */}
                <div className="absolute top-3 left-3 bg-purple-950/80 backdrop-blur-md text-amber-300 px-3 py-1.5 rounded-xl border border-amber-400/40 text-[11px] font-extrabold flex items-center gap-1.5 shadow-md">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> STEAK 11 LIVE WEBCAM
                </div>

                <div className="absolute bottom-3 left-3 right-3 bg-purple-950/90 backdrop-blur-md p-3 rounded-xl border border-purple-800 text-white text-xs space-y-1">
                  <div className="font-extrabold text-amber-300">
                    👤 {currentEmp?.name || 'Pilih Karyawan'}
                  </div>
                  <div className="text-[11px] text-slate-300 truncate">
                    🏪 {selectedOutlet} | 📍 {gpsLocationText}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-purple-900/50 text-amber-400 flex items-center justify-center mx-auto border border-purple-700/50 shadow-lg">
                  <Camera className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-white">Kamera Belum Aktif</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                    Klik tombol di bawah untuk membuka kamera selfie perangkat Anda & mengambil foto kehadiran ber-watermark.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Camera Controls */}
          <div className="space-y-3 pt-1">
            {!capturedSelfie && (
              <div className="flex flex-wrap items-center justify-between gap-3">
                {!isCameraActive ? (
                  <button
                    onClick={startCamera}
                    className="flex-1 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" /> Buka Kamera Selfie Live
                  </button>
                ) : (
                  <div className="flex items-center gap-2 w-full">
                    <button
                      onClick={() => handleTakeSnap('MASUK')}
                      className="flex-1 py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" /> Snap Foto (Masuk)
                    </button>
                    <button
                      onClick={() => handleTakeSnap('PULANG')}
                      className="flex-1 py-3 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-purple-950 font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" /> Snap Foto (Pulang)
                    </button>
                    <button
                      onClick={stopCamera}
                      className="p-3 rounded-xl bg-slate-200 dark:bg-purple-950 text-slate-700 dark:text-slate-200 hover:bg-slate-300 font-bold text-xs cursor-pointer"
                    >
                      Tutup
                    </button>
                  </div>
                )}

                {/* Upload Fallback */}
                <label className="py-3 px-4 rounded-xl bg-slate-100 dark:bg-purple-950/80 hover:bg-slate-200 dark:hover:bg-purple-900 text-slate-700 dark:text-slate-200 font-extrabold text-xs border border-slate-200 dark:border-purple-800 transition-all flex items-center justify-center gap-2 cursor-pointer">
                  <Upload className="w-4 h-4 text-purple-400" />
                  <span>Upload Foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'MASUK')}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>



      {/* Modal Bukti Presensi & Konfirmasi WA (Scrollable, Structured Fields) */}
      {waConfirmData && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/80 backdrop-blur-sm"
          onClick={() => setWaConfirmData(null)}
        >
          <div 
            className="bg-white dark:bg-[#180C25] text-slate-800 dark:text-slate-100 rounded-2xl max-w-md w-full p-5 sm:p-6 border-2 border-amber-400/80 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            
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

      {/* Image Preview Modal */}
      {previewModalImg && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/90 backdrop-blur-md"
          onClick={() => setPreviewModalImg(null)}
        >
          <div 
            className="relative max-w-2xl w-full bg-slate-900 rounded-2xl overflow-hidden p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewModalImg(null)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black font-bold cursor-pointer"
            >
              ✕
            </button>
            <img src={previewModalImg} alt="Watermark Selfie" className="w-full rounded-xl object-contain max-h-[80vh]" />
          </div>
        </div>
      )}
    </div>
  );
};
