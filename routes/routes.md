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
  ...
]
```

---

### POST /tweets

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

### DELETE /tweets/:id

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
