import mongoose from "mongoose"

const connectionString = process.env.CONNECTION_STRING

mongoose
  .connect(connectionString, { connectTimeoutMS: 2000 })
  .then(() => console.log("Connecté à la base de données"))
  .catch((error) => console.error(error))
