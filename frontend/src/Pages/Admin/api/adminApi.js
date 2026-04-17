import axios from "axios";
import API_BASE_URL from "../../../config/api.config";

const cred = { withCredentials: true };

export async function fetchAdminStats() {
  const res = await axios.get(`${API_BASE_URL}/admin/stats`, cred);
  return res.data.data;
}

export async function fetchAdminUsers() {
  const res = await axios.get(`${API_BASE_URL}/auth/users`, cred);
  return res.data.users || [];
}

export async function fetchAllSocieties() {
  const res = await axios.get(`${API_BASE_URL}/societies/Allsocieties`, cred);
  return res.data.data || [];
}

export async function fetchAdminEvents() {
  const res = await axios.get(`${API_BASE_URL}/admin/events`, cred);
  return res.data.data || [];
}

export async function fetchAdminElections() {
  const res = await axios.get(`${API_BASE_URL}/admin/elections`, cred);
  return res.data.data || [];
}

export async function fetchAdminUser(userId) {
  const res = await axios.get(`${API_BASE_URL}/admin/users/${userId}`, cred);
  return res.data.data;
}

export async function fetchAdminSociety(societyId) {
  const res = await axios.get(`${API_BASE_URL}/admin/societies/${societyId}`, cred);
  return res.data.data;
}

export async function fetchAdminSocietyEvents(societyId) {
  const res = await axios.get(`${API_BASE_URL}/admin/societies/${societyId}/events`, cred);
  return res.data.data || [];
}

export async function fetchAdminEvent(eventId) {
  const res = await axios.get(`${API_BASE_URL}/admin/events/${eventId}`, cred);
  return res.data.data;
}

export async function fetchAdminElection(electionId) {
  const res = await axios.get(`${API_BASE_URL}/admin/elections/${electionId}`, cred);
  return res.data.data;
}
