import { Router } from "express";
import { checkSchema } from "express-validator";
import { createUserValidationSchema } from "../utils/validationSchemas.mjs";
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

router.post(
  "/api/users",
  checkSchema(createUserValidationSchema),
  async (req, res) => {
    try {
      const newUser = req.body;
      console.log(newUser);
      const result = await users.insertOne(newUser);
      console.log("User created with id", result.insertedId);
      return res.status(201).send({ id: result.insertedId });
    } catch (error) {
      console.log("Error during user creation", error);
      return res.status(500).send(error);
    }
  }
);

router.get("/api/users", async (req, res) => {
  try {
    const usersList = await users.find({}).toArray();
    res.status(200).json(usersList);
  } catch (error) {
    console.error("Error retrieving users:", error);
    res.status(500).send("Error retrieving users");
  }
});

function convertToObjectId(userId) {
  try {
    return new ObjectId({value: userId});
  } catch (error) {
    throw new Error("Invalid user ID");
  }
}

router.delete("/api/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const objectId = convertToObjectId(userId);
    const result = await users.deleteOne({ _id: objectId });

    if (result.deletedCount === 0) {
      return res.status(404).send("User not found");
    }

    res.status(200).send(`User with id ${userId} deleted`);
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).send("Error deleting user");
  }
});

router.put("/api/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const updatedData = req.body;
    const objectId = convertToObjectId(userId);

    const result = await users.updateOne(
      { _id: objectId },
      { $set: updatedData }
    );
    if (result.modifiedCount === 0) {
      return res.status(404).send("User not found");
    }

    res.status(200).send(`User with id ${userId} updated`);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).send("Error updating user");
  }
});

router.get("/api/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await users.findOne({ _id: convertToObjectId(userId) });
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error retrieving user:", error);
    res.status(500).send("Error retrieving user");
  }
});

router.patch("/api/users/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const updatedData = req.body;
    const objectId = convertToObjectId(userId);
    
    const result = await users.updateOne(
      { _id: objectId },
      { $set: updatedData }
    );
    if (result.modifiedCount === 0) {
      return res.status(404).send("User not found");
    }
    res.status(200).send(`User with id ${userId} updated`);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).send("Error updating user");
  }
});

connectToDb().catch(console.dir);

export default router;
