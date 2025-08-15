# Projet Chatbot COMAR

## 1. Présentation

Le Chatbot COMAR est un assistant virtuel intelligent conçu pour fournir rapidement des informations sur COMAR Assurances.  

Il permet aux utilisateurs d’obtenir des réponses fiables concernant les agences, les différentes branches, les événements, ainsi que d’autres informations clés sur l’entreprise.  

L’objectif est d’offrir un service interactif, accessible en ligne et capable de comprendre et répondre aux demandes de manière pertinente.

---

## 2. Fonctionnement

1. **Saisie de la question** par l’utilisateur via l’interface web.  
2. **Recherche des informations** pertinentes dans une base de connaissances construite à partir de données internes et publiques.  
3. **Génération de la réponse** grâce à l’approche **RAG** (Retrieval-Augmented Generation), qui combine :  
   - La recherche d’informations les plus pertinentes.  
   - La génération finale de texte via l’**API Mistral**.

---

## 3. Technologies utilisées

### 3.1 Frontend

- **Répertoire : `frontend/`**  
- React – Interface utilisateur  
- TypeScript – Typage statique  
- Ant Design – Composants UI modernes  
- Leaflet – Carte interactive (localisation d’agences, fonctionnalité secondaire)  
- Axios – Requêtes HTTP  
- Day.js – Gestion des dates  
- Marked – Affichage de texte Markdown  

📄 Liste complète des dépendances : `frontend/requirements-frontend.txt`  

---

### 3.2 Backend

- **Répertoire : `backend/`**  
- FastAPI – Serveur backend  
- Uvicorn – Serveur ASGI  
- Sentence Transformers – Génération des représentations textuelles  
- Transformers – Utilisation du modèle Mistral API  
- SlowAPI – Limitation des requêtes  
- Scikit-learn, NumPy, SciPy – Calculs et analyses  

📄 Liste complète des dépendances : `backend/requirements.txt`  

---

## 4. Installation et exécution

### 4.1 Cloner le projet

```bash
git clone https://github.com/emna9/Chatbot.git
cd Chatbot

4.2 Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000

4.3 Frontend
cd ../frontend
npm install $(cat requirements-frontend.txt)
npm start