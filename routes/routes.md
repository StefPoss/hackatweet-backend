# 📁 routes.md – API Hackatweet

---

## UTILISATEURS

---

### 🔹 POST /users/signup

→ Inscription d’un nouvel utilisateur

- Requête `x-www-form-urlencoded`
- Champs obligatoires :

  - `username` (string)
  - `firstname` (string)
  - `email` (string)
  - `password` (string)

- Réponse :

```json
{
  "result": true,
  "token": "...",
  "username": "...",
  "firstname": "..."
}
```

---

### 🔹 POST /users/signin

→ Connexion avec username + mot de passe

- Requête `x-www-form-urlencoded`
- Champs requis :

  - `username` (string)
  - `password` (string)

- Réponse :

```json
{
  "result": true,
  "token": "...",
  "username": "...",
  "firstname": "..."
}
```

---

## TWEETS

---

### 🔹 GET /tweets

→ Récupérer tous les tweets (authentification obligatoire)

- Requête : `GET` avec `token` en query string  
  Exemple : `/tweets?token=XXXXXXXX`

- Réponse :

```json
[
  {
    "_id": "...",
    "content": "...",
    "author": { "username": "..." },
    "tags": [...],
    "likedBy": [...],
    "createdAt": "..."
  },
  ...
]
```

---

### 🔹 POST /tweets

→ Ajouter un tweet

- Requête `x-www-form-urlencoded`
- Champs requis :

  - `token` (string)
  - `content` (string, max 280)
  - `tags` (string optionnel, séparés par virgule)

- Réponse :

```json
{
  "result": true,
  "tweet": {
    "_id": "...",
    "content": "...",
    "author": "...",
    ...
  }
}
```

---

### 🔹 DELETE /tweets/:id

→ Supprimer un tweet (auth obligatoire + être l’auteur)

- Requête `DELETE`
- `token` envoyé dans le `body` (form-urlencoded)

- Réponse si tout est OK :

```json
{
  "result": true,
  "message": "Tweet deleted"
}
```
