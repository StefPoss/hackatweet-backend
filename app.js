require("dotenv").config()
const express = require("express")
const path = require("path")
const cookieParser = require("cookie-parser")
const logger = require("morgan")
const cors = require("cors")

const indexRouter = require("./routes/index")
const usersRouter = require("./routes/users")
const tweetsRouter = require("./routes/tweets")

const app = express()

app.use(cors())
app.use(logger("dev"))
app.use(express.json())
// Pour parser les objets complexes envoyés en x-www-form-urlencoded (ex : tableaux)
app.use(express.urlencoded({ extended: true }))

app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "public")))

app.use("/", indexRouter)
app.use("/users", usersRouter)
app.use("/tweets", tweetsRouter)

module.exports = app
