import { MongoClient, ObjectId } from "mongodb";
import config from "../config.mjs";

const URI = config.URI;
const client = new MongoClient(URI);
let users;

async function connectToDb() {
  try {
    await client.connect();
    console.log("MongoDB connected for middlewares");
    const db = client.db("test");
    users = db.collection("users");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

export const resolveIndexByUserId = async (req, res, next) => {
  const {
    params: { id },
  } = req;
  const userId = new ObjectId(id);
  
  try {
    const user = await users.findOne({ _id: userId });
    if (!user) {
      return res.status(404).send("User not found");
    }
    req.userData = user; 
    next();
  } catch (error) {
    console.error("Error finding user:", error);
    res.status(500).send("Error finding user");
  }
};

export const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.sendStatus(401); 
};

connectToDb().catch(console.error);
