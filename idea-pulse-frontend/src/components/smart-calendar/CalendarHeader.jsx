import React from 'react';
import { motion } from 'framer-motion';
import {
  staggerContainerVariants,
  staggerItemVariants,
  buttonHoverVariants,
} from '../../utils/animations';

const CalendarHeader = ({
  monthYear,
  viewMode,
  setViewMode,
  onPreviousMonth,
  onNextMonth,
  onToggleSidebar,
  onCreatePost,
  stats = { scheduled: 0, published: 0, drafts: 0, engagement: 0 },
}) => {
  const viewModes = [
    { id: 'month', label: '📅 Month', icon: '📅' },
    { id: 'week', label: '📋 Week', icon: '📋' },
    { id: 'agenda', label: '📝 Agenda', icon: '📝' },
  ];

  return (
    <motion.div
      className="calendar-header"
      variants={staggerContainerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="header-content" variants={staggerItemVariants}>
        <div className="header-title-section">
          <h1 className="calendar-title">
            <span className="title-icon">📅</span>
            Smart Content Calendar
          </h1>
          <p className="calendar-subtitle">Manage and schedule your social media posts</p>
        </div>

        <div className="header-controls">
          {/* Navigation Buttons */}
          <div className="nav-buttons">
            <motion.button
              className="nav-btn prev-btn"
              onClick={onPreviousMonth}
              variants={buttonHoverVariants}
              whileHover="hover"
              whileTap="tap"
              title="Previous month"
            >
              <span>←</span>
            </motion.button>

            <div className="month-display">
              <motion.span
                className="month-year"
                key={monthYear}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {monthYear}
              </motion.span>
            </div>

            <motion.button
              className="nav-btn next-btn"
              onClick={onNextMonth}
              variants={buttonHoverVariants}
              whileHover="hover"
              whileTap="tap"
              title="Next month"
            >
              <span>→</span>
            </motion.button>
          </div>

          {/* View Mode Selector */}
          <div className="view-mode-selector">
            {viewModes.map((mode) => (
              <motion.button
                key={mode.id}
                className={`view-mode-btn ${viewMode === mode.id ? 'active' : ''}`}
                onClick={() => setViewMode(mode.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                variants={buttonHoverVariants}
              >
                <span className="mode-icon">{mode.icon}</span>
                <span className="mode-label">{mode.label.split(' ')[1]}</span>
              </motion.button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <motion.button
              className="toggle-sidebar-btn"
              onClick={onToggleSidebar}
              title="Toggle sidebar"
              variants={buttonHoverVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <span>⧉</span>
            </motion.button>

            <motion.button
              className="create-post-btn"
              onClick={onCreatePost}
              variants={buttonHoverVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <span className="btn-icon">+</span>
              <span className="btn-text">New Post</span>
            </motion.button>

            <motion.button
              className="filter-btn"
              title="Filter posts"
              variants={buttonHoverVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <span>⚙️</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Stats Bar */}
      <motion.div
        className="stats-bar"
        variants={staggerItemVariants}
      >
        <div className="stat-item">
          <span className="stat-label">Scheduled</span>
          <span className="stat-value">{stats.scheduled}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Published</span>
          <span className="stat-value">{stats.published}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Drafts</span>
          <span className="stat-value">{stats.drafts}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Engagement</span>
          <span className="stat-value">{stats.engagement.toLocaleString()}</span>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CalendarHeader;
