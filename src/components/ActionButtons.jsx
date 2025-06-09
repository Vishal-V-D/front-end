import React from 'react';
import { FileText, Sparkles } from 'lucide-react';
import ActionButton from './ActionButton'; // Re-use the individual ActionButton

const ActionButtons = ({ handleTranscribe, isTranscribing, isLoading, audioFile, youtubeLink, handleGenerateContent, transcribedText, error }) => {
  return (
    <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
      <ActionButton
        onClick={handleTranscribe}
        disabled={isTranscribing || isLoading || (!audioFile && !youtubeLink)}
        loading={isTranscribing}
        icon={FileText}
        text="Transcribe / Summarize File"
        loadingText="Transcribing..."
        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white animate-bounce-in"
      />
      <ActionButton
        onClick={handleGenerateContent}
        disabled={isLoading || isTranscribing || !transcribedText}
        loading={isLoading}
        icon={Sparkles}
        text="Generate Content"
        loadingText="Generating Content..."
        className="bg-gradient-to-r from-pink-500 to-red-500 text-white animate-bounce-in delay-200"
      />
    </div>
  );
};

export default ActionButtons;