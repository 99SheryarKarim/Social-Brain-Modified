import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  calendarGridVariants,
  calendarDayVariants,
  monthTransitionVariants,
  slideLeftVariants,
  slideRightVariants,
  slideUpVariants,
  staggerContainerVariants,
  staggerItemVariants,
} from '../../utils/animations';
import { getScheduledPosts } from '../../services/calendarService';
import { showErrorToast, showLoadingToast, dismissToast } from '../../utils/toast';
import CalendarDayCell from './CalendarDayCell';
import CalendarPostCard from './CalendarPostCard';
import CalendarSidebar from './CalendarSidebar';
import CalendarHeader from './CalendarHeader';
import CreatePostModal from './CreatePostModal';
import './SmartContentCalendar.css';

/**
 * Smart Content Calendar Component
 * 
 * Features:
 * - Interactive calendar with real user posts
 * - Drag & drop functionality
 * - Multiple view modes (month, week, agenda)
 * - Create & schedule posts
 * - Smooth animations and transitions
 */
const SmartContentCalendar = ({ user = null }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [viewMode, setViewMode] = useState('month');
  const [showSidebar, setShowSidebar] = useState(true);
  const [posts, setPosts] = useState([]);
  const [draggedPost, setDraggedPost] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDateForPost, setSelectedDateForPost] = useState(null);

  // Fetch posts from backend
  useEffect(() => {
    if (user?.token) {
      fetchPosts();
    }
  }, [user?.token]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await getScheduledPosts(user?.token);
      
      // Transform backend data to match our calendar format
      const transformedPosts = (data || [])
        .filter((post) => (post.platform || 'facebook').toLowerCase() === 'facebook')
        .map((post) => ({
          id: post.id,
          title: post.content?.substring(0, 50) || 'Untitled Post',
          content: post.content || '',
          date: new Date(post.scheduledTime),
          status: determineStatus(post.status, post.scheduledTime),
          platform: post.platform || 'facebook',
          engagement: post.engagement || 0,
          image: getPlatformEmoji(post.platform),
        }));

      setPosts(transformedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      showErrorToast('❌ Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  const determineStatus = (status, scheduledTime) => {
    if (status) return status.toLowerCase();
    
    const scheduled = new Date(scheduledTime);
    const now = new Date();
    
    if (scheduled > now) {
      return 'scheduled';
    } else if (scheduled <= now) {
      return 'published';
    }
    return 'draft';
  };

  const getPlatformEmoji = (platform) => {
    const emojis = {
      facebook: '👍',
      instagram: '📷',
      twitter: '𝕏',
      linkedin: '💼',
      default: '📱',
    };
    return emojis[platform?.toLowerCase()] || emojis.default;
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getPostsForDay = (day) => {
    return posts.filter((post) => {
      const postDate = new Date(post.date);
      return (
        postDate.getDate() === day &&
        postDate.getMonth() === currentDate.getMonth() &&
        postDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    setSelectedDay(null);
  };

  const handleAddPost = (day) => {
    const dateForPost = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDateForPost(dateForPost);
    setShowCreateModal(true);
  };

  const handlePostCreated = () => {
    fetchPosts(); // Refresh posts after creating new one
  };

  const handleDrop = (e, day) => {
    e.preventDefault();
    if (draggedPost) {
      const updatedPosts = posts.map((post) =>
        post.id === draggedPost.id
          ? {
              ...post,
              date: new Date(currentDate.getFullYear(), currentDate.getMonth(), day),
            }
          : post
      );
      setPosts(updatedPosts);
      setDraggedPost(null);
    }
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const emptyDays = Array(firstDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const monthYear = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const stats = {
    scheduled: posts.filter((p) => p.status === 'scheduled').length,
    published: posts.filter((p) => p.status === 'published').length,
    drafts: posts.filter((p) => p.status === 'draft').length,
    engagement: posts.reduce((sum, p) => sum + (p.engagement || 0), 0),
  };

  if (loading) {
    return (
      <motion.div
        className="smart-calendar-container loading"
        variants={slideUpVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading your calendar...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="smart-calendar-container"
      variants={slideUpVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <CalendarHeader
        monthYear={monthYear}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onPreviousMonth={handlePreviousMonth}
        onNextMonth={handleNextMonth}
        onToggleSidebar={() => setShowSidebar(!showSidebar)}
        onCreatePost={() => {
          setSelectedDateForPost(null);
          setShowCreateModal(true);
        }}
        stats={stats}
      />

      <div className="calendar-main-layout">
        {/* Calendar Grid */}
        <motion.div
          className="calendar-grid-wrapper"
          variants={slideLeftVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Weekday Headers */}
          <div className="calendar-weekdays">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <motion.div
                key={day}
                className="weekday-header"
                variants={staggerItemVariants}
              >
                {day}
              </motion.div>
            ))}
          </div>

          {/* Calendar Days Grid */}
          <motion.div
            className="calendar-days"
            variants={calendarGridVariants}
            initial="hidden"
            animate="visible"
          >
            {emptyDays.map((_, index) => (
              <div key={`empty-${index}`} className="calendar-day empty" />
            ))}

            {days.map((day) => {
              const dayPosts = getPostsForDay(day);
              const isSelected = selectedDay === day;
              const isToday =
                day === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear();

              return (
                <motion.div
                  key={day}
                  variants={calendarDayVariants}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, day)}
                >
                  <CalendarDayCell
                    day={day}
                    isSelected={isSelected}
                    isToday={isToday}
                    posts={dayPosts}
                    onSelectDay={() => setSelectedDay(day)}
                    onAddPost={() => handleAddPost(day)}
                    setDraggedPost={setDraggedPost}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Sidebar with post details */}
        <AnimatePresence>
          {showSidebar && (
            <CalendarSidebar
              selectedDay={selectedDay}
              posts={posts.filter((post) => {
                if (!selectedDay) return false;
                const postDate = new Date(post.date);
                return (
                  postDate.getDate() === selectedDay &&
                  postDate.getMonth() === currentDate.getMonth() &&
                  postDate.getFullYear() === currentDate.getFullYear()
                );
              })}
              onClose={() => setShowSidebar(false)}
              setPosts={setPosts}
              onAddPost={() => handleAddPost(selectedDay)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onPostCreated={handlePostCreated}
        selectedDate={selectedDateForPost}
        user={user}
      />
    </motion.div>
  );
};

export default SmartContentCalendar;
