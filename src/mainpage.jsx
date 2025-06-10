import React, { useState, useEffect, useRef } from 'react';
import { Upload, Youtube, FileText, Linkedin, Mail, Loader2, Sparkles, ClipboardCopy, CheckCircle, Home, Book, Rss, Menu, X, Image, Calendar, UserRound, Twitter, Filter, Edit, Save, Folder, Settings, LifeBuoy, Info, BarChart2, Clock, CheckCircle2, XCircle, UserCircle, LogOut, Bell } from 'lucide-react'; // Added Bell icon
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';  // adjust your firebase import path

// Import all refactored components
import ActionButton from './components/ActionButton';
import BlogDisplay from './components/BlogDisplay';
import LinkedInDisplay from './components/LinkedInDisplay';
import NewsletterDisplay from './components/NewsletterDisplay';
import TwitterDisplay from './components/TwitterDisplay';
import ProfilePage from './components/ProfilePage';
import Sidebar from './components/Sidebar';
import MainContentHeader from './components/MainContentHeader';
import InputSection from './components/InputSection';
import GenerationOptions from './components/GenerationOptions';
import TranscribedTextDisplay from './components/TranscribedTextDisplay';
import ActionButtons from './components/ActionButtons'; // Plural 'ActionButtons' component
import RecentUploadsDisplay from './components/RecentUploadsDisplay';
import ContentLibraryDisplay from './components/ContentLibraryDisplay';
import AnalyticsDisplay from './components/AnalyticsDisplay';
import SettingsDisplay from './components/SettingsDisplay';
import HelpSupportDisplay from './components/HelpSupportDisplay';
import GeneratedContentOverview from './components/GeneratedContentOverview';


// Main App component
const Mainpage = () => {
  // Define the backend URL here as a single variable
  // IMPORTANT: Remember to update this with your active ngrok URL or deployment URL!
  const BACKEND_URL = "https://cbd771a9-8a90-492b-855e-76e51b2d93f8-00-1md33tii09z8y.pike.replit.dev";
  const notificationIdRef = useRef(0); // For unique notification IDs
  const [notifications, setNotifications] = useState([]); // State for notifications

  const addNotification = (message, type = 'info', duration = 5000) => {
    const newNotification = {
      id: notificationIdRef.current++,
      message,
      type,
      duration,
    };
    setNotifications((prev) => [...prev, newNotification]);

    if (duration > 0) {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== newNotification.id));
      }, duration);
    }
  };

  // State variables for inputs, transcription, generated content, and UI states
  const [audioFile, setAudioFile] = useState(null);
  const [youtubeLink, setYoutubeLink] = useState('');
  const [youtubeThumbnail, setYoutubeThumbnail] = useState('');
  const [youtubeVideoId, setYoutubeVideoId] = useState('');
  const [transcribedText, setTranscribedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [generatedContent, setGeneratedContent] = useState({
    blog: '',
    linkedin: '',
    newsletter: '',
    twitter: '',
    linkedinImage: null,
    twitterImage: null,
  });
  const [error, setError] = useState('');
  const [copiedSection, setCopiedSection] = useState('');
  const [activeTab, setActiveTab] = useState('generate');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [isSidebarLockedOpen, setIsSidebarLockedOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
const [blogPostLoading, setBlogPostLoading] = useState(false);
  const [blogMessage, setBlogPostMessage] = useState('');
  // Derived state for actual desktop sidebar expansion
  const isSidebarExpanded = isSidebarLockedOpen || (isSidebarHovered && !isSidebarLockedOpen); //
const [newsletterPostLoading, setNewsletterPostLoading] = useState(false);
  const [newsletterPostMessage, setNewsletterPostMessage] = useState('');
  // State for granular content generation options
  const [contentSettings, setContentSettings] = useState({
    all: { targetWordCount: 500, tone: 'Professional', focusKeywords: '' },
    blog: { targetWordCount: 500, tone: 'Professional', focusKeywords: '' },
    linkedin: { targetWordCount: 150, tone: 'Professional', focusKeywords: '' },
    newsletter: { targetWordCount: 300, tone: 'Professional', focusKeywords: '' },
    twitter: { targetWordCount: 200, tone: 'Professional', focusKeywords: '' },
  });
  const [selectedPostType, setSelectedPostType] = useState('all');

  // New state for recent uploads
  const [recentUploads, setRecentUploads] = useState([]);

  // Function to extract YouTube video ID and set thumbnail
  useEffect(() => {
    const extractYoutubeDetails = (url) => {
      const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = url.match(regExp);
      if (match && match[1] && match[1].length === 11) {
        const videoId = match[1];
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        return { videoId, thumbnailUrl };
      }
      return { videoId, thumbnailUrl };
    };

    if (youtubeLink) {
      const { videoId, thumbnailUrl } = extractYoutubeDetails(youtubeLink);
      setYoutubeVideoId(videoId);
      setYoutubeThumbnail(thumbnailUrl);
    } else {
      setYoutubeVideoId('');
      setYoutubeThumbnail('');
    }
  }, [youtubeLink]);

const saveNewGeneration = async (user, generatedContent, transcribedText) => {
  try {
    await addDoc(collection(db, 'generated_contents'), {
      uid: user.uid,
      email: user.email,
      name: user.displayName || null,
      blog: generatedContent.blog || null,
      linkedin: generatedContent.linkedin || null,
      newsletter: generatedContent.newsletter || null,
      twitter: generatedContent.twitter || null,
      transcript: transcribedText || null,
      status: 'not published',
      createdAt: serverTimestamp()
    });
    console.log('New generation saved with unique ID');
  } catch (error) {
    console.error('Error saving new generation:', error);
  }
};
  // Function to handle audio file selection
 const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) { // Removed the 'audio/' check to allow all file types
    setAudioFile(file); // 'audioFile' state can now hold any file type
    setError('');
    // Clear YouTube related states as a file is now selected
    setYoutubeLink('');
    setYoutubeVideoId('');
    setYoutubeThumbnail('');
    // Clear transcription/generation related states for a fresh start
    setTranscribedText('');
    setGeneratedContent({ blog: '', linkedin: '', newsletter: '', twitter: '', linkedinImage: null, twitterImage: null, documentText: '' });
  } else {
    setAudioFile(null);
    setError('Please select a file.'); // Updated error message
  }
};

  // Function to remove selected audio file
  const handleRemoveAudioFile = () => {
    setAudioFile(null);
    setTranscribedText('');
    setGeneratedContent({ blog: '', linkedin: '', newsletter: '', twitter: '', linkedinImage: null, twitterImage: null });
  };

  // Drag and drop handlers
  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
      setError('');
      setYoutubeLink('');
      setYoutubeVideoId('');
      setYoutubeThumbnail('');
      setTranscribedText('');
      setGeneratedContent({ blog: '', linkedin: '', newsletter: '', twitter: '', linkedinImage: null, twitterImage: null });
    } else {
      setAudioFile(null);
      setError('Please drop a valid audio file.');
    }
  };


  // Function to handle YouTube link input
  const handleYoutubeLinkChange = (event) => {
    setYoutubeLink(event.target.value);
    setAudioFile(null);
    setTranscribedText('');
    setGeneratedContent({ blog: '', linkedin: '', newsletter: '', twitter: '', linkedinImage: null, twitterImage: null });
    setError('');
  };

  // Function to handle transcription API call
 const handleTranscribe = async () => {
    // Ensure either a file is uploaded or a YouTube link is provided
    if (!audioFile && !youtubeLink) {
        setError('Please upload a file or provide a YouTube link.');
        return;
    }

    // Reset states for a new processing attempt
    setIsTranscribing(true);
    setError('');
    setTranscribedText('');
    // Initialize generated content, including a new 'documentText' field for text/PDF outputs
    // This ensures documentText is always available for potential updates
    setGeneratedContent({ blog: '', linkedin: '', newsletter: '', twitter: '', linkedinImage: null, twitterImage: null, documentText: '' });

    const newUploadId = Date.now().toString();
    let uploadName = '';
    let uploadType = '';
    let targetEndpoint = '';
    const formData = new FormData(); // FormData is used to send file data

    // --- Determine Upload Type and Endpoint ---
    if (audioFile) {
        uploadName = audioFile.name;
        const fileType = audioFile.type; // Get the MIME type of the uploaded file

        // Check if the file is a PDF or a plain text file
        if (fileType === 'application/pdf' || fileType.startsWith('text/')) {
            uploadType = 'document';
            targetEndpoint = `${BACKEND_URL}/api/process-document`; // Endpoint for document processing
            formData.append('file', audioFile); // Append the file under the 'file' key
        }
        // Check if the file is an audio file
        else if (fileType.startsWith('audio/')) {
            uploadType = 'audio';
            targetEndpoint = `${BACKEND_URL}/api/transcribe`; // Endpoint for audio transcription
            formData.append('file', audioFile); // Append the file under the 'file' key
        }
        // Handle unsupported file types if it's not audio, PDF, or text
        else {
            setError('Unsupported file type. Please upload audio, PDF, or text files.');
            setIsTranscribing(false);
            // Immediately update the status in recent uploads to 'Failed' for unsupported types
            setRecentUploads(prev => [{ id: newUploadId, name: uploadName, type: 'unsupported', status: 'Failed' }, ...prev].slice(0, 5));
            return; // Exit the function as the file type is not supported
        }
    } else if (youtubeLink) {
        // As per previous function logic: YouTube links always go to transcribe endpoint
        const videoIdMatch = youtubeLink.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        uploadName = videoIdMatch ? `YouTube Video (ID: ${videoIdMatch[1].substring(0, 7)}...)` : `YouTube Link: ${youtubeLink.substring(0, 20)}...`;
        uploadType = 'youtube';
        targetEndpoint = `${BACKEND_URL}/api/transcribe`; // YouTube links use the transcription endpoint
        formData.append('youtube_url', youtubeLink); // Append the YouTube URL
    }

    // Add the current upload to the recent uploads list with a 'Processing' status
    setRecentUploads(prev => [{ id: newUploadId, name: uploadName, type: uploadType, status: 'Processing' }, ...prev].slice(0, 5));

    try {
        // Make the API call to the determined endpoint
        const res = await fetch(targetEndpoint, {
            method: "POST",
            body: formData,
            credentials: "include", // Ensure cookies/authentication headers are sent
        });

        const data = await res.json();
       // Parse the JSON response

        if (res.ok) {
            // Update state based on the specific upload type and expected response
            if (uploadType === 'audio' || uploadType === 'youtube') {
                setTranscribedText(data.transcript); // Store the transcript for audio/YouTube
            } else if (uploadType === 'document') {
                // For documents, save the processed content to the 'documentText' field
                setGeneratedContent(prev => ({ ...prev, documentText: data.processedContent}));
                setTranscribedText(data.processedContent);
            }

            // Update the status of the current upload to 'Processed'
            setRecentUploads(prev => prev.map(upload =>
                upload.id === newUploadId ? { ...upload, status: 'Processed' } : upload
            ));
        } else {
            // If the response is not OK, set an error message and update status to 'Failed'
            setError(data.error || `Failed to process ${uploadType}.`);
            setRecentUploads(prev => prev.map(upload =>
                upload.id === newUploadId ? { ...upload, status: 'Failed' } : upload
            ));
        }

    } catch (err) {
        // Catch network or other unexpected errors
        setError(`An error occurred during ${uploadType} processing. Please check your internet connection or try again.`);
        console.error(`${uploadType} processing error:`, err);
        setRecentUploads(prev => prev.map(upload =>
            upload.id === newUploadId ? { ...upload, status: 'Failed' } : upload
        ));
    } finally {
        // Always set transcribing status to false once the operation is complete
        setIsTranscribing(false);
    }
};


  // Function to generate content using Flask backend
  const handleGenerateContent = async () => {
    if (!transcribedText) {
      setError('Please transcribe audio/video first.');
      return;
    }

    setIsLoading(true);
    setError('');
    setGeneratedContent({ blog: '', linkedin: '', newsletter: '', twitter: '', linkedinImage: null, twitterImage: null });

    const payload = {
      transcript: transcribedText,
      content_settings: {
        blog: contentSettings.blog,
        linkedin: contentSettings.linkedin,
        newsletter: contentSettings.newsletter,
        twitter: contentSettings.twitter,
      },
      selectedPostType: selectedPostType,
    };

    try {
      const res = await fetch(`${BACKEND_URL}/api/generate_content`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        setGeneratedContent(prev => ({
          ...prev,
          blog: data.content.blog || '',
          linkedin: data.content.linkedin || '',
          newsletter: data.content.newsletter || '',
          twitter: data.content.twitter || '',
          linkedinImage: data.images.linkedin ? `data:image/png;base64,${data.images.linkedin}` : null,
          twitterImage: data.images.twitter ? `data:image/png;base64,${data.images.twitter}` : null,
        }));
 const user = auth.currentUser;
 console.log(user);
    if (user) {
      // 4. Call save function automatically here
      await saveNewGeneration(user, data.content, transcribedText
        /* or transcription if any */);
        console.log(transcribedText);
    }

        if (selectedPostType === 'all') {
          if (data.content.blog) setActiveTab('blog');
          else if (data.content.linkedin) setActiveTab('linkedin');
          else if (data.content.newsletter) setActiveTab('newsletter');
          else if (data.content.twitter) setActiveTab('twitter');
        } else {
          setActiveTab(selectedPostType);
        }
      } else {
        setError(data.error || 'Failed to generate content.');
      }
    } catch (err) {
      setError('An error occurred while generating content. Check backend connection.');
      console.error('Error generating content:', err);
    } finally {
      setIsLoading(false);
    }
  };


  // Function to copy text to clipboard
  const copyToClipboard = (text, sectionName) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionName);
    setTimeout(() => setCopiedSection(''), 2000);
  };

  // Function to save edited content back to state
  const handleSaveEditedContent = (content, type) => {
    setGeneratedContent(prev => ({
      ...prev,
      [type]: content
    }));
  };

  // Function to handle navigation clicks (now switches tabs)
  const handleNavLinkClick = (tabName) => {
    setActiveTab(tabName);
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    console.log("User logged out!");
    alert("Logged out successfully!");
  };
const [blogPostUrl, setBlogPostUrl] = useState('');

const handlePostBlog = async (contentToPost, titleToPost, tagsToPost) => {
  setBlogPostLoading(true);
  setBlogPostMessage('');
  setBlogPostUrl('');

  try {
    const response = await fetch(
      `${BACKEND_URL}/api/post-blog`,           // ← back-ticks added
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: contentToPost,
          title: titleToPost,
          tags: tagsToPost,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      setBlogPostMessage(data.message || 'Blog posted successfully!');
      setBlogPostUrl(data.url || '');
      addNotification(data.message || 'Blog posted successfully!', 'success');
      console.log('Blog post response:', data);
    } else {
      setBlogPostMessage(data.error || 'Failed to post blog');
      setBlogPostUrl('');
      addNotification(data.error || 'Failed to post blog', 'error');
      console.error(`Error posting blog: ${data.error || 'Unknown error'}`); // ← back-ticks added
    }
  } catch (err) {
    console.error('Error posting blog:', err);
    setBlogPostMessage('Network error or server unreachable during blog post.');
    setBlogPostUrl('');
    addNotification(
      'Network error or server unreachable during blog post.',
      'error'
    );
  } finally {
    setBlogPostLoading(false);
  }
};

  
const handlePostNewsletter = async (newsletterContent) => {
  setNewsletterPostLoading(true); // Use newsletter-specific loading state
  setNewsletterPostMessage(''); // Clear previous message

  try {
    // Use backticks for template literal
    const response = await fetch(`${BACKEND_URL}/api/post-newsletter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: newsletterContent,
        title: 'Latest Newsletter from Your AI Agent', // Customize or extract from content
      }),
    });

    const data = await response.json();

    if (response.ok) {
      setNewsletterPostMessage(data.message || 'Newsletter posted successfully!');
      addNotification(data.message || 'Newsletter posted successfully!', 'success');
      console.log("Newsletter post response:", data);
      // Optionally clear the newsletter content or mark it as 'sent'
      // setGeneratedContent(prevContent => ({ ...prevContent, newsletter: '' }));
    } else {
      setNewsletterPostMessage(data.error || 'Failed to post newsletter');
      addNotification(data.error || 'Failed to post newsletter', 'error');
      console.error(`Error posting newsletter: ${data.error || 'Unknown error'}`);
    }
  } catch (err) {
    console.error('Error posting newsletter:', err);
    setNewsletterPostMessage('Network error or server unreachable during newsletter post.');
    addNotification('Network error or server unreachable during newsletter post.', 'error');
  } finally {
    setNewsletterPostLoading(false); // End newsletter-specific loading state
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-l from-white to--50 font-inter text-gray-800">
      {/* Mobile Menu Button - visible only on small screens */}
      <div className="lg:hidden p-4 bg-white shadow-md flex justify-between items-center z-30 relative">
        <h1 className="text-2xl font-bold text-blue-700">AI Content</h1>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-md text-gray-600 hover:bg-gray-100">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Component */}
      <Sidebar
        activeTab={activeTab}
        handleNavLinkClick={handleNavLinkClick}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isSidebarExpanded={isSidebarExpanded}
        setIsSidebarLockedOpen={setIsSidebarLockedOpen}
        setIsSidebarHovered={setIsSidebarHovered}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 pt-4 sm:pt-6 lg:pt-0 transition-all duration-300 ease-in-out
          ${isSidebarExpanded ? 'lg:ml-64' : 'lg:ml-20'}`} /* Adjusted collapsed width to ml-20 (80px) */
      >
        {/* NEW: PC-ONLY HEADER with CTC Elements and Profile Icon */}
    <header className="hidden lg:flex items-center justify-between py-3 px-8 bg-white shadow-sm border-b border-gray-200">

    {/* Left Side: Title "Just Speak" */}
    <div className="flex items-center">
        <h1 className="text-3xl font-extrabold bg-gradient-to-b from-indigo-500 to-indigo-600 bg-clip-text text-transparent tracking-tight leading-tight">
  Voxify🎶


</h1>

    </div>

    {/* Right Side: Search, AI Business Elements, Notifications, and User Controls */}
    <div className="flex items-center gap-6">
        {/* Search Bar (Increased Length) */}
        <div className="relative hidden md:block">
            <input
                type="text"
                placeholder="Search podcasts, generated posts, topics..."
                className="pl-10 pr-4 py-2 rounded-full border border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-transparent transition duration-200 w-80"
            />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
        </div>

        {/* AI Business Related Elements - Styled with colored background, white text */}
        {/* "Feedback" Button */}
        <button
            className="px-5 py-2 rounded-full bg-blue-500 text-white font-semibold shadow-md hover:bg-blue-600 transition duration-200 flex items-center gap-2"
            title="Request a new AI feature or integration"
            onClick={() => handleNavLinkClick('help')}
        >
            <Sparkles size={18} /> Feedback
        </button>

        {/* "Analytics" Button */}
        <button
            onClick={() => handleNavLinkClick('analytics')}
            className="px-5 py-2 rounded-full bg-green-500 text-white font-semibold shadow-md hover:bg-green-600 transition duration-200 flex items-center gap-2"
            title="View content performance analytics"
        >
            <BarChart2 size={18} /> Analytics
        </button>

        {/* Notifications Icon with Badge */}
        <button
            className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition duration-200 relative"
            title="Notifications"
        >
            <Bell size={24} />
            <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        {/* Profile / Account Menu */}
        <button
            onClick={() => handleNavLinkClick('profile')}
            className="flex items-center gap-2 p-1.5 rounded-full text-gray-600 hover:bg-gray-100 transition duration-200"
            title="Profile & Settings"
        >
            <UserCircle size={28} />
        </button>
    </div>
</header>


        <main className="p-4 sm:p-6 lg:p-8 overflow-auto">
          {/* Title and Description outside the main content box for 'generate' tab */}
          {activeTab === 'generate' && (
            <div className="text-center mb-8">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-l from-blue-600 to-violet-500 mb-4 mt-4 animate-fade-in">
                Voxify


              </h1>
              <p className="text-lg sm:text-xl font-bold text-gray-600 animate-fade-in delay-100">
                Create engaging content from your audio or YouTube videos effortlessly.
              </p>
            </div>
          )}

          <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-2xl p-6 sm:p-8 lg:p-10 transform transition-all duration-300 hover:shadow-2xl">
            {/* Titles for other tabs remain inside the box */}
            {activeTab !== 'generate' && activeTab !== 'generated-content-overview' && <MainContentHeader activeTab={activeTab} />}

            {/* Input and Transcribed Text Section (visible on 'generate' tab) */}
            {activeTab === 'generate' && (
              <div className="lg:flex lg:gap-8">
                <div className="lg:w-1/2">
                  <InputSection
                    audioFile={audioFile}
                    handleFileChange={handleFileChange}
                    handleRemoveAudioFile={handleRemoveAudioFile}
                    youtubeLink={youtubeLink}
                    handleYoutubeLinkChange={handleYoutubeLinkChange}
                    youtubeThumbnail={youtubeThumbnail}
                    youtubeVideoId={youtubeVideoId}
                    isDragging={isDragging}
                    handleDragOver={handleDragOver}
                    handleDragLeave={handleDragLeave}
                    handleDrop={handleDrop}
                  />
                </div>
                <div className="lg:w-1/2 mt-8 lg:mt-0">
                  <GenerationOptions
                    selectedPostType={selectedPostType}
                    setSelectedPostType={setSelectedPostType}
                    contentSettings={contentSettings}
                    setContentSettings={setContentSettings}
                  />
                </div>
              </div>
            )}

            {activeTab === 'generate' && (
              <>
                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6 animate-fade-in" role="alert">
                    <span className="block sm:inline">{error}</span>
                  </div>
                )}

                <ActionButtons
                  handleTranscribe={handleTranscribe}
                  isTranscribing={isTranscribing}
                  isLoading={isLoading}
                  audioFile={audioFile}
                  youtubeLink={youtubeLink}
                  handleGenerateContent={handleGenerateContent}
                  transcribedText={transcribedText}
                  error={error}
                />

                {transcribedText && (
                  <TranscribedTextDisplay
                    transcribedText={transcribedText}
                    copyToClipboard={copyToClipboard}
                    copiedSection={copiedSection}
                  />
                )}
              </>
            )}


            {activeTab === 'generated-content-overview' && (
              <GeneratedContentOverview
                generatedContent={generatedContent}
                onCopy={copyToClipboard}
                copiedSection={copiedSection}
                onSave={handleSaveEditedContent}
                onPost={handlePostNewsletter} // <-- Pass handlePostNewsletter to GeneratedContentOverview
                isLoading={newsletterPostLoading} // <-- Pass newsletterPostLoading to GeneratedContentOverview
                message={newsletterPostMessage} // <-- Pass newsletterPostMessage to GeneratedContentOverview
                
              />
            )}

            {(generatedContent.blog || generatedContent.linkedin || generatedContent.newsletter || generatedContent.twitter) &&
             (activeTab === 'blog' || activeTab === 'linkedin' || activeTab === 'newsletter' || activeTab === 'twitter') && (
              <div className="mt-10 animate-fade-in delay-300">
                <div className="flex border-b border-gray-200 mb-6 overflow-x-auto whitespace-nowrap">
                  <button
                    onClick={() => handleNavLinkClick('blog')}
                    className={`py-3 px-6 text-lg font-medium transition-colors duration-200
                      ${activeTab === 'blog' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-600 hover:text-gray-800'}
                      ${!generatedContent.blog ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!generatedContent.blog}
                  >
                    Blog Post
                  </button>
                  <button
                    onClick={() => handleNavLinkClick('linkedin')}
                    className={`py-3 px-6 text-lg font-medium transition-colors duration-200
                      ${activeTab === 'linkedin' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-600 hover:text-gray-800'}
                      ${!generatedContent.linkedin ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!generatedContent.linkedin}
                  >
                    LinkedIn Post
                  </button>
                  <button
                    onClick={() => handleNavLinkClick('newsletter')}
                    className={`py-3 px-6 text-lg font-medium transition-colors duration-200
                      ${activeTab === 'newsletter' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-600 hover:text-gray-800'}
                      ${!generatedContent.newsletter ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!generatedContent.newsletter}
                  >
                    Newsletter
                  </button>
                  <button
                    onClick={() => handleNavLinkClick('twitter')}
                    className={`py-3 px-6 text-lg font-medium transition-colors duration-200
                      ${activeTab === 'twitter' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-600 hover:text-gray-800'}
                      ${!generatedContent.twitter ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={!generatedContent.twitter}
                  >
                    Twitter/X Post
                  </button>
                </div>

               {activeTab === 'blog' && generatedContent.blog && (
                  <BlogDisplay content={generatedContent.blog} onCopy={copyToClipboard} copiedSection={copiedSection} onSave={handleSaveEditedContent} onPost={handlePostBlog} isLoading={blogPostLoading} message={blogMessage}blogUrl={blogPostUrl} />
                )}
                {activeTab === 'linkedin' && generatedContent.linkedin && (
                  <LinkedInDisplay content={generatedContent.linkedin} onCopy={copyToClipboard} copiedSection={copiedSection} onSave={handleSaveEditedContent} linkedinImage={generatedContent.linkedinImage} />
                )}
                {activeTab === 'newsletter' && generatedContent.newsletter && (
                  <NewsletterDisplay
                    content={generatedContent.newsletter}
                    onCopy={copyToClipboard}
                    copiedSection={copiedSection}
                    onSave={handleSaveEditedContent}
                    onPost={handlePostNewsletter} // Pass the new post function
                    isLoading={newsletterPostLoading} // Pass newsletter-specific loading state
                    message={newsletterPostMessage}   // Pass newsletter-specific message state
                  />
                )}
                {activeTab === 'twitter' && generatedContent.twitter && (
                  <TwitterDisplay content={generatedContent.twitter} onCopy={copyToClipboard} copiedSection={copiedSection} onSave={handleSaveEditedContent} twitterImage={generatedContent.twitterImage} />
                )}

                {activeTab !== 'generate' && !generatedContent[activeTab] && (
                  <p className="text-center text-gray-500 mt-8">No {activeTab.replace('linkedin', 'LinkedIn').replace('blog', 'blog post').replace('newsletter', 'newsletter draft').replace('twitter', 'Twitter/X post')} generated yet.</p>
                )}
              </div>
            )}

            {activeTab === 'recent-uploads' && <RecentUploadsDisplay recentUploads={recentUploads} />}
            {activeTab === 'content-library' && <ContentLibraryDisplay />}
            {activeTab === 'analytics' && <AnalyticsDisplay />}
            {activeTab === 'settings' && <SettingsDisplay />}
            {activeTab === 'help' && <HelpSupportDisplay />}
            {activeTab === 'profile' && <ProfilePage onLogout={handleLogout} />}

          </div>
        </main>
      </div>

      {/* Tailwind CSS Custom Animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

        .font-inter {
          font-family: 'Inter', sans-serif;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        .animate-fade-in.delay-100 { animation-delay: 0.1s; }
        .animate-fade-in.delay-200 { animation-delay: 0.2s; }
        .animate-fade-in.delay-300 { animation-delay: 0.3s; }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slideUp 0.7s ease-out forwards;
        }
        .animate-slide-up.delay-100 { animation-delay: 0.1s; }
        .animate-slide-up.delay-200 { animation-delay: 0.2s; }
        .animate-slide-up.delay-300 { animation-delay: 0.3s; }


        @keyframes bounceIn {
          0% { opacity: 0; transform: scale(0.8); }
          50% { opacity: 0.7; transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-bounce-in {
          animation: bounceIn 0.5s ease-out forwards;
        }
        .animate-bounce-in.delay-200 { animation-delay: 0.2s; }

        /* Custom scrollbar for textareas to make them look cleaner */
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

        /* Gradient Text Styling */
        .text-gradient-blue-purple {
          background: linear-gradient(to right, #4A90E2, #8A2BE2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          color: transparent;
        }
      `}</style>
    </div>
  );
};

export default Mainpage;
