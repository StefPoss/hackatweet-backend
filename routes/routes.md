# 📁 routes.md – API Hackatweet

---

## UTILISATEURS

---

### POST /users/signup

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

### POST /users/signin

**Objectif de la route :** Connexion avec username + mot de passe

**Paramètres attendus :**
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

### GET /tweets

**Objectif de la route :** récupérer tous les tweets, triés par date décroissante, enrichis avec deux champs dynamiques pour éviter de stocker en base :
- `likedByMe`: true/false selon que l'utilisateur connecté a liké le tweet
- `likesCount`: compteur du nombre de likes

- Requête : `GET` avec `token` en query string  
  Exemple : `/tweets?token=XXXXXXXX`

**Paramètres attendus :**
- `token` (en query string) : token de l'utilisateur connecté

**Réponse :**
```json
[
  {
    "_id": "abc123",
    "content": "Ceci est un tweet",
    "author": {
      "_id": "user123",
      "username": "toto"
    },
    "likedByMe": true,
    "likesCount": 4,
    "createdAt": "2025-05-02T12:00:00.000Z"
  },
  // tweets suivant
]
```

---

### POST /tweets

**Objectif de la route :** Ajouter un tweet

**Paramètres attendus :**
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
    // autre tweet s'il y a lieu
  }
}
```

---

### DELETE /tweets/:id

**Objectif de la route :** Supprimer un tweet (auth obligatoire + être l’auteur)

**Paramètres attendus :**
- Requête `DELETE`
- `token` envoyé dans le `body` (form-urlencoded)

- Réponse si tout est OK :

```json
{
  "result": true,
  "message": "Tweet deleted"
}
```
