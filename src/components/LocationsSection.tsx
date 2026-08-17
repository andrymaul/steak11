import React, { useState, useEffect } from 'react';
import { MapPin, Clock, Phone, Map } from 'lucide-react';
import { getStoredLocations } from '../utils';
import { LocationItem } from '../types';

export const LocationsSection: React.FC = () => {
  const [locations, setLocations] = useState<LocationItem[]>([]);

  useEffect(() => {
    const loadLocations = () => {
      setLocations(getStoredLocations());
    };

    loadLocations();

    window.addEventListener('locations_updated', loadLocations);
    window.addEventListener('storage', loadLocations);

    return () => {
      window.removeEventListener('locations_updated', loadLocations);
      window.removeEventListener('storage', loadLocations);
    };
  }, []);

  return (
    <section id="locations" className="py-20 bg-slate-50 dark:bg-[#12071B] border-b border-slate-200 dark:border-purple-900/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-14">
          <span className="px-3.5 py-1.5 rounded-full bg-[#3D1259] dark:bg-amber-400 text-amber-300 dark:text-purple-950 text-xs font-extrabold uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5" /> Lokasi Outlets & Delivery Partner
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#3D1259] dark:text-amber-400 tracking-tight font-baloo mb-3">
            Cabang Outlet Steak 11
          </h2>
          <p className="text-base text-slate-700 dark:text-slate-200 leading-relaxed max-w-xl">
            Kunjungi cabang terdekat kami atau pesan online via partner GoFood, GrabFood, dan ShopeeFood!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(locations || []).map((loc) => (
            <div
              key={loc.id}
              className="bg-white dark:bg-[#1f0e30] rounded-2xl p-6 border-2 border-slate-200 dark:border-purple-900/50 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3 flex-wrap gap-1">
                  <span className="text-xs font-extrabold px-3 py-1 rounded-md bg-amber-50 dark:bg-purple-900/60 text-[#3D1259] dark:text-amber-300 border border-amber-300/40">
                    {loc.city}
                  </span>
                  <div className="flex items-center gap-1 flex-wrap">
                    {(!loc.supportedServiceTypes || loc.supportedServiceTypes.dineIn) && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-100 text-purple-900 dark:bg-purple-900 dark:text-amber-300">
                        🍽️ Dine-In
                      </span>
                    )}
                    {(!loc.supportedServiceTypes || loc.supportedServiceTypes.takeaway) && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-400 text-purple-950">
                        🛍️ Takeaway
                      </span>
                    )}
                    {(!loc.supportedServiceTypes || loc.supportedServiceTypes.delivery) && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500 text-white">
                        🛵 Delivery
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="font-extrabold text-xl text-[#3D1259] dark:text-amber-400 font-baloo mb-3">
                  {loc.name}
                </h3>
                <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300 mb-6">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span className="font-medium">{loc.address}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-purple-500 shrink-0" />
                    <span className="font-bold text-[#3D1259] dark:text-amber-300">{loc.hours}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="font-bold text-slate-800 dark:text-slate-200">{loc.phone}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-purple-900/40 space-y-3">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                  Mitra Pengiriman Online:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {(!loc.onlineDeliveryPartners || loc.onlineDeliveryPartners.isGofoodActive !== false) && (
                    loc.onlineDeliveryPartners?.gofoodUrl ? (
                      <a
                        href={loc.onlineDeliveryPartners.gofoodUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 hover:bg-emerald-200 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[11px] font-extrabold transition-all"
                      >
                        🟢 GoFood
                      </a>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-extrabold">
                        GoFood
                      </span>
                    )
                  )}

                  {(!loc.onlineDeliveryPartners || loc.onlineDeliveryPartners.isGrabfoodActive !== false) && (
                    loc.onlineDeliveryPartners?.grabfoodUrl ? (
                      <a
                        href={loc.onlineDeliveryPartners.grabfoodUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-green-100 dark:bg-green-950 hover:bg-green-200 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-800 text-[11px] font-extrabold transition-all"
                      >
                        🟢 GrabFood
                      </a>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg bg-green-50 text-green-800 border border-green-200 text-[11px] font-extrabold">
                        GrabFood
                      </span>
                    )
                  )}

                  {(!loc.onlineDeliveryPartners || loc.onlineDeliveryPartners.isShopeefoodActive !== false) && (
                    loc.onlineDeliveryPartners?.shopeefoodUrl ? (
                      <a
                        href={loc.onlineDeliveryPartners.shopeefoodUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-orange-100 dark:bg-orange-950 hover:bg-orange-200 text-orange-800 dark:text-orange-300 border border-orange-300 dark:border-orange-800 text-[11px] font-extrabold transition-all"
                      >
                        🟠 ShopeeFood
                      </a>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-800 border border-orange-200 text-[11px] font-extrabold">
                        ShopeeFood
                      </span>
                    )
                  )}

                  {loc.onlineDeliveryPartners?.isMaximActive && (
                    loc.onlineDeliveryPartners?.maximUrl ? (
                      <a
                        href={loc.onlineDeliveryPartners.maximUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950 hover:bg-amber-200 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[11px] font-extrabold transition-all"
                      >
                        🟡 Maxim Food
                      </a>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-extrabold">
                        Maxim Food
                      </span>
                    )
                  )}
                </div>
                <a
                  href={loc.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full mt-2 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#3D1259] text-amber-300 font-extrabold text-xs hover:bg-purple-900 transition-colors shadow-xs"
                >
                  <Map className="w-4 h-4" /> Petunjuk Jalan (Google Maps)
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
