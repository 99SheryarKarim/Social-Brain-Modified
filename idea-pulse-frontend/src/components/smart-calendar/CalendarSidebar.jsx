import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  expandVariants,
  postListVariants,
  staggerItemVariants,
  slideRightVariants,
} from '../../utils/animations';
import CalendarPostCard from './CalendarPostCard';

const CalendarSidebar = ({ selectedDay, posts, onClose, setPosts, onAddPost }) => {
  const [editingPostId, setEditingPostId] = useState(null);

  const handleDeletePost = (postId) => {
    const updated = posts.filter((p) => p.id !== postId);
    setPosts(updated);
  };

  const handleEditPost = (post) => {
    setEditingPostId(post.id);
    // Open edit modal here
  };

  return (
    <motion.div
      className="calendar-sidebar"
      variants={expandVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Sidebar Header */}
      <motion.div className="sidebar-header" variants={staggerItemVariants}>
        <div className="header-content">
          <h3 className="sidebar-title">
            📅 {selectedDay ? `Day ${selectedDay}` : 'Select a Day'}
          </h3>
          <p className="sidebar-subtitle">
            {posts.length} {posts.length === 1 ? 'post' : 'posts'} scheduled
          </p>
        </div>
        <motion.button
          className="close-btn"
          onClick={onClose}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Close sidebar"
        >
          ✕
        </motion.button>
      </motion.div>

      {/* Posts List */}
      <motion.div
        className="sidebar-content"
        variants={postListVariants}
        initial="hidden"
        animate="visible"
      >
        {!selectedDay ? (
          <motion.div
            className="no-selection"
            variants={staggerItemVariants}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="no-selection-icon">📍</span>
            <p>Select a day to view or manage posts</p>
          </motion.div>
        ) : posts.length === 0 ? (
          <motion.div
            className="empty-day"
            variants={staggerItemVariants}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <span className="empty-icon">✨</span>
            <p>No posts scheduled for this day</p>
            <motion.button
              className="add-post-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>+</span> Add Post
            </motion.button>
          </motion.div>
        ) : (
          <div className="posts-list">
            <AnimatePresence mode="popLayout">
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <CalendarPostCard
                    post={post}
                    onEdit={handleEditPost}
                    onDelete={handleDeletePost}
                    setPosts={setPosts}
                    posts={posts}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>

      {/* Sidebar Footer */}
      {selectedDay && posts.length > 0 && (
        <motion.div
          className="sidebar-footer"
          variants={staggerItemVariants}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.button
            className="add-post-footer-btn"
            onClick={onAddPost}
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="btn-icon">+</span>
            <span>Add Another Post</span>
          </motion.button>

          <motion.button
            className="bulk-actions-btn"
            whileHover={{ scale: 1.05, x: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="btn-icon">⚙️</span>
            <span>Bulk Actions</span>
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default CalendarSidebar;
