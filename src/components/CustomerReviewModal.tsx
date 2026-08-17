import React, { useState } from 'react';
import { Star, X, MessageSquarePlus, CheckCircle2, Sparkles } from 'lucide-react';
import { ReviewItem } from '../types';
import { getStoredReviews, saveReviews, getStoredMenuItems } from '../utils';

interface CustomerReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewSubmitted?: () => void;
}

export const CustomerReviewModal: React.FC<CustomerReviewModalProps> = ({
  isOpen,
  onClose,
  onReviewSubmitted,
}) => {
  const menuItems = getStoredMenuItems() || [];

  const [name, setName] = useState('');
  const [role, setRole] = useState('Pelanggan Setia Steak 11');
  const [rating, setRating] = useState(5);
  const [favoriteDish, setFavoriteDish] = useState(menuItems.length > 0 ? menuItems[0].name : 'Creamy Garlic Herb Steak');
  const [comment, setComment] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!name.trim() || !comment.trim()) {
      setErrorMessage('Mohon isi nama dan komentar ulasan Anda!');
      return;
    }

    const newReview: ReviewItem = {
      id: 'rev-' + Date.now(),
      name: name.trim(),
      role: role.trim() || 'Pelanggan Steak 11',
      comment: comment.trim(),
      rating,
      favoriteDish,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
    };

    const currentReviews = getStoredReviews() || [];
    const updated = [newReview, ...currentReviews];
    saveReviews(updated);

    setIsSuccess(true);
    if (onReviewSubmitted) onReviewSubmitted();

    setTimeout(() => {
      setIsSuccess(false);
      setName('');
      setComment('');
      onClose();
    }, 2200);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-purple-950/80 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-white dark:bg-[#1a0c28] text-slate-800 dark:text-slate-100 rounded-2xl shadow-2xl border border-purple-900/50 p-6 space-y-4 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-purple-900/50 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-purple-950 flex items-center justify-center font-black shadow-sm">
              <MessageSquarePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base font-baloo text-[#3D1259] dark:text-amber-400 leading-tight">
                Tulis Ulasan & Rating Pelanggan
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Bagikan pengalaman santap Mythic Chicken Taste Anda!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-purple-900/50 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-purple-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-extrabold text-xs">
            ⚠️ {errorMessage}
          </div>
        )}

        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h4 className="font-extrabold text-lg text-emerald-600 dark:text-emerald-400 font-baloo">
              Terima Kasih Atas Ulasan Anda!
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xs mx-auto">
              Ulasan Anda telah tersimpan dan akan langsung ditampilkan di halaman utama setelah diverifikasi oleh Admin.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Nama Lengkap Anda:
              </label>
              <input
                type="text"
                placeholder="Contoh: Budi Santoso"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 font-semibold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Profesi / Outlet:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Pelanggan Cibubur"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Menu Favorit Anda:
                </label>
                <select
                  value={favoriteDish}
                  onChange={(e) => setFavoriteDish(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400 font-semibold"
                >
                  {(menuItems || []).map((item) => (
                    <option key={item.id} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                  <option value="Steak Ayam 11 Rempah">Steak Ayam 11 Rempah</option>
                </select>
              </div>
            </div>

            {/* Rating Stars Selection */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                Beri Rating Kepuasan (1 - 5 Bintang):
              </label>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50 dark:bg-purple-950/80 border border-amber-200 dark:border-purple-900/60 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1.5 transition-transform hover:scale-125 cursor-pointer focus:outline-none"
                  >
                    <Star
                      className={`w-7 h-7 transition-colors ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-400 drop-shadow-sm'
                          : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 font-extrabold text-sm text-amber-600 dark:text-amber-400">
                  {rating}.0 / 5.0
                </span>
              </div>
            </div>

            {/* Comment Area */}
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Komentar & Pengalaman Kuliner Anda:
              </label>
              <textarea
                rows={3}
                placeholder="Ceritakan tentang rasa daging paha ayam, saus racikan, dan porsinya..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                className="w-full p-3 text-xs rounded-xl border border-slate-300 dark:border-purple-900 bg-slate-50 dark:bg-purple-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-extrabold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-purple-950" /> Kirim Ulasan Pelanggan Sekarang
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
