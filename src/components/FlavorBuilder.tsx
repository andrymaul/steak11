import React, { useState, useEffect } from 'react';
import { ChefHat, ShoppingCart, Check } from 'lucide-react';
import { ChickenOption, SauceOption, AddonOption, CartItem } from '../types';
import {
  formatRupiah,
  getStoredChickenOptions,
  getStoredSauceOptions,
  getStoredAddonOptions,
} from '../utils';

interface FlavorBuilderProps {
  onAddCustomSteak: (customItem: CartItem) => void;
}

export const FlavorBuilder: React.FC<FlavorBuilderProps> = ({ onAddCustomSteak }) => {
  const [chickenOptions, setChickenOptions] = useState<ChickenOption[]>(getStoredChickenOptions());
  const [sauceOptions, setSauceOptions] = useState<SauceOption[]>(getStoredSauceOptions());
  const [addonOptions, setAddonOptions] = useState<AddonOption[]>(getStoredAddonOptions());

  const [selectedChicken, setSelectedChicken] = useState<ChickenOption | null>(chickenOptions[0] || null);
  const [selectedSauce, setSelectedSauce] = useState<SauceOption | null>(sauceOptions[0] || null);
  const [selectedAddons, setSelectedAddons] = useState<AddonOption[]>([]);

  useEffect(() => {
    const handleUpdate = () => {
      const updatedChicken = getStoredChickenOptions();
      const updatedSauce = getStoredSauceOptions();
      const updatedAddons = getStoredAddonOptions();

      setChickenOptions(updatedChicken);
      setSauceOptions(updatedSauce);
      setAddonOptions(updatedAddons);

      // Keep valid selections or fallback to first
      setSelectedChicken((prev) => {
        if (!prev) return updatedChicken[0] || null;
        const exists = updatedChicken.find((c) => c.id === prev.id);
        return exists || updatedChicken[0] || null;
      });

      setSelectedSauce((prev) => {
        if (!prev) return updatedSauce[0] || null;
        const exists = updatedSauce.find((s) => s.id === prev.id);
        return exists || updatedSauce[0] || null;
      });

      setSelectedAddons((prevList) =>
        (prevList || []).filter((a) => updatedAddons.some((updated) => updated.id === a.id))
      );
    };

    window.addEventListener('racik_options_updated', handleUpdate);
    return () => {
      window.removeEventListener('racik_options_updated', handleUpdate);
    };
  }, []);

  const toggleAddon = (addon: AddonOption) => {
    if ((selectedAddons || []).some((a) => a.id === addon.id)) {
      setSelectedAddons((selectedAddons || []).filter((a) => a.id !== addon.id));
    } else {
      setSelectedAddons([...(selectedAddons || []), addon]);
    }
  };

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const calculateTotal = () => {
    const base = selectedChicken ? selectedChicken.basePrice : 0;
    const addonsSum = (selectedAddons || []).reduce((sum, a) => sum + a.price, 0);
    return base + addonsSum;
  };

  const handleAdd = () => {
    if (!selectedChicken) {
      setToastMsg('⚠️ Pilih opsi daging terlebih dahulu!');
      setTimeout(() => setToastMsg(null), 3000);
      return;
    }
    const chickenName = selectedChicken.name;
    const sauceName = selectedSauce ? selectedSauce.name : 'Tanpa Saus';
    const customName = `Racikan Steak 11 (${chickenName})`;
    const addonsText =
      selectedAddons.length > 0
        ? selectedAddons.map((a) => a.name).join(', ')
        : 'Tanpa Add On';

    const newItem: CartItem = {
      id: 'custom-' + Date.now(),
      name: customName,
      price: calculateTotal(),
      quantity: 1,
      specialNotes: `Pilihan Daging: ${chickenName} | Saus: ${sauceName} | Add On: ${addonsText}`,
    };

    onAddCustomSteak(newItem);
    setToastMsg('✅ Racikan Steak 11 berhasil ditambahkan ke keranjang!');
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <section
      id="builder"
      className="py-20 bg-[#FFF8E4]/60 dark:bg-[#12071B] border-b border-amber-200/20 dark:border-purple-900/40"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-14">
          <span className="px-3.5 py-1.5 rounded-full bg-[#3D1259] dark:bg-amber-400 text-amber-300 dark:text-purple-950 text-xs font-extrabold uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <ChefHat className="w-4 h-4" /> Interactive Flavor Builder
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#3D1259] dark:text-amber-400 tracking-tight font-baloo mb-3">
            Racik Steak Favoritmu
          </h2>
          <p className="text-base text-slate-700 dark:text-slate-200 leading-relaxed max-w-xl">
            Sesuaikan porsi potongan paha ayam, varian saus signature, serta tambahan add-on lezat dengan kalkulasi estimasi harga otomatis!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1 */}
            <div className="bg-white dark:bg-[#1f0e30] p-6 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm">
              <h3 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo mb-4">
                1️⃣ Pilihan Potongan Daging Paha Ayam
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(chickenOptions || []).map((ch) => {
                  const isSelected = selectedChicken?.id === ch.id;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => setSelectedChicken(ch)}
                      className={`p-4 rounded-xl border-2 text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#3D1259] dark:border-amber-400 bg-amber-50 dark:bg-purple-900/60 text-[#3D1259] dark:text-amber-300 font-bold'
                          : 'border-slate-200 dark:border-purple-900/40 bg-white dark:bg-[#180b24] text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="font-extrabold text-sm mb-1 font-baloo flex items-center justify-between">
                        <span>{ch.name}</span>
                        {isSelected && <Check className="w-4 h-4 text-amber-500" />}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-300 leading-tight mb-3">
                        {ch.description}
                      </div>
                      <div className="text-sm font-extrabold text-purple-700 dark:text-amber-300">
                        {formatRupiah(ch.basePrice)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white dark:bg-[#1f0e30] p-6 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm">
              <h3 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo mb-4">
                2️⃣ Pilihan Saus Signature 11
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(sauceOptions || []).map((s) => {
                  const isSelected = selectedSauce?.id === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSauce(s)}
                      className={`p-4 rounded-xl border-2 text-left transition-all flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'border-amber-400 bg-amber-50 dark:bg-purple-900/60 font-semibold text-[#3D1259] dark:text-amber-300'
                          : 'border-slate-200 dark:border-purple-900/40 bg-white dark:bg-[#180b24] text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div>
                        <div className="font-extrabold text-xs text-[#3D1259] dark:text-amber-300 font-baloo mb-1 flex items-center justify-between">
                          <span>✨ {s.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-500" />}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-300 leading-tight mb-2">
                          {s.description}
                        </div>
                      </div>
                      {s.spiciness > 0 && (
                        <span className="text-[10px] font-bold text-red-600">
                          🔥 Sensasi Pedas
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white dark:bg-[#1f0e30] p-6 rounded-2xl border border-slate-200 dark:border-purple-900/50 shadow-sm">
              <h3 className="font-extrabold text-base text-[#3D1259] dark:text-amber-400 font-baloo mb-4">
                3️⃣ Pilihan Add On / Tambahan
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(addonOptions || []).map((a) => {
                  const isSelected = (selectedAddons || []).some((item) => item.id === a.id);
                  return (
                    <button
                      key={a.id}
                      onClick={() => toggleAddon(a)}
                      className={`p-3.5 rounded-xl border-2 text-left flex flex-col justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#3D1259] dark:border-amber-400 bg-amber-50 dark:bg-purple-900/60 font-bold text-[#3D1259] dark:text-amber-300'
                          : 'border-slate-200 dark:border-purple-900/40 bg-white dark:bg-[#180b24] text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-bold block mb-1 flex items-center justify-between">
                          <span>{a.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-amber-500" />}
                        </span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-300 block mb-2">
                          {a.description}
                        </span>
                      </div>
                      <span className="text-xs font-extrabold text-purple-700 dark:text-amber-300">
                        +{formatRupiah(a.price)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="bg-[#250838] text-white rounded-2xl p-6 shadow-xl border border-purple-800/60 space-y-6">
              <div className="flex items-center justify-between border-b border-purple-800/50 pb-4">
                <h3 className="font-extrabold text-lg font-baloo text-white">
                  ✨ Ringkasan Steak Kreasimu
                </h3>
                <span className="text-[10px] bg-amber-400 text-purple-950 px-2.5 py-1 rounded-full font-extrabold uppercase">
                  Live Calculator
                </span>
              </div>
              <div className="space-y-3 bg-purple-950/70 p-4 rounded-xl border border-purple-800/40 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 text-xs">Potongan Daging:</span>
                  <span className="font-extrabold text-amber-300 text-xs">
                    {selectedChicken ? selectedChicken.name : 'Belum dipilih'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 text-xs">Saus Signature:</span>
                  <span className="font-extrabold text-white text-xs">
                    {selectedSauce ? selectedSauce.name : 'Belum dipilih'}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-purple-800/40">
                  <span className="text-slate-300 text-xs">Add On:</span>
                  <div className="flex flex-wrap gap-1">
                    {(selectedAddons || []).length > 0 ? (
                      (selectedAddons || []).map((a) => (
                        <span
                          key={a.id}
                          className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded"
                        >
                          {a.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400">Tanpa Add On</span>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <div className="text-slate-300 text-xs font-medium mb-1">Estimasi Total Harga:</div>
                <div className="text-3xl font-extrabold text-amber-400 font-baloo">
                  {formatRupiah(calculateTotal())}
                </div>
              </div>
              {toastMsg && (
                <div className="p-3 rounded-xl bg-purple-900/80 border border-amber-400/50 text-amber-300 text-xs font-bold text-center animate-fade-in">
                  {toastMsg}
                </div>
              )}
              <button
                onClick={handleAdd}
                className="w-full py-3.5 rounded-xl font-extrabold text-sm bg-amber-400 text-purple-950 hover:bg-amber-300 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" /> Tambah Racikan ke Pesanan
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
