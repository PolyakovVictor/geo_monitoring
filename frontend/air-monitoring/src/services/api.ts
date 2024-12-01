import axios from "axios";

const API_URL = "http://localhost:8000/api";

export const fetchSensorData = async () => {
    const response = await axios.get(`${API_URL}/simulation/sensors`);
    return response.data;
};

export const fetchRegionsData = async () => {
    const response = await axios.get(`${API_URL}/regions`);
    return response.data; // Очікуємо, що бекенд повертає список
  };
