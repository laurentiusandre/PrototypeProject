import axios from 'axios';

const instance = axios.create({
  baseURL: `https://geocoding-api.open-meteo.com/v1/`
});

export default instance;