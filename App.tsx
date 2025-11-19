
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

    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const result = await analyzeImageForLocation(imageFile);
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
               <div className="h-64 flex flex-col justify-center items-center">
                 {isLoading ? (
                    <Loader />
                 ) : (
                    <>
                      <button
                        onClick={handleAnalyzeClick}
                        disabled={!imageFile || isLoading}
                        className="px-8 py-4 text-lg font-bold text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 disabled:transform-none"
                      >
                        Find Location
                      </button>
                      <p className="mt-4 text-sm text-gray-400 text-center">
                        {imageFile ? "Ready to analyze." : "Upload an image to begin."}
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
                    <div className="bg-red-900/50 border border-red-700 text-red-300 p-4 rounded-lg">
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