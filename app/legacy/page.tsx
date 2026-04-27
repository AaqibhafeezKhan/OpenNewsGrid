import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink, History, FileCode, Eye } from "lucide-react";

export const metadata: Metadata = {
  title: "Legacy Version - Global News Daily",
  description:
    "View the original static HTML/CSS version of Global News Daily.",
};

export default function LegacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to New App
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <History className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Legacy Version
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            The original static HTML/CSS version that started it all. Preserved
            for historical reference.
          </p>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* View Legacy */}
          <a
            href="/legacy/index.html"
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Eye className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                  View Legacy Site
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  See the original static HTML/CSS version with placeholder
                  content.
                </p>
                <span className="inline-flex items-center gap-1 text-primary text-sm font-medium">
                  Open Legacy Site
                  <ExternalLink className="h-4 w-4" />
                </span>
              </div>
            </div>
          </a>

          {/* View Source */}
          <a
            href="https://github.com/aaqibhafeezkhan/News-Grid-static"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow hover:shadow-lg transition-shadow group"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <FileCode className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                  Original Repository
                </h2>
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  View the source code on GitHub. The original static HTML/CSS
                  project.
                </p>
                <span className="inline-flex items-center gap-1 text-primary text-sm font-medium">
                  View on GitHub
                  <ExternalLink className="h-4 w-4" />
                </span>
              </div>
            </div>
          </a>
        </div>

        {/* Comparison */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Then vs Now
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Legacy */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium">
                  Legacy (2023)
                </span>
              </div>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Static HTML/CSS</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Placeholder content</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>No real-time updates</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Single page</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-gray-400">•</span>
                  <span>Manual updates only</span>
                </li>
              </ul>
            </div>

            {/* Current */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  New App (2024)
                </span>
              </div>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Next.js + React + TypeScript</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Live news from 300+ sources</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Real-time RSS aggregation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Search, filters, categories</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Regional & country browsing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500">✓</span>
                  <span>Dark mode & responsive design</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Original Links */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Original demo:{" "}
            <a
              href="https://aaqibhafeezkhan.github.io/News-Grid-static/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              aaqibhafeezkhan.github.io/News-Grid-static
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
