import axios from 'axios'

const API = axios.create({ baseURL: 'http://localhost:3001/api' })

export const getAllVenues = (filters) =>
  API.get('/venues', { params: filters })

export const getVenueById = (id) =>
  API.get(`/venues/${id}`)

export const createVenue = (data) =>
  API.post('/venues', data)

export const updateVenue = (id, data) =>
  API.put(`/venues/${id}`, data)

export const deleteVenue = (id) =>
  API.delete(`/venues/${id}`)

export const permanentlyDeleteVenue = (id) =>
  API.delete(`/venues/${id}/permanent`)

export const getBookings = (filters) =>
  API.get('/bookings', { params: filters })

export const createBooking = (data) =>
  API.post('/bookings', data)

export const updateBookingStatus = (id, status) =>
  API.put(`/bookings/${id}/status`, { status })

export const getLayout = (venueId) =>
  API.get(`/layouts/${venueId}`)

export const saveLayout = (data) =>
  API.post('/layouts', data)

export const getVenueAnalytics = (ownerId) =>
  API.get(`/analytics/venue/${ownerId}`)

export const getUserProfile = () =>
  API.get('/users/profile', { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })

export const updateUserProfile = (data) =>
  API.put('/users/profile', data, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })

export const getNotifications = (userId) =>
  API.get(`/notifications/${userId}`)

export const markNotificationRead = (id) =>
  API.put(`/notifications/${id}/read`)

export const markAllNotificationsRead = (userId) =>
  API.put(`/notifications/read-all/${userId}`)

export const getBookingMessages = (bookingId) =>
  API.get(`/bookings/${bookingId}/messages`)

export const sendBookingMessage = (bookingId, data) =>
  API.post(`/bookings/${bookingId}/messages`, data)