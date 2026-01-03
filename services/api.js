// services/api.js
import axios from 'axios';

// เปลี่ยน IP ตามเครื่องของคุณ (Android Emulator: 10.0.2.2, เครื่องจริง: IP ของคอมฯ)
const BASE_URL = 'http://10.0.2.2:5000'; 

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});