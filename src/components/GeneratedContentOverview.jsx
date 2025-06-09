import React, { useState, useEffect } from 'react';
import BlogDisplay from './BlogDisplay';
import LinkedInDisplay from './LinkedInDisplay';
import NewsletterDisplay from './NewsletterDisplay';
import TwitterDisplay from './TwitterDisplay'; // Ensure correct path if needed

const GeneratedContentOverview = ({ generatedContent, activeTab, onCopy, copiedSection, onSave, onPost, isLoading, message, handlePostBlog, blogPostLoading, blogMessage, onLogin }) => {
  // Internal state to manage which content type is currently displayed
  const [activeSubTab, setActiveSubTab] = useState('blog');

  // Set default active sub-tab based on what content is available
  useEffect(() => {
    if (generatedContent.blog) setActiveSubTab('blog');
    else if (generatedContent.linkedin) setActiveSubTab('linkedin');
    else if (generatedContent.newsletter) setActiveSubTab('newsletter');
    else if (generatedContent.twitter) setActiveSubTab('twitter');
  }, [generatedContent]); // Re-evaluate when generatedContent changes

  const hasContent = generatedContent.blog || generatedContent.linkedin || generatedContent.newsletter || generatedContent.twitter;

  if (!hasContent) {
    return (
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-gray-700 mb-4">No Generated Content Yet</h2>
        <p className="text-gray-500">Please go to the Dashboard and generate some content first!</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md animate-fade-in border border-gray-200">
      <h2 className="text-2xl font-semibold text-gray-800 mb-5">Your Generated Content</h2>

      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto whitespace-nowrap">
        <button
          onClick={() => setActiveSubTab('blog')}
          className={`py-3 px-6 text-lg font-medium transition-colors duration-200
            ${activeSubTab === 'blog' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-600 hover:text-gray-800'}
            ${!generatedContent.blog ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!generatedContent.blog}
        >
          Blog Post
        </button>
        <button
          onClick={() => setActiveSubTab('linkedin')}
          className={`py-3 px-6 text-lg font-medium transition-colors duration-200
            ${activeSubTab === 'linkedin' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-600 hover:text-gray-800'}
            ${!generatedContent.linkedin ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!generatedContent.linkedin}
        >
          LinkedIn Post
        </button>
        <button
          onClick={() => setActiveSubTab('newsletter')}
          className={`py-3 px-6 text-lg font-medium transition-colors duration-200
            ${activeSubTab === 'newsletter' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-600 hover:text-gray-800'}
            ${!generatedContent.newsletter ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!generatedContent.newsletter}
        >
          Newsletter
        </button>
        <button
          onClick={() => setActiveSubTab('twitter')}
          className={`py-3 px-6 text-lg font-medium transition-colors duration-200
            ${activeSubTab === 'twitter' ? 'text-blue-700 border-b-2 border-blue-700' : 'text-gray-600 hover:text-gray-800'}
            ${!generatedContent.twitter ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!generatedContent.twitter}
        >
          Twitter/X Post
        </button>
      </div>

      {/* Render content based on active sub-tab */}
      {activeSubTab === 'blog' && generatedContent.blog && (
        <BlogDisplay content={generatedContent.blog} onCopy={onCopy} copiedSection={copiedSection} onSave={onSave} onPost={handlePostBlog} isLoading={blogPostLoading} message={blogMessage}  />
      )}
      {activeSubTab === 'linkedin' && generatedContent.linkedin && (
        <LinkedInDisplay content={generatedContent.linkedin} onCopy={onCopy} copiedSection={copiedSection} onSave={onSave} linkedinImage={generatedContent.linkedinImage} />
      )}
      {activeSubTab === 'newsletter' && generatedContent.newsletter && (
        <NewsletterDisplay content={generatedContent.newsletter} onCopy={onCopy} copiedSection={copiedSection} onSave={onSave} onPost={onPost} isLoading={isLoading}  message={message}    />
      )}
      {activeSubTab === 'twitter' && generatedContent.twitter && (
        <TwitterDisplay content={generatedContent.twitter} onCopy={onCopy} copiedSection={copiedSection} onSave={onSave} twitterImage={generatedContent.twitterImage} />
      )}

      {/* Message if no content is generated for the selected sub-tab */}
      {!generatedContent[activeSubTab] && hasContent && (
        <p className="text-center text-gray-500 mt-8">No {activeSubTab.replace('linkedin', 'LinkedIn').replace('blog', 'blog post').replace('newsletter', 'newsletter draft').replace('twitter', 'Twitter/X post')} generated yet for the current settings.</p>
      )}
    </div>
  );
};

export default GeneratedContentOverview;
