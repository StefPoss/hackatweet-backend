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
          // On va chercher l'utilisateur lié au token pour savoir s'il a liké chaque tweet
          User.findOne({ token }).then((user) => {
            const tweetsWithLikeInfo = tweets.map((tweet) => {
              return {
                // on convertit le tweet venant de Mongoose en objet JS
                // pour pouvoir lui injecter des champs dynamiques (comme likedByMe)
                ...tweet.toObject(),
                likedByMe: tweet.likedBy.includes(user._id), // true si l'utilisateur a liké ce tweet
                likesCount: tweet.likedBy.length, // juste un compteur pour éviter que le front le recalcule
              }
            })

            // On renvoie les tweets enrichis avec les infos dynamiques côté utilisateur
            res.json(tweetsWithLikeInfo)
          })
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

// AJOUT / SUPPRESSION DE LIKE SUR UN TWEET
router.post("/:id/like", (req, res) => {
  const { token } = req.body
  const tweetId = req.params.id

  console.log("On est dans POST /tweets/:id/like reçu :", tweetId, token)

  // On vérifie le token de l'utilisateur
  User.findOne({ token })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: "Utilisateur non authentifié" })
      }

      // On récupère le tweet à liket
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
                likedBy: tweet.likedBy // uniquement si on veut savoir tous les user qui ont liké le tweet 
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
    // Si l'utilisateur avec ce token n'existe pas)
    .catch(() => {
      res.status(500).json({ error: "error while authenticating" })
    })
})

module.exports = router
