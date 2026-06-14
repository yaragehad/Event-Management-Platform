import axios from 'axios'

const API = axios.create({ baseURL: 'http://localhost:5000/api' })

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