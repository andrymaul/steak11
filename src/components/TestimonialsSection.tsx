import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, MessageSquarePlus, Sparkles } from 'lucide-react';
import { ReviewItem } from '../types';
import { getStoredReviews } from '../utils';
import { CustomerReviewModal } from './CustomerReviewModal';

export const TestimonialsSection: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [writeModalOpen, setWriteModalOpen] = useState(false);

  const loadReviews = () => {
    const all = getStoredReviews();
    // Show approved reviews or reviews with default status
    const approved = (all || []).filter((r) => !r.status || r.status === 'Disetujui');
    setReviews(approved);
  };

  useEffect(() => {
    loadReviews();
    const handleUpdate = () => loadReviews();
    window.addEventListener('reviews_updated', handleUpdate);
    return () => window.removeEventListener('reviews_updated', handleUpdate);
  }, []);

  return (
    <section id="reviews" className="py-20 bg-white dark:bg-[#180B24] border-b border-slate-200 dark:border-purple-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-10">
          <span className="px-3.5 py-1.5 rounded-full bg-[#3D1259] dark:bg-amber-400 text-amber-300 dark:text-purple-950 text-xs font-extrabold uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" /> Kata Penikmat Mythic Taste
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#3D1259] dark:text-amber-400 tracking-tight font-baloo mb-3">
            Ulasan Asli Pelanggan Steak 11
          </h2>
          <p className="text-base text-slate-700 dark:text-slate-200 leading-relaxed max-w-xl mb-6">
            Ratusan porsi disajikan setiap hari dengan cita rasa 11 rempah rahasia yang selalu bikin ketagihan!
          </p>

          <button
            onClick={() => setWriteModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-purple-950 font-extrabold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span>✍️ Tulis Ulasan & Rating Anda</span>
          </button>
        </div>

        {(reviews || []).length === 0 ? (
          <div className="text-center py-10 bg-slate-50 dark:bg-[#1f0e30] rounded-2xl border border-slate-200 dark:border-purple-900/40">
            <p className="text-xs text-slate-500 dark:text-slate-400">Belum ada ulasan publik yang ditampilkan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(reviews || []).map((rev) => (
              <div
                key={rev.id}
                className="bg-white dark:bg-[#1f0e30] p-6 rounded-2xl border-2 border-slate-200 dark:border-purple-900/50 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(rev.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-2xl opacity-30">❝</span>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium mb-6 italic">
                    "{rev.comment}"
                  </p>
                </div>
                <div className="pt-4 border-t border-slate-100 dark:border-purple-900/40 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-400 text-purple-950 font-bold flex items-center justify-center font-baloo text-lg shrink-0">
                    👤
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#3D1259] dark:text-amber-400 font-baloo">
                      {rev.name}
                    </h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                      {rev.role}
                    </span>
                    <span className="text-[10px] text-[#3D1259] dark:text-amber-300 font-extrabold bg-amber-50 dark:bg-purple-950 px-2 py-0.5 rounded border border-amber-300/40 mt-1 inline-block">
                      Favorit: {rev.favoriteDish}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CustomerReviewModal
        isOpen={writeModalOpen}
        onClose={() => setWriteModalOpen(false)}
        onReviewSubmitted={loadReviews}
      />
    </section>
  );
};
