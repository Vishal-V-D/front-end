// components/BlogDisplay.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Book, UserRound, Calendar, Save, Edit, ClipboardCopy, CheckCircle, Send, Loader2 } from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const BlogDisplay = ({ content, onCopy, copiedSection, onSave, onPost, isLoading, message,blogUrl }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [blogTitle, setBlogTitle] = useState('');
  const [blogTags, setBlogTags] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [processedHtmlContent, setProcessedHtmlContent] = useState('');

  const dedentText = useCallback((text) => {
    if (!text) return '';
    const lines = text.split('\n');
    let minIndent = Infinity;
    for (const line of lines) {
      if (line.trim().length === 0) continue;
      const leadingWhitespaceMatch = line.match(/^\s*/);
      const leadingWhitespace = leadingWhitespaceMatch ? leadingWhitespaceMatch[0].length : 0;
      minIndent = Math.min(minIndent, leadingWhitespace);
    }
    if (minIndent === Infinity || minIndent === 0) {
      return text;
    }
    return lines.map(line => line.substring(minIndent)).join('\n');
  }, []);

  useEffect(() => {
    const rawContent = typeof content === 'string' ? content : String(content || '');
    const dedentedContent = dedentText(rawContent);
    setEditedContent(dedentedContent);

    const markdownToHtml = DOMPurify.sanitize(marked.parse(dedentedContent));
    setProcessedHtmlContent(markdownToHtml);

    let foundTitle = '';
    const lines = dedentedContent.split('\n');
    for (const line of lines) {
      if (line.startsWith('# ')) {
        foundTitle = line.substring(2).trim();
        break;
      } else if (line.startsWith('## ')) {
        foundTitle = line.substring(3).trim();
        break;
      } else if (line.trim().length > 0 && !foundTitle) {
        foundTitle = line.trim();
      }
    }
    setBlogTitle(foundTitle ? `Blog Post: ${foundTitle.substring(0, 100)}${foundTitle.length > 100 ? '...' : ''}` : 'New Blog Post Draft');

    const tagsMatch = dedentedContent.match(/(?:Tags|Keywords):\s*#?(.+)/i);
    if (tagsMatch && tagsMatch[1]) {
      const extractedTags = tagsMatch[1]
        .split(/[,\s#]+/)
        .map(tag => tag.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()) // Only letters and numbers
        .filter(tag => tag.length > 0)
        .join(',');
      setBlogTags(extractedTags);
    } else {
      setBlogTags('ai,content');
    }
  }, [content, dedentText]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSaveClick = () => {
    onSave(editedContent, 'blog');
    setIsEditing(false);
    const markdownToHtml = DOMPurify.sanitize(marked.parse(editedContent));
    setProcessedHtmlContent(markdownToHtml);
  };

  const handlePostClick = async () => {
  const cleanTitle = blogTitle.replace('Blog Post: ', '').trim();
  if (!cleanTitle || cleanTitle === 'New Blog Post Draft') {
    alert("Please enter a meaningful title for your blog post before posting.");
    return;
  }
  if (!blogTags.trim()) {
    alert("Please enter tags for your blog post.");
    return;
  }

  // Sanitize tags: only allow a-z, A-Z, 0-9
  const validTags = blogTags
    .split(',')
    .map(tag => tag.replace(/[^a-zA-Z0-9]/g, '').toLowerCase())
    .filter(tag => tag.length > 0)
    .join(',');

  if (window.confirm(`Are you sure you want to post "${cleanTitle.substring(0, 50)}${cleanTitle.length > 50 ? '...' : ''}" to Dev.to?`)) {
    setShowConfirmation(true);

    if (onPost && typeof onPost === 'function') {
      await onPost(editedContent, cleanTitle, validTags); // Pass validTags!
    } else {
      console.error("BlogDisplay: The 'onPost' prop is not a function or is missing. Cannot post blog.");
      alert("Error: Posting functionality is currently unavailable. Please refresh the page or contact support.");
    }

    setTimeout(() => setShowConfirmation(false), 3000);
  }
};

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 mb-8 animate-slide-up">
      <h3 className="text-2xl font-bold text-blue-700 mb-4 flex items-center">
        <Book className="mr-2 text-blue-600" size={24} /> SEO-Optimized Blog Post
      </h3>
      <div className="relative border border-gray-200 rounded-lg p-6 bg-gray-50 max-w-3xl mx-auto">
        <div className="mb-3">
          <label htmlFor="blogTitle" className="block text-sm font-medium text-gray-700">
            Blog Title:
          </label>
          <input
            type="text"
            id="blogTitle"
            value={blogTitle.replace('Blog Post: ', '')}
            onChange={(e) => setBlogTitle(`Blog Post: ${e.target.value}`)}
            readOnly={isLoading}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter a unique title for your blog post"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="blogTags" className="block text-sm font-medium text-gray-700">
            Tags (comma-separated):
          </label>
          <input
            type="text"
            id="blogTags"
            value={blogTags}
            onChange={(e) => setBlogTags(e.target.value)}
            readOnly={isLoading}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g., ai, content, marketing"
          />
        </div>

        <div className="flex items-center text-gray-600 text-sm mb-4">
          <UserRound className="mr-2" size={16} /> By JustSpeak AI Team
          <Calendar className="ml-4 mr-2" size={16} /> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </div>

        {isEditing ? (
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="w-full p-0 border-0 bg-transparent text-gray-800 resize-none focus:outline-none overflow-y-auto custom-scrollbar"
            rows="15"
          ></textarea>
        ) : (
          <div
            className="prose max-w-none p-0 bg-transparent text-gray-800 overflow-y-auto custom-scrollbar"
            style={{ maxHeight: '400px' }}
            dangerouslySetInnerHTML={{ __html: processedHtmlContent }}
          />
        )}

        <div className="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-500">
          <p>Tags: <span className="font-semibold">{blogTags.split(',').map(tag => `#${tag.trim()}`).join(' ')}</span></p>
        </div>
        <div className="absolute top-2 right-2 flex space-x-2">
          {isEditing ? (
            <button
              onClick={handleSaveClick}
              className="p-2 bg-green-200 rounded-full text-green-600 hover:bg-green-300 transition duration-200"
              title="Save changes"
              disabled={isLoading}
            >
              <Save size={18} />
            </button>
          ) : (
            <button
              onClick={handleEditToggle}
              className="p-2 bg-blue-100 rounded-full text-blue-600 hover:bg-blue-200 transition duration-200"
              title="Edit blog post"
              disabled={isLoading}
            >
              <Edit size={18} />
            </button>
          )}
          <button
            onClick={() => onCopy(editedContent, 'blog')}
            className="p-2 bg-blue-100 rounded-full text-blue-600 hover:bg-blue-200 transition duration-200"
            title="Copy blog post"
            disabled={isLoading}
          >
            {copiedSection === 'blog' ? <CheckCircle size={18} className="text-green-500" /> : <ClipboardCopy size={18} />}
          </button>

          {content && (
            <button
              onClick={handlePostClick}
              className="p-2 bg-purple-100 rounded-full text-purple-600 hover:bg-purple-200 transition duration-200"
              title="Post blog to Dev.to"
              disabled={isLoading || showConfirmation}
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          )}
        </div>

        {showConfirmation && (
          <div className="absolute inset-x-0 bottom-4 flex items-center justify-center p-2 bg-green-500 text-white text-sm rounded-lg shadow-lg animate-bounce-in">
            <CheckCircle size={18} className="mr-2" /> Blog post initiated! Check Dev.to for status.
          </div>
        )}

        {message && (
    <div className={`mt-4 text-center text-sm p-2 rounded-lg ${message.includes('Error') || message.includes('Failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
      {message}
      {blogUrl && (
        <div className="mt-2">
          <a
            href={blogUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline font-semibold"
          >
            View your blog post
          </a>
        </div>
      )}
    </div>
  )}
      </div>
    </div>
  );
};

export default BlogDisplay;