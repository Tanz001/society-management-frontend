import axios from "axios";

// Créer une instance axios avec configuration de base
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor pour ajouter automatiquement le token à toutes les requêtes
apiClient.interceptors.request.use(
  (config) => {
    // Récupérer le token depuis localStorage
    const token = localStorage.getItem("token");
    
    if (token) {
      // Ajouter le token dans le header Authorization
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor pour gérer les erreurs de réponse (401, 403, etc.)
apiClient.interceptors.response.use(
  (response) => {
    // Si le backend renvoie un nouveau token (après validation d'un token externe)
    const newToken = response.headers['x-new-token'];
    if (newToken) {
      // Mettre à jour le token dans localStorage
      localStorage.setItem("token", newToken);
      console.log("Token updated from backend");
    }
    
    return response;
  },
  (error) => {
    // Si le token est invalide ou expiré, rediriger vers la page de login
    if (error.response?.status === 401) {
      // Nettoyer le localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Rediriger vers la page de login seulement si on n'est pas déjà sur la page de login
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;

