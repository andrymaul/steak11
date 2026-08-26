import React, { useState } from 'react';
import {
  MessageSquare,
  Star,
  Search,
  Check,
  XCircle,
  Edit,
  Trash2,
  Plus,
  X,
  Sparkles,
  MapPin
} from 'lucide-react';
import { Review, Location, AdminUser } from '../types';
import { isRegisteredAdmin } from '../utils';

export interface ReviewsManagerProps {
  reviews: Review[];
  setReviews: React.Dispatch<React.SetStateAction<Review[]>>;
  saveReviews: (data: Review[]) => void;
  locations: Location[];
  currentUser?: { name?: string; fullName?: string; role?: string; allowedTabs?: string[] } | AdminUser | null;
  showToast: (msg: string) => void;
}

export const ReviewsManager: React.FC<ReviewsManagerProps> = ({
  reviews,
  setReviews,
  saveReviews,
  locations,
  currentUser,
  showToast
}) => {
  const isAdmin = isRegisteredAdmin(currentUser);

  // Filters
  const [reviewSearchTerm, setReviewSearchTerm] = useState('');
  const [reviewRatingFilter, setReviewRatingFilter] = useState<number | 'ALL'>('ALL');
  const [reviewOutletFilter, setReviewOutletFilter] = useState<string>('ALL');

  // Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingRevId, setEditingRevId] = useState<string | null>(null);
  const [revName, setRevName] = useState('');
  const [revComment, setRevComment] = useState('');
  const [revRating, setRevRating] = useState(5);
  const [revFavoriteDish, setRevFavoriteDish] = useState('Creamy Garlic Herb Steak');
  const [revOutlet, setRevOutlet] = useState(locations[0]?.name || 'Steak 11, Cibubur');
  const [revStatus, setRevStatus] = useState<'Disetujui' | 'Pending' | 'Ditolak'>('Disetujui');

  // Delete Target
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const checkAdminPermission = (actionName: string = 'melakukan tindakan ini'): boolean => {
    if (!isAdmin) {
      showToast(`🔒 Akses Ditolak: Hanya Admin Terdaftar yang memiliki izin untuk ${actionName}.`);
      return false;
    }
    return true;
  };

  const handleOpenAddReview = () => {
    if (!checkAdminPermission('menambah ulasan baru')) return;
    setEditingRevId(null);
    setRevName('');
    setRevComment('');
    setRevRating(5);
    setRevFavoriteDish('Creamy Garlic Herb Steak');
    setRevOutlet(locations[0]?.name || 'Steak 11, Cibubur');
    setRevStatus('Disetujui');
    setShowReviewModal(true);
  };

  const handleOpenEditReview = (r: Review) => {
    if (!checkAdminPermission('mengedit ulasan')) return;
    setEditingRevId(r.id);
    setRevName(r.name);
    setRevComment(r.comment);
    setRevRating(r.rating);
    setRevFavoriteDish(r.favoriteDish || 'Creamy Garlic Herb Steak');
    setRevOutlet(r.outlet || locations[0]?.name || 'Steak 11, Cibubur');
    setRevStatus(r.status);
    setShowReviewModal(true);
  };

  const handleSaveReview = () => {
    if (!checkAdminPermission('menyimpan ulasan')) return;
    if (!revName.trim() || !revComment.trim()) {
      showToast('Nama dan Isi Komentar Ulasan wajib diisi!');
      return;
    }

    if (editingRevId) {
      const updated = reviews.map((r) =>
        r.id === editingRevId
          ? {
              ...r,
              name: revName.trim(),
              comment: revComment.trim(),
              rating: Number(revRating),
              favoriteDish: revFavoriteDish.trim(),
              outlet: revOutlet,
              status: revStatus
            }
          : r
      );
      setReviews(updated);
      saveReviews(updated);
      showToast(`Ulasan dari "${revName}" berhasil diperbarui!`);
    } else {
      const newRev: Review = {
        id: `REV-${Date.now().toString().slice(-4)}`,
        name: revName.trim(),
        role: 'Pelanggan Setia',
        comment: revComment.trim(),
        rating: Number(revRating),
        date: new Date().toISOString().split('T')[0],
        status: revStatus,
        favoriteDish: revFavoriteDish.trim(),
        outlet: revOutlet
      };
      const updated = [newRev, ...reviews];
      setReviews(updated);
      saveReviews(updated);
      showToast(`Ulasan baru dari "${revName}" berhasil ditambahkan!`);
    }

    setShowReviewModal(false);
  };

  const handleApproveReview = (id: string) => {
    if (!checkAdminPermission('menyetujui ulasan')) return;
    const updated = reviews.map((r) => (r.id === id ? { ...r, status: 'Disetujui' as const } : r));
    setReviews(updated);
    saveReviews(updated);
    showToast('Ulasan disetujui & tampil di Landing Page Pelanggan!');
  };

  const handleRejectReview = (id: string) => {
    if (!checkAdminPermission('menyembunyikan ulasan')) return;
    const updated = reviews.map((r) => (r.id === id ? { ...r, status: 'Ditolak' as const } : r));
    setReviews(updated);
    saveReviews(updated);
    showToast('Ulasan disembunyikan dari Landing Page.');
  };

  const executeDeleteReview = () => {
    if (!deleteConfirmTarget || !checkAdminPermission('menghapus ulasan')) return;
    const updated = reviews.filter((r) => r.id !== deleteConfirmTarget.id);
    setReviews(updated);
    saveReviews(updated);
    showToast(`🗑️ Ulasan dari "${deleteConfirmTarget.name}" berhasil dihapus.`);
    setDeleteConfirmTarget(null);
  };

  // Filtered Reviews
  const filteredReviews = (reviews || []).filter((r) => {
    const matchesSearch =
      (r.name || '').toLowerCase().includes(reviewSearchTerm.toLowerCase()) ||
      (r.comment || '').toLowerCase().includes(reviewSearchTerm.toLowerCase()) ||
      (r.favoriteDish && r.favoriteDish.toLowerCase().includes(reviewSearchTerm.toLowerCase()));
    const matchesRating = reviewRatingFilter === 'ALL' || r.rating === reviewRatingFilter;
    const matchesOutlet = reviewOutletFilter === 'ALL' || r.outlet === reviewOutletFilter;
    return matchesSearch && matchesRating && matchesOutlet;
  });

  const totalReviews = (reviews || []).length;
  const approvedReviews = (reviews || []).filter((r) => r.status === 'Disetujui').length;
  const avgRating =
    totalReviews > 0
      ? ((reviews || []).reduce((acc, c) => acc + (c.rating || 5), 0) / totalReviews).toFixed(1)
      : '5.0';

  return (
    <div className="space-y-6">
      {/* Header Info & Add Button */}
      <div className="bg-white dark:bg-[#1f0e30] p-5 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-amber-500" />
            Manajemen Ulasan &amp; Testimoni Pelanggan
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Kelola ulasan kepuasan steak, berikan persetujuan moderasi untuk tayang di Landing Page, atau tambahkan testimoni baru.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenAddReview}
            className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs shadow-sm flex items-center gap-1.5 cursor-pointer shrink-0 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" /> <span>Tambah Ulasan</span>
          </button>
        )}
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-[#1f0e30] p-4 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Rata-Rata Rating</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
            {avgRating} <span className="text-xs font-medium text-slate-500">/ 5.0</span>
          </p>
        </div>

        <div className="bg-white dark:bg-[#1f0e30] p-4 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Ulasan</span>
            <MessageSquare className="w-4 h-4 text-purple-600 dark:text-amber-400" />
          </div>
          <p className="text-2xl font-black text-purple-700 dark:text-amber-400">
            {totalReviews} <span className="text-xs font-medium text-slate-500">ulasan</span>
          </p>
        </div>

        <div className="bg-white dark:bg-[#1f0e30] p-4 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Tayang di Landing Page</span>
            <Sparkles className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {approvedReviews} <span className="text-xs font-medium text-slate-500">disetujui</span>
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-[#1f0e30] p-4 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama pengulas, menu favorit, komentar..."
            value={reviewSearchTerm}
            onChange={(e) => setReviewSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
          <div className="flex items-center gap-1.5">
            <label className="text-xs font-bold text-slate-500">Rating:</label>
            <select
              value={reviewRatingFilter}
              onChange={(e) => setReviewRatingFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 cursor-pointer"
            >
              <option value="ALL">Semua Bintang</option>
              <option value="5">⭐⭐⭐⭐⭐ (5 Bintang)</option>
              <option value="4">⭐⭐⭐⭐ (4 Bintang)</option>
              <option value="3">⭐⭐⭐ (3 Bintang)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <label className="text-xs font-bold text-slate-500">Outlet:</label>
            <select
              value={reviewOutletFilter}
              onChange={(e) => setReviewOutletFilter(e.target.value)}
              className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 cursor-pointer"
            >
              <option value="ALL">Semua Outlet</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.name}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Reviews List Cards */}
      {filteredReviews.length === 0 ? (
        <div className="bg-white dark:bg-[#1f0e30] p-12 rounded-2xl border border-dashed border-slate-300 dark:border-purple-900 text-center">
          <p className="text-sm font-semibold text-slate-500">Tidak ada ulasan yang sesuai pencarian atau filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReviews.map((r) => (
            <div
              key={r.id}
              className="p-5 rounded-2xl bg-white dark:bg-[#1f0e30] border border-slate-200 dark:border-purple-900/50 shadow-sm flex flex-col justify-between space-y-4 hover:border-amber-400 transition-all"
            >
              <div className="space-y-2.5">
                {/* Header Card */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">{r.name}</h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">{r.role || 'Pelanggan'}</span>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      r.status === 'Disetujui'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        : r.status === 'Pending'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                        : 'bg-slate-100 text-slate-700 dark:bg-purple-950 dark:text-slate-300 border border-slate-300 dark:border-purple-800'
                    }`}
                  >
                    {r.status}
                  </span>
                </div>

                {/* Stars Rating */}
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}`}
                    />
                  ))}
                  <span className="text-xs font-bold text-slate-500 ml-1">({r.rating}.0)</span>
                </div>

                {/* Comment */}
                <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed bg-slate-50/80 dark:bg-[#180b24] p-3 rounded-xl border border-slate-100 dark:border-purple-900/40">
                  &quot;{r.comment}&quot;
                </p>

                {/* Favorite Dish & Outlet Tags */}
                <div className="space-y-1 text-[11px]">
                  {r.favoriteDish && (
                    <div className="flex items-center gap-1.5 text-purple-700 dark:text-amber-300 font-bold">
                      <span>🥩 Menu Favorit:</span>
                      <span className="bg-purple-100 dark:bg-purple-900/60 px-2 py-0.5 rounded text-[10px]">
                        {r.favoriteDish}
                      </span>
                    </div>
                  )}
                  {r.outlet && (
                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-[10px]">
                      <MapPin className="w-3 h-3 text-amber-500 shrink-0" />
                      <span>{r.outlet}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-purple-900/40">
                {isAdmin && (
                  <button
                    onClick={() => handleOpenEditReview(r)}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-100 text-purple-950 font-extrabold text-xs hover:bg-amber-200 transition-all flex items-center justify-center gap-1 cursor-pointer"
                    title="Edit Ulasan & Menu Favorit"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                )}

                {isAdmin && (
                  r.status !== 'Disetujui' ? (
                    <button
                      onClick={() => handleApproveReview(r.id)}
                      className="flex-1 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" /> Setujui
                    </button>
                  ) : (
                    <button
                      onClick={() => handleRejectReview(r.id)}
                      className="flex-1 py-1.5 rounded-xl bg-slate-200 dark:bg-purple-900 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-300 transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Sembunyi
                    </button>
                  )
                )}

                {isAdmin && (
                  <button
                    onClick={() => setDeleteConfirmTarget({ id: r.id, name: r.name })}
                    className="p-1.5 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 cursor-pointer"
                    title="Hapus Review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Add / Edit Review */}
      {showReviewModal && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#180B24] rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-purple-900/60 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-purple-900 pb-3">
              <h3 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-500" />
                {editingRevId ? 'Edit Ulasan Pelanggan' : 'Tambah Ulasan Baru'}
              </h3>
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nama Pelanggan *</label>
                <input
                  type="text"
                  placeholder="Contoh: Maya Anggraini"
                  value={revName}
                  onChange={(e) => setRevName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-bold text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Menu Favorit</label>
                <input
                  type="text"
                  placeholder="Contoh: Creamy Garlic Herb Steak"
                  value={revFavoriteDish}
                  onChange={(e) => setRevFavoriteDish(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 font-bold text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Outlet Kunjungan</label>
                <select
                  value={revOutlet}
                  onChange={(e) => setRevOutlet(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-bold"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.name}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Isi Komentar Ulasan *</label>
                <textarea
                  rows={3}
                  placeholder="Ceritakan pengalaman rasa steak, saus, dan pelayanannya..."
                  value={revComment}
                  onChange={(e) => setRevComment(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Rating Bintang</label>
                  <select
                    value={revRating}
                    onChange={(e) => setRevRating(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-bold"
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ (5 Star)</option>
                    <option value={4}>⭐⭐⭐⭐ (4 Star)</option>
                    <option value={3}>⭐⭐⭐ (3 Star)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Status Publikasi</label>
                  <select
                    value={revStatus}
                    onChange={(e) => setRevStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 font-bold"
                  >
                    <option value="Disetujui">Disetujui (Landing Page)</option>
                    <option value="Pending">Pending</option>
                    <option value="Ditolak">Ditolak</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-purple-900">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-purple-900/50 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveReview}
                className="px-4 py-2 rounded-xl bg-amber-400 text-purple-950 font-extrabold text-xs hover:bg-amber-300 shadow-md cursor-pointer"
              >
                Simpan Ulasan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteConfirmTarget && (
        <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1C0D2B] rounded-2xl p-6 max-w-md w-full border border-red-500/30 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="p-3 bg-red-100 dark:bg-red-950/80 rounded-xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100">Hapus Ulasan</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Yakin ingin menghapus ulasan dari &quot;{deleteConfirmTarget.name}&quot;?
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-purple-950/50 p-3 rounded-xl border border-slate-200 dark:border-purple-900">
              Tindakan ini tidak dapat dibatalkan. Ulasan ini akan langsung dihapus dari sistem.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-purple-900/50 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer hover:bg-slate-300 dark:hover:bg-purple-900"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeDeleteReview}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-extrabold text-xs hover:bg-red-700 shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
