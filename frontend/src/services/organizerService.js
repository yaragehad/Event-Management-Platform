import axios from 'axios'

const API = axios.create({ baseURL: 'http://localhost:3001/api' })

export const getDashboardSummary = (organizerId) =>
  API.get(`/organizer/dashboard/${organizerId}`)

export const getOrganizerEvents = (organizerId, filters = {}) =>
  API.get(`/organizer/events/${organizerId}`, { params: filters })

export const getOrganizerTasks = (organizerId, filters = {}) =>
  API.get(`/organizer/tasks/${organizerId}`, { params: filters })

export const getOrganizerStaff = (organizerId, filters = {}) =>
  API.get(`/organizer/staff/${organizerId}`, { params: filters })

export const getOrganizerGuests = (organizerId, filters = {}) =>
  API.get(`/organizer/guests/${organizerId}`, { params: filters })

export const getVendors = (filters = {}) =>
  API.get(`/organizer/vendors`, { params: filters })

export const getEventBudget = (eventId) =>
  API.get(`/organizer/budget/${eventId}`)
