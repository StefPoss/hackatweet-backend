const User = require("../models/users")

async function checkAuth(body) {
  const { token } = body

  // Si token n'existe pas on renvoie un msg d'erreur
  if (!token) return false

  return User.findOne({ token })
    .then((user) => {
      return !!user // true si un user est trouvé, sinon false
    })
    .catch((err) => {
      return false // en cas d’erreur on refuse aussi l'accès
    })
}

module.exports = checkAuth
