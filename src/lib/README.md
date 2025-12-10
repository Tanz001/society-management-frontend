# Configuration Axios

Ce fichier configure une instance axios avec :
- Ajout automatique du token d'authentification depuis localStorage
- Gestion automatique des erreurs 401 (redirection vers login)
- Mise à jour automatique du token si le backend en renvoie un nouveau

## Utilisation

Au lieu d'importer `axios` directement, utilisez l'instance configurée :

```typescript
// ❌ Ancien code
import axios from "axios";
const response = await axios.get(`${API_URL}/user/profile`);

// ✅ Nouveau code
import apiClient from "@/lib/axios";
const response = await apiClient.get("/user/profile");
```

Le token sera automatiquement ajouté à toutes les requêtes !


