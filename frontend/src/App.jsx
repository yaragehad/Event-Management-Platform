import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import InvitationPage from './pages/InvitationPage'
import RSVPPage from './pages/RSVPPage'
import DayOfMessagesPage from './pages/DayOfMessagesPage'
import CheckInPage from './pages/CheckInPage'
import FeedbackPage from './pages/FeedbackPage'
import DayOfDashboardPage from './pages/DayOfDashboardPage'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/invitation/:eventId" element={<InvitationPage />} />
        <Route path="/rsvp/:eventId" element={<RSVPPage />} />
        <Route path="/messages/:eventId" element={<DayOfMessagesPage />} />
        <Route path="/checkin/:eventId" element={<CheckInPage />} />
        <Route path="/feedback/:eventId" element={<FeedbackPage />} />
        <Route path="/dashboard/:eventId" element={<DayOfDashboardPage />} />
      </Routes>
    </Router>
  )
}

export default App