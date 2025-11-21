/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  DollarSign,
  Search,
  Star,
  Loader2,
  TrendingUp,
  HeadphonesIcon,
} from "lucide-react";
import axios from "axios";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import heroimg from "../assets/hero-bg.jpg";
import { useTranslation } from 'react-i18next';

// API Configuration
const API_BASE_URL = "http://127.0.0.1:5000/api/v1";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // State
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  // Fetch cities on mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoadingCities(true);
        setError("");

        const response = await axios.get(`${API_BASE_URL}/places`);
        console.log("API Response:", response.data); // Debug log

        // Handle API data
        let places = [];
        if (response.data.data && response.data.data.places && Array.isArray(response.data.data.places)) {
          places = response.data.data.places;
        } else if (Array.isArray(response.data.data)) {
          places = response.data.data;
        } else if (Array.isArray(response.data)) {
          places = response.data;
        } else if (response.data.places && Array.isArray(response.data.places)) {
          places = response.data.places;
        }

        console.log("Extracted places:", places.length, "places"); // Debug log

        const citySet = new Set<string>();
        places.forEach((place: any) => {
          if (place && place.city && typeof place.city === "string" && place.city.trim() !== "") {
            citySet.add(place.city.trim());
          }
        });

        const uniqueCities = Array.from(citySet).sort();
        console.log("Unique cities:", uniqueCities); // Debug log

        setCities(uniqueCities);
      } catch (err: any) {
        console.error("Error fetching cities:", err);
        const errorMessage = err.response?.data?.message || err.message || t('common.failedLoad');
        setError(errorMessage);
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCities();
  }, [retryCount, t]);

  const handleRetry = () => setRetryCount(prev => prev + 1);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedCity) params.append("city", selectedCity);
    if (selectedPrice) params.append("priceLevel", selectedPrice);
    navigate(`/listings?${params.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <>
      <Header />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">

        {/* Hero Section */}
        <div className="relative h-[600px] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: `url(${heroimg})` }} />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

          <div className="relative z-10 text-center px-4 max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              {t('home.hero.title')}
            </h1>
            <p className="text-xl text-white/90 mb-8">
              {t('home.hero.subtitle')}
            </p>

            {/* Filter Section */}
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-3xl mx-auto dark:bg-[#0f1729]">

              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="text-red-700 text-sm font-medium">
                        {error}
                      </span>
                    </div>
                    <button onClick={handleRetry} className="text-red-600 hover:text-red-800 text-sm font-semibold underline">
                      {t('common.retry')}
                    </button>
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-3 gap-4">

                {/* City Dropdown */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 text-left dark:text-white">
                    {t('search.city')}
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <select
                      value={selectedCity}
                      onChange={e => setSelectedCity(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={loadingCities}
                      className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed cursor-pointer transition-colors dark:text-black"
                    >
                      <option className="dark:text-black" value="">
                        {t('search.allCities')}
                      </option>
                      {loadingCities && <option disabled>{t('common.loading')}</option>}
                      {cities.map(city => (
                        <option key={city} value={city} className="dark:text-black">
                          {city}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      {loadingCities ? (
                        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                      ) : (
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price Dropdown */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 text-left dark:text-white">
                    {t('search.price')}
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    <select
                      value={selectedPrice}
                      onChange={e => setSelectedPrice(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none appearance-none bg-white cursor-pointer transition-colors dark:text-black"
                    >
                      <option value="">{t('search.allPrices')}</option>
                      <option value="1">$ - {t('search.budget')}</option>
                      <option value="2">$$ - {t('search.moderate')}</option>
                      <option value="3">$$$ - {t('search.expensive')}</option>
                      <option value="4">$$$$ - {t('search.luxury')}</option>
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Search Button */}
                <div className="flex items-end">
                  <button
                    onClick={handleSearch}
                    disabled={loadingCities}
                    className="w-full bg-[#ef4343] hover:bg-[#ffe1e1] hover:text-[#ef4343] disabled:bg-[#ef4343] text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all"
                  >
                    <Search className="w-5 h-5" />
                    {t('search.button')}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white py-24 dark:bg-[#0f1729]">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 dark:text-white">
                {t('home.features.title')}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto dark:text-gray-300">
                {t('home.features.subtitle')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              {/* Feature 1 */}
              <div className="group text-center transform hover:scale-105 transition-all duration-300 bg-gray-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl border border-gray-100 dark:bg-[#1e293b]">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-red-200 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative bg-gradient-to-br from-[#ef4343] to-[#d63030] w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-xl">
                    <MapPin className="w-12 h-12 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                  {t('home.features.feature1.title')}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed dark:text-gray-300">
                  {t('home.features.feature1.desc')}
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group text-center transform hover:scale-105 transition-all duration-300 bg-gray-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl border border-gray-100 dark:bg-[#1e293b]">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-red-200 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative bg-gradient-to-br from-[#ef4343] to-[#d63030] w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-xl">
                    <DollarSign className="w-12 h-12 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                  {t('home.features.feature2.title')}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed dark:text-gray-300">
                  {t('home.features.feature2.desc')}
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group text-center transform hover:scale-105 transition-all duration-300 bg-gray-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl border border-gray-100 dark:bg-[#1e293b]">
                <div className="relative inline-block mb-6">
                  <div className="absolute inset-0 bg-red-200 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative bg-gradient-to-br from-[#ef4343] to-[#d63030] w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-xl">
                    <Star className="w-12 h-12 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
                  {t('home.features.feature3.title')}
                </h3>
                <p className="text-gray-600 text-lg leading-relaxed dark:text-gray-300">
                  {t('home.features.feature3.desc')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="bg-gradient-to-b from-slate-50 to-white">
          <div className="py-24 px-4 dark:bg-[#0f1729]">
            <div className="max-w-7xl mx-auto text-center mb-16">
              <h2 className="text-5xl font-bold text-gray-900 mb-4 dark:text-white">
                {t('home.stats.title')}
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto dark:text-gray-300">
                {t('home.stats.subtitle')}
              </p>
            </div>
          </div>
        </div>

      </div>

      <Footer />
    </>
  );
};

export default Home;
