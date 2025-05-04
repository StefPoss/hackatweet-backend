const express = require("express")
const router = express.Router()

const Tweet = require("../models/tweets")
const User = require("../models/users")
// On utilise le petit modules chekAuth pour vérifier qu'on est bien authentifiés
const checkAuth = require("../modules/checkAuth")

// RECUPERATION DE TOUS LES TWEETS
router.get("/", (req, res) => {
  // On récupère le token envoyé dans l'URL (ex: /tweets/tags?token=abcd1234)
  const { token } = req.query

  console.log("On est dans GET /tweets/ token reçu :", token)

  // On n'autorise que si authentifié via le token
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
          // On va chercher l'utilisateur lié au token pour savoir s'il a liké chaque tweet
          User.findOne({ token }).then((user) => {
            const tweetsWithLikeInfo = tweets.map((tweet) => {
              return {
                // on convertit le tweet venant de Mongoose en objet JS
                // pour pouvoir lui injecter des champs dynamiques (comme likedByMe)
                ...tweet.toObject(),
                likedByMe: tweet.likedBy.includes(user._id), // true si l'utilisateur a liké ce tweet
                likesCount: tweet.likedBy.length, // Compteur qui évite au front de faire le calcul
              }
            })

            // On renvoie les tweets enrichis avec les infos provenant du côté user
            res.json(tweetsWithLikeInfo)
          })
        })
        .catch((err) => {
          // Si une erreur survient lors de la récupération des tweets
          res.status(500).json({ error: "error while retrieving tweets" })
        })
    })
    .catch((err) => {
      // Si une erreur survient lors de l'authentif (user inexistant)
      res.status(500).json({ error: "authentication error" })
    })
})

// AJOUT D'UN TWEET
router.post("/", (req, res) => {
  // On récupère le token, le contenu du tweet et les tags via body (ex: { token: "xxxxx", content: "..." })
  const { token, content, tags } = req.body
  console.log(
    "On est dans POST /tweets/, token + content + tags reçu :",
    token,
    content,
    tags
  )

  // On checke s'il y a un token ou du contenu
  if (!token || !content) {
    return res.status(400).json({ error: "token or content missing" })
  }

  // On n'autorise que si authentifié via le token
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
          // Si une erreur survient lors de la sauvegard du document
          res.status(500).json({ error: "error while saving tweet" })
        })
    })
    .catch((err) => {
      // Si une erreur survient lors de l'authentif (user inexistant)
      res.status(500).json({ error: "error while authenticating" })
    })
})

// SUPPRESSION D'UN TWEET - uniquement si l'utilisateur est authentifié ET l'auteur du tweet
router.delete("/:id", (req, res) => {
  // On récupère le token envoyé dans le body de la requête (ex: { token: "xxxxx" })
  const { token } = req.body
  // On récupère l'ID du tweet à liker depuis l'URL (ex: /tweets/ABCD1234/like)
  const tweetId = req.params.id

  console.log(
    "On est dans DELETE /tweets/:id reçu tweetId + token :",
    tweetId,
    token
  )

  // On n'autorise que si authentifié via le token
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
              // Si une erreur survient lors de la suppression du tweet
              res.status(500).json({ error: "error while deleting tweet" })
            })
        })
        .catch(() => {
          // Si une erreur survient lors de la recherche du tweet
          res.status(500).json({ error: "error while looking for this tweet" })
        })
    })
    .catch(() => {
      // Si une erreur survient lors de l'authentif (user inexistant)
      res.status(500).json({ error: "error while authenticating" })
    })
})

// AJOUT / SUPPRESSION DE LIKE SUR UN TWEET
router.post("/:id/like", (req, res) => {
  // On récupère le token envoyé dans le body de la requête (ex: { token: "xxxxx" })
  const { token } = req.body
  // On récupère l'ID du tweet à liker depuis l'URL (ex: /tweets/ABCD1234/like)
  const tweetId = req.params.id

  console.log("On est dans POST /tweets/:id/like reçu :", tweetId, token)

  // On n'autorise que si authentifié via le token
  User.findOne({ token })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "Utilisateur non authentifié" })
      }

      // On récupère le tweet à liker
      Tweet.findById(tweetId)
        .then((tweet) => {
          if (!tweet) {
            return res.status(404).json({ error: "tweet not found" })
          }

          // On vérifie si l'utilisateur a déjà liké ce tweet
          if (tweet.likedBy.includes(user._id)) {
            // Si oui, on le retire du tableau likedBy
            tweet.likedBy = tweet.likedBy.filter(
              (id) => id.toString() !== user._id.toString()
              // on passe en toString() car on ne peut pas comparer directement deux objets
            )
            liked = false
          } else {
            // Sinon, on ajoute son _id au tableau likedBy
            tweet.likedBy.push(user._id)
            liked = true
          }

          // On sauvegarde le tweet en base
          tweet
            .save()
            .then((updatedTweet) => {
              // On renvoie si liked true/false et le nombre de likes
              res.json({
                result: true,
                message: "Tweet updated",
                liked,
                likeCount: updatedTweet.likedBy.length,
                likedBy: tweet.likedBy, // uniquement si on veut savoir tous les user qui ont liké le tweet
              })
            })
            // Si une erreur survient lors de l'enregistrement du tweet mis à jour
            .catch(() => {
              console.error("Erreur tweet.save():", err)
              res.status(500).json({ error: "error while updating this tweet" })
            })
        })
        // Si le tweet avec l'ID donné n'existe pas
        .catch(() => {
          res.status(500).json({ error: "error while looking for this tweet" })
        })
    })
    // Si une erreur survient lors de l'authentif (user inexistant)
    .catch(() => {
      res.status(500).json({ error: "error while authenticating" })
    })
})

// RECUPERATION DE TOUS LES TAGS UNIQUES
router.get("/tags", (req, res) => {
  // On récupère le token envoyé dans l'URL (ex: /tweets/tags?token=abcd1234)
  const { token } = req.query
  console.log("On est dans GET /tweets/tags, token reçu :", token)

  // On n'autorise que si authentifié via le token
  checkAuth({ token })
    .then((isAuth) => {
      if (!isAuth) {
        return res.status(401).json({ error: "unauthorized" })
      }

      // On récupère tous les tweets (problème à régler > 10 twwets ok, 1 million de tweets ?)
      Tweet.find()
        .then((tweets) => {
          // On crée un tableau pour récupérer tous les tags de tous les tweets
          const allTags = []

          // On boucle sur chaque tweet
          for (const tweet of tweets) {
            // Et sur chaque tag du tweet
            for (const tag of tweet.tags) {
              allTags.push(tag)
            }
          }

          // On élimine les doublons avec .Set(), puis on convertit en nouveau tableau
          const uniqueTags = [...new Set(allTags)]

          res.json({
            result: true,
            tags: uniqueTags,
          })
        })
        .catch(() => {
          // Si la query renvoie une erreur
          res.status(500).json({ error: "error while retrieving tags" })
        })
    })
    .catch(() => {
      // Si une erreur survient lors de l'authentif (user inexistant)
      res.status(500).json({ error: "authentication error" })
    })
})

module.exports = router
