import React, { useState, useEffect } from 'react';
import type { AnalysisResult as AnalysisResultType, LocationGuess } from '../types';
import { MapPinIcon } from './icons/MapPinIcon';
import { SearchIcon } from './icons/SearchIcon';
import { LightbulbIcon } from './icons/LightbulbIcon';

interface AnalysisResultProps {
  data: AnalysisResultType;
}

const AnalysisResult: React.FC<AnalysisResultProps> = ({ data }) => {
  const { guesses, artifacts, summary, sources } = data;
  // Default to the first (highest confidence) guess
  const [selectedGuess, setSelectedGuess] = useState<LocationGuess>(guesses[0]);

  // Update selected guess if data changes (e.g. new search)
  useEffect(() => {
    if (guesses && guesses.length > 0) {
        setSelectedGuess(guesses[0]);
    }
  }, [guesses]);

  const { latitude, longitude } = selectedGuess;
  const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.005},${latitude - 0.005},${longitude + 0.005},${latitude + 0.005}&layer=mapnik&marker=${latitude},${longitude}`;

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg p-6 w-full animate-fade-in space-y-8">
      
      {/* Header & Guesses Selector */}
      <div className="space-y-4">
        <div className="flex items-center mb-2">
             <MapPinIcon className="w-8 h-8 mr-4 text-blue-400 flex-shrink-0" />
             <div>
                 <h2 className="text-2xl font-bold text-white">Hypothesis Models</h2>
                 <p className="text-sm text-gray-400">Select a location to view details</p>
             </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
            {guesses.map((guess, idx) => (
                <button
                    key={idx}
                    onClick={() => setSelectedGuess(guess)}
                    className={`relative p-4 rounded-lg border transition-all duration-300 text-left group ${
                        selectedGuess === guess 
                        ? 'bg-blue-900/30 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                        : 'bg-gray-800 border-gray-700 hover:bg-gray-750 hover:border-gray-600'
                    }`}
                >
                    <div className="flex justify-between items-center mb-2">
                        <span className={`font-bold ${selectedGuess === guess ? 'text-white' : 'text-gray-300'}`}>
                            #{idx + 1} {guess.city}, {guess.country}
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                            guess.confidence > 80 ? 'bg-green-900 text-green-300' : 
                            guess.confidence > 50 ? 'bg-yellow-900 text-yellow-300' : 
                            'bg-red-900 text-red-300'
                        }`}>
                            {guess.confidence}% Conf.
                        </span>
                    </div>
                    <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden mb-2">
                        <div 
                            className={`h-full rounded-full ${
                                guess.confidence > 80 ? 'bg-green-500' : 
                                guess.confidence > 50 ? 'bg-yellow-500' : 
                                'bg-red-500'
                            }`} 
                            style={{ width: `${guess.confidence}%` }}
                        ></div>
                    </div>
                    <p className="text-xs text-gray-400 truncate">{guess.place}</p>
                </button>
            ))}
        </div>
      </div>

      {/* Selected Location Detail */}
      <div className="border-t border-gray-700/50 pt-6 animate-fade-in-up">
          <div className="flex justify-between items-end mb-4">
             <div>
                <h3 className="text-xl font-bold text-white">{selectedGuess.place}</h3>
                <p className="text-gray-400 text-sm font-mono mt-1">
                    {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </p>
             </div>
          </div>
          
          {/* Maps Grid (OSM Only) */}
          <div className="mb-6">
            <div className="rounded-lg overflow-hidden border-2 border-gray-700 shadow-lg relative h-[400px] w-full">
                <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    src={osmUrl}
                    title="Location Map"
                    className="absolute inset-0 w-full h-full"
                ></iframe>
                <div className="absolute top-0 left-0 bg-gray-900/80 px-2 py-1 text-xs text-white rounded-br">OpenStreetMap</div>
            </div>
            <div className="mt-2 flex justify-end">
                <a 
                    href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 hover:underline flex items-center"
                >
                    Open in Google Maps (External) &rarr;
                </a>
            </div>
          </div>

          {/* Guess Specific Reasoning */}
           <div className="bg-blue-900/20 border border-blue-800/50 p-4 rounded-lg mb-6">
              <h4 className="text-blue-300 font-semibold mb-2 text-sm uppercase tracking-wider">Hypothesis Reasoning</h4>
              <p className="text-gray-300 text-sm leading-relaxed">{selectedGuess.reasoning}</p>
           </div>
      </div>
      
      {/* Artifacts Section (Global) */}
      <div>
        <div className="flex items-center mb-4">
          <SearchIcon className="w-6 h-6 mr-3 text-teal-400"/>
          <h3 className="text-xl font-semibold text-gray-200">Visual Evidence (Grid Scan)</h3>
        </div>
        <div className="space-y-4 pl-9">
          {artifacts.map((artifact, index) => (
            <div key={index} className="bg-gray-900/50 border-l-4 border-teal-500 p-4 rounded-r-lg">
              <h4 className="font-semibold text-white">{artifact.clue}</h4>
              <p className="text-gray-400 leading-relaxed text-sm">{artifact.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* General Summary */}
      <div>
        <div className="flex items-center mb-3">
            <LightbulbIcon className="w-6 h-6 mr-3 text-yellow-400" />
            <h3 className="text-xl font-semibold text-gray-200">Analyst's Deduction</h3>
        </div>
        <div className="pl-9">
             <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{summary}</p>
        </div>
      </div>

      {/* Sources Section */}
      {sources && sources.length > 0 && (
        <div className="pt-6 border-t border-gray-700/50">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Verified Sources & Grounding</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {sources.map((source, idx) => (
                    <a 
                        key={idx}
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center p-2 rounded bg-gray-800 hover:bg-gray-700 border border-gray-700 transition-colors group"
                    >
                        <div className="w-2 h-2 rounded-full bg-green-500 mr-3 group-hover:shadow-[0_0_5px_rgba(34,197,94,0.8)] transition-shadow"></div>
                        <span className="text-blue-400 text-sm truncate hover:underline">
                            {source.title}
                        </span>
                    </a>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisResult;