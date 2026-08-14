import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  postCardDepthVariants,
  statusBadgeVariants,
  dragPostVariants,
  slideRightVariants,
} from '../../utils/animations';

const CalendarPostCard = ({ post, onEdit, onDelete, setPosts, posts }) => {
  const [showActions, setShowActions] = useState(false);

  const handleStatusChange = (newStatus) => {
    const updated = posts.map((p) =>
      p.id === post.id ? { ...p, status: newStatus } : p
    );
    setPosts(updated);
  };

  const platformColors = {
    facebook: '#1877F2',
    instagram: '#E4405F',
    twitter: '#1DA1F2',
    linkedin: '#0A66C2',
  };

  const statusColors = {
    draft: '#FFA500',
    scheduled: '#4A90E2',
    published: '#50C878',
    failed: '#FF6B6B',
  };

  return (
    <motion.div
      className="calendar-post-card"
      variants={dragPostVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      onDragStart={(e) => e.stopPropagation()}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Post Header */}
      <div className="post-card-header">
        <div className="post-meta">
          <motion.div
            className="post-platform-badge"
            style={{ backgroundColor: platformColors[post.platform] }}
            variants={statusBadgeVariants}
            initial="initial"
            animate="animate"
          >
            {getServiceIcon(post.platform)}
          </motion.div>
          <span className="post-platform-name">{post.platform}</span>
        </div>

        <motion.div
          className="post-status"
          style={{ backgroundColor: statusColors[post.status] }}
          animate={{
            boxShadow: [
              `0 0 0 0 ${statusColors[post.status]}80`,
              `0 0 0 8px ${statusColors[post.status]}00`,
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="status-icon">{getStatusIcon(post.status)}</span>
          <span className="status-text">{post.status}</span>
        </motion.div>
      </div>

      {/* Post Content */}
      <div className="post-card-content">
        <div className="post-image-placeholder">
          <span className="large-emoji">{post.image}</span>
        </div>

        <h3 className="post-title">{post.title}</h3>
        <p className="post-excerpt">{post.content.substring(0, 80)}...</p>
      </div>

      {/* Engagement Stats */}
      <div className="post-stats">
        {post.status === 'published' && (
          <motion.div
            className="stat-row"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="stat-label">❤️ Engagement:</span>
            <span className="stat-value">{post.engagement}</span>
          </motion.div>
        )}
        <div className="stat-row">
          <span className="stat-label">📅 Date:</span>
          <span className="stat-value">
            {new Date(post.date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* Status Transition Buttons */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            className="post-actions"
            variants={slideRightVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {post.status === 'draft' && (
              <>
                <motion.button
                  className="action-btn schedule-btn"
                  onClick={() => handleStatusChange('scheduled')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Schedule this post"
                >
                  🕐 Schedule
                </motion.button>
                <motion.button
                  className="action-btn publish-btn"
                  onClick={() => handleStatusChange('published')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Publish now"
                >
                  ✅ Publish
                </motion.button>
              </>
            )}

            {post.status === 'scheduled' && (
              <>
                <motion.button
                  className="action-btn edit-btn"
                  onClick={() => onEdit(post)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Edit post"
                >
                  ✏️ Edit
                </motion.button>
              </>
            )}

            <motion.button
              className="action-btn delete-btn"
              onClick={() => onDelete(post.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Delete post"
            >
              🗑️
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drag Hint */}
      <motion.div
        className="drag-hint"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 0.6 }}
        transition={{ duration: 0.2 }}
      >
        ⋮⋮⋮
      </motion.div>
    </motion.div>
  );
};

function getStatusIcon(status) {
  const icons = {
    draft: '✏️',
    scheduled: '🕐',
    published: '✅',
    failed: '❌',
  };
  return icons[status] || '📝';
}

function getServiceIcon(platform) {
  const icons = {
    facebook: 'f',
    instagram: '📷',
    twitter: '𝕏',
    linkedin: 'in',
  };
  return icons[platform] || '📱';
}

export default CalendarPostCard;
