// LinkedInDisplay.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Save, Edit, ClipboardCopy, CheckCircle, Send, Image as ImageIcon, XCircle, MoreVertical, Download, PlusCircle } from 'lucide-react'; // Added PlusCircle icon
import ReactMarkdown from 'react-markdown';

const LinkedInDisplay = ({ content, onCopy, copiedSection, onSave, linkedinImage: initialLinkedinImage }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [postStatus, setPostStatus] = useState(null); // 'idle', 'posting', 'success', 'error'
  const [postMessage, setPostMessage] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState(null); // New state for selected image file
  const [imagePreviewUrl, setImagePreviewUrl] = useState(initialLinkedinImage); // For displaying image preview
  const fileInputRef = useRef(null); // Ref for the file input

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const componentRef = useRef(null); // Ref for the entire component's outer div
  const actionButtonsRef = useRef(null); // Ref for the top-right cluster of buttons
  const postButtonRef = useRef(null); // Ref for the "Post to LinkedIn" button

  const [html2canvasLoaded, setHtml2canvasLoaded] = useState(false);

  // Load html2canvas library from a standard CDN
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'; // Reverted to standard html2canvas CDN
    script.crossOrigin = 'anonymous'; // Keep crossOrigin attribute
    script.onload = () => {
      setHtml2canvasLoaded(true);
      console.log("html2canvas loaded successfully.");
    };
    script.onerror = (e) => {
      console.error("Failed to load html2canvas script:", e);
      alert("Error loading image export library. Please try again or refresh.");
    };
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Update editedContent and imagePreviewUrl when content or initialLinkedinImage prop changes
  useEffect(() => {
    setEditedContent(content);
    // If initialLinkedinImage changes, update preview URL only if no local file is selected
    if (!selectedImageFile) {
      setImagePreviewUrl(initialLinkedinImage);
    }
  }, [content, initialLinkedinImage, selectedImageFile]); // Added selectedImageFile to deps

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle redirects from LinkedIn OAuth flow and display status
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('linkedinPostStatus');
    const message = urlParams.get('message');

    if (status === 'success') {
      setPostStatus('success');
      setPostMessage('Successfully posted to LinkedIn!');
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (status === 'error') {
      setPostStatus('error');
      setPostMessage(`Failed to post to LinkedIn: ${message || 'Unknown error'}`);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const handleEditChange = (e) => {
    setEditedContent(e.target.value);
  };

  const handleSave = () => {
    onSave(editedContent, 'linkedin');
    setIsEditing(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImageFile(file);
      setImagePreviewUrl(URL.createObjectURL(file)); // Create a URL for image preview
    } else {
      setSelectedImageFile(null);
      setImagePreviewUrl(null);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImageFile(null);
    setImagePreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear the file input
    }
  };

  const handleAttachImageClick = () => {
    fileInputRef.current.click(); // Trigger the hidden file input click
  };

  const handlePostToLinkedIn = async () => {
    setPostStatus('posting');
    setPostMessage('Posting to LinkedIn...');

    const formData = new FormData();
    formData.append('content', editedContent);
    if (selectedImageFile) {
      formData.append('image', selectedImageFile);
    }

    try {
      const response = await fetch('/api/linkedin/publish', {
        method: 'POST',
        body: formData,
      });

      let responseBody;
      try {
        responseBody = await response.text();
      } catch (textError) {
        console.error('Error reading response body as text:', textError);
        setPostStatus('error');
        setPostMessage(`Failed to post to LinkedIn: Could not read server response.`);
        return;
      }

      let data;
      try {
        data = JSON.parse(responseBody);
      } catch (jsonParseError) {
        console.error('JSON parse error:', jsonParseError);
        console.error('Raw response from server (from text):', responseBody);
        setPostStatus('error');
        setPostMessage(`Failed to post to LinkedIn: Server did not return valid JSON. Raw response: "${responseBody.substring(0, 100)}..."`);
        return;
      }

      if (response.status === 202 && data.redirect) {
        setPostMessage('Redirecting to LinkedIn for login...');
        window.location.href = data.redirect;
      } else if (response.ok && data.success) {
        setPostStatus('success');
        setPostMessage('Successfully posted to LinkedIn!');
        setSelectedImageFile(null);
        setImagePreviewUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setPostStatus('error');
        setPostMessage(`Failed to post to LinkedIn: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error posting to LinkedIn:', error);
      setPostStatus('error');
      setPostMessage(`Failed to post to LinkedIn: ${error.message}`);
    }
  };

  // Generic download function
  const downloadFile = (data, filename, type) => {
    const blob = new Blob([data], { type: type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setShowDropdown(false); // Close dropdown after download
  };

  const handleDownloadTxt = () => {
    downloadFile(editedContent, 'linkedin_post.txt', 'text/plain');
  };

  const handleDownloadPdf = () => {
    // For a simple client-side PDF generation, a library like jsPDF is needed.
    // For now, this will download a .txt file, mimicking a PDF placeholder.
    // In a real application, you'd likely use a backend endpoint for proper PDF generation.
    downloadFile(editedContent, 'linkedin_post.pdf', 'text/plain');
    setPostMessage('PDF export initiated (downloaded as text file for demo).');
  };

  const handleDownloadJson = () => {
    const jsonData = {
      title: "LinkedIn Post Content",
      content: editedContent,
      imageUrl: imagePreviewUrl || null,
      timestamp: new Date().toISOString()
    };
    downloadFile(JSON.stringify(jsonData, null, 2), 'linkedin_post.json', 'application/json');
  };

  const handleExportAsPng = async () => {
    if (!componentRef.current) {
      console.error("Component reference not found for PNG export.");
      alert('Cannot capture content. Please ensure the component is visible.');
      setShowDropdown(false);
      return;
    }

    if (!html2canvasLoaded) {
      alert('Image export library is still loading or failed to load. Please wait a moment and try again.');
      console.error("html2canvas library not loaded.");
      setShowDropdown(false);
      return;
    }

    setShowDropdown(false); // Close dropdown before capture

    // Temporarily hide action buttons and the Post to LinkedIn button
    if (actionButtonsRef.current) {
      actionButtonsRef.current.style.visibility = 'hidden';
    }
    if (postButtonRef.current) { // Hide the Post to LinkedIn button
      postButtonRef.current.style.visibility = 'hidden';
    }

    try {
      if (window.html2canvas) {
        const canvas = await window.html2canvas(componentRef.current, {
          useCORS: true,
          scale: 2, // Increase scale for higher resolution image
        });
        const imgData = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = imgData;
        a.download = 'linkedin_post.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else {
        console.error("window.html2canvas is not defined even after script loaded.");
        alert("Image export function is not ready. Please try again.");
      }
    } catch (error) {
      console.error('Error capturing LinkedIn post as PNG:', error);
      if (error.message && error.message.includes("Tainted canvases may not be exported")) {
        alert("Failed to export as PNG: Image loading issues (CORS). Some images might be from a different domain. Please check browser console for details.");
      } else {
        alert(`Failed to export as PNG: ${error.message || 'Unknown error'}. Check the browser console for more details.`);
      }
    } finally {
      // Always make the hidden elements visible again
      if (actionButtonsRef.current) {
        actionButtonsRef.current.style.visibility = 'visible';
      }
      if (postButtonRef.current) { // Show the Post to LinkedIn button again
        postButtonRef.current.style.visibility = 'visible';
      }
    }
  };


  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6 animate-fade-in border border-gray-200" ref={componentRef}> {/* Ref for entire component */}
      <div className="flex justify-between items-center mb-4"> {/* Container for title and actions */}
        <h2 className="text-2xl font-semibold text-gray-800 flex items-center">
          <img src="https://img.icons8.com/color/48/000000/linkedin.png" alt="LinkedIn" className="w-8 h-8 mr-3" />
          LinkedIn Post
        </h2>
        {/* Action buttons container with ref */}
        <div className="flex items-center space-x-2" ref={actionButtonsRef}>
          {isEditing ? (
            <button
              onClick={handleSave}
              className="p-2 bg-green-200 rounded-full text-green-600 hover:bg-green-300 transition duration-200"
              title="Save changes"
            >
              <Save size={18} />
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 bg-pink-100 rounded-full text-pink-600 hover:bg-pink-200 transition duration-200"
              title="Edit LinkedIn post"
            >
              <Edit size={18} />
            </button>
          )}
          <button
            onClick={() => onCopy(editedContent, 'LinkedIn Post')}
            className="p-2 bg-pink-100 rounded-full text-pink-600 hover:bg-pink-200 transition duration-200"
            title="Copy LinkedIn post"
          >
            {copiedSection === 'LinkedIn Post' ? <CheckCircle className="text-green-500" size={18} /> : <ClipboardCopy size={18} />}
          </button>

          {/* Three dots dropdown for more options */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 bg-gray-200 rounded-full text-gray-600 hover:bg-gray-300 transition duration-200"
              title="More options"
            >
              <MoreVertical size={18} />
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200">
                <button
                  onClick={handleDownloadTxt}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <Download size={16} className="mr-2" /> Download as TXT
                </button>
                <button
                  onClick={handleDownloadPdf}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <Download size={16} className="mr-2" /> Download as PDF (txt)
                </button>
                <button
                  onClick={handleDownloadJson}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <Download size={16} className="mr-2" /> Export as JSON
                </button>
                <div className="border-t border-gray-200 my-1"></div>
                <button
                  onClick={handleExportAsPng}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <ImageIcon size={16} className="mr-2" /> Export as PNG
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative mb-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
        {isEditing ? (
          <textarea
            className="w-full p-0 border-0 bg-transparent text-gray-800 resize-none focus:outline-none overflow-y-auto custom-scrollbar min-h-[150px]"
            value={editedContent}
            onChange={handleEditChange}
            rows="6"
          />
        ) : (
          <div className="prose max-w-none text-gray-800 p-0 bg-transparent min-h-[150px] whitespace-pre-wrap">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}
      </div>

      {/* Image Upload Section */}
      <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
        {/* Conditional rendering for Attach Image section */}
        {imagePreviewUrl ? (
          <div className="mt-0 relative">
            <img src={imagePreviewUrl} alt="Image Preview" className="max-w-full h-auto rounded-lg shadow-sm border border-gray-200" />
            <button
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600 transition"
              title="Remove image"
            >
              <XCircle size={20} />
            </button>
            <button
              onClick={handleAttachImageClick} // Click this to change image
              className="absolute bottom-2 left-2 p-2 bg-blue-500 rounded-full text-white hover:bg-blue-600 transition"
              title="Change Image"
            >
              <PlusCircle size={20} />
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-medium text-gray-700 mb-2 flex items-center">
              <ImageIcon size={20} className="mr-2 text-gray-600" /> Attach Image (Optional)
            </h3>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={fileInputRef}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </>
        )}
      </div>
      {/* Hidden file input to be triggered by the "plus" icon */}
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        ref={fileInputRef}
        className="hidden" // Hide the original file input
      />


      <button
        onClick={handlePostToLinkedIn}
        className={`w-full py-2 px-4 rounded-md text-white font-semibold transition duration-300
          ${postStatus === 'posting' ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
          ${postStatus === 'success' ? 'bg-green-500' : ''}
          ${postStatus === 'error' ? 'bg-red-500' : ''} flex items-center justify-center`}
        disabled={postStatus === 'posting'}
        ref={postButtonRef} /* Ref for the Post to LinkedIn button */
      >
        {postStatus === 'posting' ? (
          <>
            <Send size={20} className="mr-2 animate-pulse" /> Posting...
          </>
        ) : postStatus === 'success' ? (
          <>
            <CheckCircle size={20} className="mr-2" /> Posted!
          </>
        ) : postStatus === 'error' ? (
          <>
            <span className="mr-2">❌</span> Failed
          </>
        ) : (
          <>
            <Send size={20} className="mr-2" /> Post to LinkedIn
          </>
        )}
      </button>
      {postMessage && (
        <p className={`mt-2 text-sm ${postStatus === 'error' ? 'text-red-600' : 'text-gray-600'}`}>
          {postMessage}
        </p>
      )}
    </div>
  );
};

export default LinkedInDisplay;
