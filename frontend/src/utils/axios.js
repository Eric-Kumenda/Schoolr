import axios from 'axios'

const api = axios.create({
  baseURL: 'https://192.168.100.11:5000/api',
  withCredentials: true,
})

let storeRef = null

export const injectStore = (_store) => {
  storeRef = _store
}

api.interceptors.response.use(
  res => res,
  async error => {
    const originalRequest = error.config
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const res = await api.get('/auth/refresh', {
          withCredentials: true,
        })
        console.log(res.data.token)
        const newToken = res.data.token

        if (storeRef) {
          storeRef.dispatch({ type: 'auth/setToken', payload: newToken })
        }

        originalRequest.headers['Authorization'] = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (err) {
        return Promise.reject(err)
      }
    }
    return Promise.reject(error)
  }
)

export default api
