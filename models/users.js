const mongoose = require("mongoose")
console.log("Collection USERS")

const userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true, // champ obligatoire
    trim: true, // trimme les espaces
  },
  email: String,
  password: String,
  token: String,
  certified: Boolean, // 0 par défaut = lambda | 1 = certifié
})

const User = mongoose.model("users", userSchema)

module.exports = User
