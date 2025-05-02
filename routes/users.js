const express = require("express")
const router = express.Router()

require("../models/connection")
const User = require("../models/users")

const { checkBody } = require("../modules/checkBody")

const uid2 = require("uid2")
const bcrypt = require("bcrypt")

router.get("/", (req, res) => {
  res.send("Route /users OK")
})

router.post("/signup", (req, res) => {
  console.log("On est dans POST /users/signup")

  if (!checkBody(req.body, ["username", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" })
    return
  }

  // On Checke que l'utilisateur n'existe pas déjà
  User.findOne({ username: req.body.username }).then((data) => {
    if (data === null) {
      const token = uid2(32)
      const hash = bcrypt.hashSync(req.body.password, 10)

      // On construit le nouvel utilisateur
      const newUser = new User({
        username: req.body.username,
        email: req.body.email,
        password: hash,
        token: token,
        certified: false, // false par défaut = lambda | true = certifié
      })

      // On sauve les données utilisateur en base
      newUser.save().then((data) => {
        res.json({ result: true, token: data.token, username: data.username })
      })
    } else {
      // Si l'user existe déjà
      res.json({ result: false, error: "User already exists" })
    }
  })
})

router.post("/signin", (req, res) => {
  console.log("On est dans POST /users/signin")
  if (!checkBody(req.body, ["username", "password"])) {
    res.json({ result: false, error: "Missing or empty fields" })
    return
  }

  User.findOne({
    username: req.body.username,
  }).then((data) => {
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      console.log("DATA.TOKEN IS", data.token)

      res.json({ result: true, token: data.token })
    } else {
      res.json({ result: false, error: "User not found" })
    }
  })
})

module.exports = router
