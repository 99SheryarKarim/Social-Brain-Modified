import React from 'react';
import { motion } from 'framer-motion';
import {
  dayCell3DVariants,
  postCardDepthVariants,
  floatingIndicatorVariants,
  pulseHighlightVariants,
} from '../../utils/animations';

const CalendarDayCell = ({
  day,
  isSelected,
  isToday,
  posts,
  onSelectDay,
  onAddPost,
  setDraggedPost,
}) => {
  const hasMultiplePosts = posts.length > 2;

  return (
    <motion.div
      className={`calendar-day-cell ${isSelected ? 'selected' : ''} ${
        isToday ? 'today' : ''
      }`}
      variants={dayCell3DVariants}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      onClick={onSelectDay}
      style={{
        perspective: '1000px',
      }}
    >
      {/* Background glow for today */}
      {isToday && (
        <motion.div
          className="cell-glow"
          variants={pulseHighlightVariants}
          animate="animate"
        />
      )}

      {/* Day Number */}
      <div className="day-number">
        <span className={isToday ? 'today-indicator' : ''}>{day}</span>
        {isToday && <motion.span className="today-dot" layoutId="todayDot" />}
      </div>

      {/* Posts Container */}
      <div className="posts-container">
        {posts.length === 0 ? (
          <motion.div
            className="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            whileHover={{ opacity: 1 }}
            onClick={(e) => {
              e.stopPropagation();
              onAddPost();
            }}
          >
            <span className="add-icon">+</span>
          </motion.div>
        ) : (
          <>
            {/* Show first 2 posts */}
            {posts.slice(0, 2).map((post, index) => (
              <motion.div
                key={post.id}
                className={`post-indicator ${post.status}`}
                variants={postCardDepthVariants}
                initial="initial"
                whileHover="hover"
                draggable
                onDragStart={() => setDraggedPost(post)}
                onDragEnd={() => setDraggedPost(null)}
                title={post.title}
                style={{
                  marginTop: `${index * 6}px`,
                  zIndex: posts.length - index,
                }}
              >
                <span className="post-emoji">{post.image}</span>
                <span className="post-status-badge" title={post.status}>
                  {getStatusIcon(post.status)}
                </span>
              </motion.div>
            ))}

            {/* Show indicator if more posts */}
            {hasMultiplePosts && (
              <motion.div
                className="more-posts-badge"
                variants={floatingIndicatorVariants}
                animate="animate"
              >
                +{posts.length - 2}
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Post count indicator */}
      {posts.length > 0 && (
        <div className="post-count">
          <span className="count-badge">{posts.length}</span>
        </div>
      )}
    </motion.div>
  );
};

// Helper function to get status icon
function getStatusIcon(status) {
  const icons = {
    draft: '✏️',
    scheduled: '🕐',
    published: '✅',
    failed: '❌',
  };
  return icons[status] || '📝';
}

export default CalendarDayCell;
