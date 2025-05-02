const mongoose = require("mongoose")
console.log("Collection TWEETS")

const tweetSchema = mongoose.Schema({
  content: { type: String, maxlength: 280, required: true }, // force 280 caractères max
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  likes: Number,
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "users" }],
  // Tableau des user._id qui ont liké ce post (pour afficher le petit coeur rouge et éventuellement la liste des name)
  tags: [String], // Tableau de tags pour la recherche et l'affichage dans Trends
  //   retweet: [User._id] // FUTURE FONCTIONNALITÉ
})

const Tweet = mongoose.model("tweets", tweetSchema)

module.exports = Tweet
