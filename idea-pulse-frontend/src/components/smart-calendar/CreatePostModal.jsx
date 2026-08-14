import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { modalVariants, modalContentVariants, buttonHoverVariants } from '../../utils/animations';
import { createPost, schedulePost } from '../../services/calendarService';
import { showSuccessToast, showErrorToast, showLoadingToast, dismissToast } from '../../utils/toast';
import './CreatePostModal.css';

/**
 * Create Post Modal
 * Allows users to create new posts and schedule them
 */
const CreatePostModal = ({ isOpen, onClose, onPostCreated, selectedDate = null, user = null }) => {
  const [step, setStep] = useState('details'); // 'details' or 'schedule'
  const [loading, setLoading] = useState(false);
  const [createdPostData, setCreatedPostData] = useState(null);

  // Form state
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState('Friendly');
  const [numWords, setNumWords] = useState('150');
  const [customContent, setCustomContent] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  // Schedule state
  const [scheduledDate, setScheduledDate] = useState(
    selectedDate ? selectedDate.toISOString().split('T')[0] : ''
  );
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [platform, setPlatform] = useState('facebook');

  const tones = [
    'Professional',
    'Creative',
    'Friendly',
    'Casual',
    'Witty',
    'Sarcastic',
    'Motivational',
    'Empowering',
  ];

  const platforms = [
    { id: 'facebook', label: 'Facebook', icon: '👍' },
    { id: 'instagram', label: 'Instagram', icon: '📷' },
    { id: 'twitter', label: 'Twitter', icon: '𝕏' },
    { id: 'linkedin', label: 'LinkedIn', icon: '💼' },
  ];

  const handleCreatePost = async (e) => {
    e.preventDefault();
    
    if (!useCustom && !topic.trim()) {
      showErrorToast('❌ Please enter a topic');
      return;
    }

    if (useCustom && !customContent.trim()) {
      showErrorToast('❌ Please enter post content');
      return;
    }

    setLoading(true);
    const toastId = showLoadingToast('⏳ Creating post...');

    try {
      if (useCustom) {
        // Use custom content directly
        setCreatedPostData({
          content: customContent,
          tone: tone,
        });
      } else {
        // Generate post from topic
        const postData = await createPost(user?.token, {
          topic: topic.trim(),
          tone: tone,
          numWords: parseInt(numWords),
        });
        setCreatedPostData(postData);
      }

      dismissToast(toastId);
      showSuccessToast('✅ Post created! Now schedule it.');
      setStep('schedule');
    } catch (error) {
      dismissToast(toastId);
      showErrorToast(`❌ ${error.message}`);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSchedulePost = async (e) => {
    e.preventDefault();

    if (!scheduledDate) {
      showErrorToast('❌ Please select a date');
      return;
    }

    setLoading(true);
    const toastId = showLoadingToast('⏳ Scheduling post...');

    try {
      const dateTime = `${scheduledDate}T${scheduledTime}:00`;
      await schedulePost(user?.token, {
        content: createdPostData.content,
        scheduledTime: dateTime,
        platform: platform,
        tone: createdPostData.tone,
      });

      dismissToast(toastId);
      showSuccessToast('✅ Post scheduled successfully!');
      handleClose();
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (error) {
      dismissToast(toastId);
      showErrorToast(`❌ ${error.message}`);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('details');
    setTopic('');
    setCustomContent('');
    setTone('Friendly');
    setNumWords('150');
    setUseCustom(false);
    setScheduledDate(selectedDate ? selectedDate.toISOString().split('T')[0] : '');
    setScheduledTime('09:00');
    setPlatform('facebook');
    setCreatedPostData(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="modal-overlay"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleClose}
          />

          {/* Modal Content */}
          <motion.div
            className="create-post-modal"
            variants={modalContentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Header */}
            <div className="modal-header">
              <h2>
                {step === 'details' ? '✍️ Create New Post' : '📅 Schedule Post'}
              </h2>
              <button className="modal-close-btn" onClick={handleClose}>
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="modal-body">
              {step === 'details' ? (
                /* Step 1: Create Post Details */
                <form onSubmit={handleCreatePost}>
                  {/* Toggle between AI generation and custom */}
                  <div className="toggle-section">
                    <button
                      type="button"
                      className={`toggle-btn ${!useCustom ? 'active' : ''}`}
                      onClick={() => setUseCustom(false)}
                    >
                      🤖 AI Generate
                    </button>
                    <button
                      type="button"
                      className={`toggle-btn ${useCustom ? 'active' : ''}`}
                      onClick={() => setUseCustom(true)}
                    >
                      ✏️ Write Manually
                    </button>
                  </div>

                  {/* AI Generation Fields */}
                  {!useCustom ? (
                    <>
                      <div className="form-group">
                        <label htmlFor="topic">📌 Post Topic *</label>
                        <input
                          type="text"
                          id="topic"
                          placeholder="e.g., New product launch, team celebration..."
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          className="form-input"
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="tone">🎨 Tone</label>
                          <select
                            id="tone"
                            value={tone}
                            onChange={(e) => setTone(e.target.value)}
                            className="form-select"
                          >
                            {tones.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label htmlFor="numWords">📝 Word Count</label>
                          <input
                            type="number"
                            id="numWords"
                            min="50"
                            max="500"
                            step="50"
                            value={numWords}
                            onChange={(e) => setNumWords(e.target.value)}
                            className="form-input"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Custom Content Fields */}
                      <div className="form-group">
                        <label htmlFor="customContent">📝 Post Content *</label>
                        <textarea
                          id="customContent"
                          placeholder="Write your post content here..."
                          value={customContent}
                          onChange={(e) => setCustomContent(e.target.value)}
                          className="form-textarea"
                          rows="6"
                        />
                        <div className="char-count">
                          {customContent.length} characters
                        </div>
                      </div>

                      <div className="form-group">
                        <label htmlFor="tone">🎨 Tone (for reference)</label>
                        <select
                          id="tone"
                          value={tone}
                          onChange={(e) => setTone(e.target.value)}
                          className="form-select"
                        >
                          {tones.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {/* Form Actions */}
                  <div className="form-actions">
                    <motion.button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleClose}
                      variants={buttonHoverVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      className="btn btn-primary"
                      disabled={loading}
                      variants={buttonHoverVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      {loading ? '⏳ Creating...' : 'Next: Schedule →'}
                    </motion.button>
                  </div>
                </form>
              ) : (
                /* Step 2: Schedule Post */
                <form onSubmit={handleSchedulePost}>
                  {/* Preview of created post */}
                  <div className="post-preview">
                    <h3>📄 Preview</h3>
                    <div className="preview-content">
                      {createdPostData?.content && (
                        <p>{createdPostData.content.substring(0, 200)}...</p>
                      )}
                    </div>
                  </div>

                  {/* Schedule Fields */}
                  <div className="form-group">
                    <label htmlFor="scheduledDate">📅 Scheduled Date *</label>
                    <input
                      type="date"
                      id="scheduledDate"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="form-input"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="scheduledTime">🕐 Scheduled Time</label>
                      <input
                        type="time"
                        id="scheduledTime"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label>📱 Platform</label>
                      <div className="platform-selector">
                        {platforms.map((p) => (
                          <motion.button
                            key={p.id}
                            type="button"
                            className={`platform-btn ${
                              platform === p.id ? 'active' : ''
                            }`}
                            onClick={() => setPlatform(p.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <span className="platform-icon">{p.icon}</span>
                            <span className="platform-label">{p.label}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="form-actions">
                    <motion.button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setStep('details')}
                      variants={buttonHoverVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      ← Back
                    </motion.button>
                    <motion.button
                      type="submit"
                      className="btn btn-success"
                      disabled={loading}
                      variants={buttonHoverVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      {loading ? '⏳ Scheduling...' : '✅ Schedule Post'}
                    </motion.button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreatePostModal;
