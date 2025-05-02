import express from "express"

const router = express.Router()

router.get("/", (req, res) => {
  res.send("Bienvenue sur Hackatweet backend !")
})

export default router
