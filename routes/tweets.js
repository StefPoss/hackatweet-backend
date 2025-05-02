const express = require('express')
const router = express.Router()

router.get("/", (req, res) => {
  res.send("Route /tweets OK")
})

module.exports = router
