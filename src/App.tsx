import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { FileExplorer } from './components/FileExplorer';
import { SearchBar } from './components/SearchBar';
import { DirectorySetup } from './components/DirectorySetup';
import { Settings } from './components/Settings';
import { useStore } from './store/useStore';
import { FolderUp, BookOpen, Lightbulb, Brain, Rocket, BookMarked, GraduationCap } from 'lucide-react';

type View = 'home' | 'search' | 'favorites' | 'recent' | 'tags' | 'settings';

function App() {
  const { isDirectorySet, settings } = useStore();
  const [showSetup, setShowSetup] = useState(!isDirectorySet);
  const [currentView, setCurrentView] = useState<View>('home');

  useEffect(() => {
    setShowSetup(!isDirectorySet);
  }, [isDirectorySet]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.theme === 'dark');
  }, [settings.theme]);

  const renderContent = () => {
    if (showSetup) {
      return <DirectorySetup />;
    }

    switch (currentView) {
      case 'home':
        return (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-12 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-pattern opacity-10"></div>
              <div className="relative z-10">
                <h1 className="text-4xl font-bold mb-4">Welcome to Study Hub</h1>
                <p className="text-emerald-100 text-lg max-w-2xl mb-6">
                  Your intelligent study companion. Organize, analyze, and master your learning materials with AI-powered tools.
                </p>
                <div className="flex gap-4">
                  <button className="px-6 py-3 bg-white text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-colors">
                    Get Started
                  </button>
                  <button className="px-6 py-3 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-400 transition-colors">
                    Watch Tutorial
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                <div className="p-3 bg-emerald-50 rounded-lg w-fit mb-4 group-hover:bg-emerald-100 transition-colors">
                  <FolderUp className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-emerald-600 transition-colors">Upload Materials</h3>
                <p className="text-gray-600">
                  Import your study materials and let us organize them intelligently.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                <div className="p-3 bg-teal-50 rounded-lg w-fit mb-4 group-hover:bg-teal-100 transition-colors">
                  <Brain className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-teal-600 transition-colors">AI Assistant</h3>
                <p className="text-gray-600">
                  Get instant help understanding complex topics and generating study materials.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                <div className="p-3 bg-emerald-50 rounded-lg w-fit mb-4 group-hover:bg-emerald-100 transition-colors">
                  <BookOpen className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-emerald-600 transition-colors">Smart Study</h3>
                <p className="text-gray-600">
                  Create summaries, flashcards, and quizzes automatically from your materials.
                </p>
              </div>
            </div>

            {/* Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <Rocket className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Quick Start Guide</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                        Upload your study materials
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                        Let AI analyze and organize content
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                        Generate study aids automatically
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                        Track your progress
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-8">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <GraduationCap className="w-6 h-6 text-teal-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Study Tips</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-teal-400 rounded-full"></span>
                        Use AI to explain difficult concepts
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-teal-400 rounded-full"></span>
                        Create summaries for quick revision
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-teal-400 rounded-full"></span>
                        Practice with auto-generated quizzes
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-teal-400 rounded-full"></span>
                        Review materials regularly
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Files */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Recent Files</h2>
                <button 
                  onClick={() => setCurrentView('recent')}
                  className="text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  View All
                </button>
              </div>
              <FileExplorer filterRecent limit={6} />
            </div>
          </div>
        );
      case 'search':
        return (
          <>
            <SearchBar />
            <FileExplorer />
          </>
        );
      case 'favorites':
        return <FileExplorer filterFavorites />;
      case 'recent':
        return <FileExplorer filterRecent />;
      case 'tags':
        return <FileExplorer showTags />;
      case 'settings':
        return <Settings />;
      default:
        return <FileExplorer />;
    }
  };

  return (
    <div className={`flex h-screen ${
      settings.theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <main className="flex-1 overflow-auto">
        <div className="p-6 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;