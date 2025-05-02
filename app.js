import dotenv from "dotenv"
import express from "express"
import path from "path"
import cookieParser from "cookie-parser"
import logger from "morgan"
import cors from "cors"
import { fileURLToPath } from "url"
import { dirname, join } from "path"

import indexRouter from "./routes/index.js"
import usersRouter from "./routes/users.js"
import tweetsRouter from "./routes/tweets.js"

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()

app.use(cors())
app.use(logger("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(join(__dirname, "public")))

app.use("/", indexRouter)
app.use("/users", usersRouter)
app.use("/tweets", tweetsRouter)

export default app
