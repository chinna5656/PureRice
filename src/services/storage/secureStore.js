// src/services/storage/secureStore.js
import { getItemAsync, setItemAsync, deleteItemAsync } from 'expo-secure-store';

const TOKEN_KEY = "auth_token";
const LOGGED_IN_KEY = "isLoggedIn";

export const saveToken = async (token) => {
  await setItemAsync(TOKEN_KEY, token);
};

export const getToken = async () => {
  return await getItemAsync(TOKEN_KEY);
};

export const deleteToken = async () => {
  await deleteItemAsync(TOKEN_KEY);
};

export const saveLoggedIn = async (value) => {
  await setItemAsync(LOGGED_IN_KEY, value);
};

export const getLoggedIn = async () => {
  return await getItemAsync(LOGGED_IN_KEY);
};

export const deleteLoggedIn = async () => {
  await deleteItemAsync(LOGGED_IN_KEY);
};