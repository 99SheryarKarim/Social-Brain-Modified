import React from 'react';
import { motion } from 'framer-motion';
import SmartContentCalendar from '../../components/smart-calendar/SmartContentCalendar';
import { pageTransitionVariants } from '../../utils/animations';

/**
 * Calendar Page
 * 
 * Full-page view for the Smart Content Calendar
 * Features comprehensive post scheduling and management
 */
const CalendarPage = ({ user = null }) => {
  return (
    <motion.div
      className="calendar-page"
      variants={pageTransitionVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      style={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#ffffff',
      }}
    >
      <SmartContentCalendar user={user} />
    </motion.div>
  );
};

export default CalendarPage;
