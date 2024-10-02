import { Router } from "express";
import { MongoClient, ObjectId } from "mongodb";
import bodyParser from "body-parser";
import config from "../config.mjs";

const router = Router();
const URI = config.URI;
const client = new MongoClient(URI);
const dbName = "test";
let users;

router.use(bodyParser.json());

async function connectToDb() {
  try {
    await client.connect();
    console.log("MongoDB connected");
    const db = client.db(dbName);
    users = db.collection("users");
  } catch (error) {
    console.log("Error connecting to MongoDB:", error);
    throw error;
  }
}

router.post("/api/users/multiple", async (req, res) => {
  try {
    const newUsers = req.body;
    const result = await users.insertMany(newUsers);
    res.status(201).json({ insertedIds: result.insertedIds });
  } catch (error) {
    console.error("Error inserting multiple users:", error);
    res.status(500).send("Error inserting users");
  }
});

router.put("/api/users/multiple", async (req, res) => {
  try {
    const filter = req.body.filter; 
    const updateData = req.body.updateData; 
    const result = await users.updateMany(filter, { $set: updateData });
    res.status(200).send(`${result.modifiedCount} users updated`);
  } catch (error) {
    console.error("Error updating multiple users:", error);
    res.status(500).send("Error updating users");
  }
});

router.put("/api/users/replace/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const newUserData = req.body;
    const result = await users.replaceOne(
      { _id: new ObjectId(userId) },
      newUserData
    );
    res.status(200).send(`User with id ${userId} replaced`);
  } catch (error) {
    console.error("Error replacing user:", error);
    res.status(500).send("Error replacing user");
  }
});

router.delete("/api/users/multiple", async (req, res) => {
  try {
    const filter = req.body.filter; 
    const result = await users.deleteMany(filter);
    res.status(200).send(`${result.deletedCount} users deleted`);
  } catch (error) {
    console.error("Error deleting multiple users:", error);
    res.status(500).send("Error deleting users");
  }
});

router.get("/api/users/projection", async (req, res) => {
  try {
    const projection = req.query.projection ? JSON.parse(req.query.projection) : {}; 
    const usersList = await users.find({}, { projection }).toArray();
    res.status(200).json(usersList);
  } catch (error) {
    console.error("Error retrieving users with projection:", error);
    res.status(500).send("Error retrieving users");
  }
});

connectToDb().catch(console.dir);

export default router;
