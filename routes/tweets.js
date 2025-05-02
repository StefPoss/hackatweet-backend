const express = require("express")
const router = express.Router()

const Tweet = require("../models/tweets")
const User = require("../models/users")
// On utilise le petit modules chekAuth pour vérifier qu'on est bien authentifiés
const checkAuth = require("../modules/checkAuth")

// RECUPERATION DE TOUS LES TWEETS
router.get("/", (req, res) => {
  const { token } = req.query

  // On checke l'authentification
  checkAuth({ token })
    .then((isAuth) => {
      if (!isAuth) {
        return res.status(401).json({ error: "unauthorized" })
      }

      // Si on est bon on récupère les infos en DB
      Tweet.find()
        .populate("author", "username") // On en profite pour récupérer le username via la relation user_id
        .sort({ createdAt: -1 }) // On trie par ordre inverse de date
        .then((tweets) => {
          // On renvoie l'objet tweets
          res.json(tweets)
        })
        .catch((err) => {
          res.status(500).json({ error: "error while retrieving tweets" })
        })
    })
    .catch((err) => {
      res.status(500).json({ error: "authentication error" })
    })
})

// AJOUT D'UN TWEET
router.post("/", (req, res) => {
  const { token, content, tags } = req.body

  // On cehcke s'il y a un token ou du contenu
  if (!token || !content) {
    return res.status(400).json({ error: "token or content missing" })
  }

  // On n'uautorise que si authentifié via le token
  User.findOne({ token })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "user not found" })
      }

      // On prépare le nouveau tweet avec les infos minimales requises
      const newTweet = new Tweet({
        content,
        author: user._id,
        tags,
      })

      // On sauve le tweet en base
      newTweet
        .save()
        .then((tweet) => {
          res.json({ result: true, tweet })
        })
        .catch((err) => {
          res.status(500).json({ error: "error while saving tweet" })
        })
    })
    .catch((err) => {
      res.status(500).json({ error: "error while authenticating" })
    })
})

// SUPPRESSION D'UN TWEET - uniquement si l'utilisateur est authentifié ET l'auteur du tweet
router.delete("/:id", (req, res) => {
  const { token } = req.body
  const tweetId = req.params.id

  console.log("On est dans DELETE /tweets/:id reçu :", tweetId, token)

  // On vérifie le token de l'utilisateur
  User.findOne({ token })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "Utilisateur non authentifié" })
      }

      // On récupère le tweet à supprimer
      Tweet.findById(tweetId)
        .then((tweet) => {
          if (!tweet) {
            return res.status(404).json({ error: "tweet not found" })
          }

          // Vérifie que l'utilisateur est bien l'auteur du tweet
          if (!tweet.author.equals(user._id)) {
            return res
              .status(403)
              .json({ error: "not allowed to delete this tweet" })
          }

          // Supprime le tweet qu'on vient précisément de récupérer
          tweet
            .deleteOne()
            .then(() => {
              res.json({ result: true, message: "Tweet deleted" })
            })
            .catch(() => {
              res.status(500).json({ error: "error while deleting tweet" })
            })
        })
        .catch(() => {
          res.status(500).json({ error: "error while looking for this tweet" })
        })
    })
    .catch(() => {
      res.status(500).json({ error: "error while authenticating" })
    })
})

module.exports = router
