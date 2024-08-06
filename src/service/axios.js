import axios from "axios";

export default axios;

const backendURL ='http://103.188.175.175';

axios.defaults.baseURL = backendURL+':8000/api';

// For common config
axios.defaults.headers.common['token'] = localStorage.getItem('token');

const axiosHR = axios.create({
    baseURL: backendURL+':8000/api'
});

const axiosProject = axios.create({
    baseURL: backendURL+':8021/api'
});

const axiosMaintenance = axios.create({
  baseURL: backendURL+':58206/api/v1'
});

const axiosAf = axios.create({
  baseURL: backendURL+':8022/api'
});

const axiosManagement = axios.create({
  baseURL: backendURL+':8023/api'
});

const axiosCpSmart = axios.create({
  baseURL: backendURL+':58301/api/v1'
});

export {
  axiosHR,
  axiosProject,
  axiosAf,
  axiosMaintenance,
  axiosManagement,
  axiosCpSmart,
};