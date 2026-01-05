// services/api.js
import axios from 'axios';

// เปลี่ยน IP ตามเครื่องของคุณ (Android Emulator: 10.0.2.2, เครื่องจริง: IP ของคอมฯ)
const BASE_URL = 'http://192.168.1.16:8000'; 

export const API_URL = BASE_URL;
export const API_AI = BASE_URL;

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});