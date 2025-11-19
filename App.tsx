import React, { useState, useCallback } from 'react';
import { analyzeImageForLocation } from './services/geminiService';
import ImageUploader from './components/ImageUploader';
import AnalysisResult from './components/AnalysisResult';
import Loader from './components/Loader';
import type { AnalysisResult as AnalysisResultType } from './types';

const App: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResultType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>("");

  const resetState = () => {
    setImageFile(null);
    setImageUrl(null);
    setAnalysis(null);
    setError(null);
    setIsLoading(false);
  };

  const handleImageSelect = useCallback((file: File) => {
    if (isLoading) return;
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
    setAnalysis(null);
    setError(null);
  }, [isLoading]);

  const handleAnalyzeClick = async () => {
    if (!imageFile) {
      setError("Please select an image first.");
      return;
    }
    if (!apiKey.trim()) {
      setError("Please enter your Gemini API Key.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await analyzeImageForLocation(imageFile, apiKey);
      setAnalysis(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-300">
            LocaLens
          </h1>
          <p className="mt-2 text-lg text-gray-400">Upload an image and let LocaLens pinpoint its location.</p>
        </header>

        <main className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="bg-gray-800 p-6 rounded-lg shadow-2xl space-y-4">
              <h2 className="text-xl font-semibold text-white">1. Upload Image</h2>
              {imageUrl ? (
                <div className="relative group">
                  <img src={imageUrl} alt="Upload preview" className="rounded-lg w-full h-auto object-contain max-h-80" />
                   <button 
                     onClick={() => { if(!isLoading) { setImageUrl(null); setImageFile(null); setAnalysis(null); }}}
                     className={`absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100 ${isLoading ? 'cursor-not-allowed' : 'hover:bg-black/75'}`}
                     aria-label="Remove image"
                     disabled={isLoading}
                   >
                     <svg xmlns="http://www.w.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                   </button>
                </div>
              ) : (
                <ImageUploader onImageSelect={handleImageSelect} disabled={isLoading} />
              )}
            </div>

            <div className="bg-gray-800 p-6 rounded-lg shadow-2xl space-y-4">
               <h2 className="text-xl font-semibold text-white">2. Run Analysis</h2>
               
               {/* API Key Input */}
               <div className="space-y-2">
                  <label htmlFor="apiKey" className="block text-sm font-medium text-gray-400">Gemini API Key</label>
                  <input 
                    type="password" 
                    id="apiKey" 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full bg-gray-900 border border-gray-700 text-gray-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600 text-sm"
                    disabled={isLoading}
                  />
                  <p className="text-xs text-gray-500">
                    Your key is used locally and never stored. Get one at <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">Google AI Studio</a>.
                  </p>
               </div>

               <div className="h-48 flex flex-col justify-center items-center border-t border-gray-700 pt-4 mt-4">
                 {isLoading ? (
                    <Loader />
                 ) : (
                    <>
                      <button
                        onClick={handleAnalyzeClick}
                        disabled={!imageFile || isLoading}
                        className="w-full px-8 py-4 text-lg font-bold text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-300 disabled:transform-none disabled:shadow-none"
                      >
                        Find Location
                      </button>
                      <p className="mt-4 text-sm text-gray-400 text-center">
                        {!imageFile ? "Upload an image to begin." : "Ready to analyze."}
                      </p>
                    </>
                 )}
               </div>
            </div>
          </div>

          {(error || analysis) && (
             <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-2xl">
                <h2 className="text-xl font-semibold text-white mb-4">3. Results</h2>
                 {error && (
                    <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg animate-fade-in">
                      <p className="font-bold">Analysis Failed</p>
                      <p>{error}</p>
                    </div>
                  )}
                  {analysis && <AnalysisResult data={analysis} />}
            </div>
          )}

        </main>
        
        <footer className="text-center mt-12 py-4">
          <p className="text-sm text-gray-500">Powered by Gemini AI. For educational and demonstrational purposes.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;