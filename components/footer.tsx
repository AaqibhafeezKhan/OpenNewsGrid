'use client';

import Link from 'next/link';
import { Globe, Twitter, Facebook, Instagram, Youtube, Mail } from 'lucide-react';
import { CATEGORIES, REGIONS, COUNTRIES } from '@/lib/constants';

export function Footer() {
  const popularCountries = COUNTRIES.slice(0, 8);

  return (
    <footer className="bg-gray-900 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Globe className="h-8 w-8 text-accent" />
              <span className="font-serif text-2xl font-bold">Global News</span>
            </Link>
            <p className="text-gray-400 text-sm mb-6">
              Your trusted source for real-time news from thousands of global sources. 
              Breaking stories from every corner of the world.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Categories</h3>
            <ul className="space-y-2">
              {CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/${cat.slug}`}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Regions */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Regions</h3>
            <ul className="space-y-2">
              {REGIONS.map((region) => (
                <li key={region.id}>
                  <Link
                    href={`/region/${region.slug}`}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {region.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Countries & Contact */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Popular Countries</h3>
            <ul className="space-y-2 mb-6">
              {popularCountries.map((country) => (
                <li key={country.code}>
                  <Link
                    href={`/country/${country.code}`}
                    className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2"
                  >
                    <span>{country.flag}</span>
                    {country.name}
                  </Link>
                </li>
              ))}
            </ul>
            
            <h3 className="font-semibold text-lg mb-4">Contact</h3>
            <a href="mailto:contact@globalnews.com" className="text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-2">
              <Mail className="h-4 w-4" />
              contact@globalnews.com
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} Global News Daily. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/legacy" className="text-gray-500 hover:text-white transition-colors">
                Legacy Version
              </Link>
              <Link href="#" className="text-gray-500 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-gray-500 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="text-gray-500 hover:text-white transition-colors">
                Cookie Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
