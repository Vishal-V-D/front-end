import React from 'react';
import { FileText, ClipboardCopy, CheckCircle } from 'lucide-react';

// Helper function to convert markdown-like bold (**text**) to HTML <strong>
const formatTextWithMarkdownBold = (text) => {
  if (!text) return '';
  // Use a regular expression to find all instances of **text** and replace them with <strong>text</strong>
  let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  return formattedText;
};

const TranscribedTextDisplay = ({ transcribedText, copyToClipboard, copiedSection }) => {
  // Process the raw transcribedText to apply bolding formatting
  const processedHtmlContent = transcribedText ? formatTextWithMarkdownBold(transcribedText) : '';

  return (
    <div className="mt-8 bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-xl shadow-xl border border-gray-200 animate-fade-in transition-all duration-500 ease-in-out">
      <h2 className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-6 flex items-center">
        <FileText className="mr-3 text-blue-600" size={28} /> Processed Content
      </h2>
      <div className="relative bg-white p-6 rounded-lg border border-gray-200 shadow-inner min-h-[200px] max-h-[500px] overflow-y-auto custom-scrollbar">
        <div
          className="text-gray-800 leading-relaxed text-base md:text-lg"
          // We are using dangerouslySetInnerHTML to render HTML from the processed text.
          // This is necessary to apply bolding. Ensure the input `transcribedText`
          // is sanitized if it comes from untrusted user sources in a real application.
        >
          {transcribedText ? (
            // Split the processed HTML content by newlines to create distinct paragraphs.
            // Each paragraph will then have its HTML (including <strong> tags) rendered.
            processedHtmlContent.split('\n').map((paragraphHtml, index) => (
              <p key={index} className="mb-2 last:mb-0" dangerouslySetInnerHTML={{ __html: paragraphHtml }} />
            ))
          ) : (
            <p className="text-gray-500 italic text-center py-10">
              No content to display yet. Upload a file or provide a YouTube link for processing!
            </p>
          )}
        </div>
        <button
          onClick={() => copyToClipboard(transcribedText, 'transcription')} // Copy the raw, unformatted text
          className="absolute top-4 right-4 p-2 bg-white rounded-full text-gray-600 hover:bg-gray-100 transition duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          title="Copy content"
        >
          {copiedSection === 'transcription' ? <CheckCircle className="text-green-500" size={20} /> : <ClipboardCopy size={20} />}
        </button>
      </div>
      {/* Custom Scrollbar Styles for consistent look */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
};

export default TranscribedTextDisplay;
