import passport from "passport";
import { Strategy } from "passport-local";
import { MongoClient, ObjectId } from "mongodb";
import config from "../config.mjs";

const URI = config.URI;
const client = new MongoClient(URI);
const dbName = "test";
let users;

async function connectToDb() {
  try {
    await client.connect();
    console.log("MongoDB connected for authentication");
    const db = client.db(dbName);
    users = db.collection("users");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

passport.serializeUser((user, done) => {
  done(null, user._id); 
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await users.findOne({ _id: new ObjectId(id) });
    if (!user) throw new Error('User not found');
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport.use(
  new Strategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const user = await users.findOne({ email: email });
      
      if (!user) return done(null, false, { message: 'User not found' });
      if (user.password !== password) return done(null, false, { message: 'Wrong password' });

      done(null, user);
    } catch (error) {
      done(error);
    }
  })
);

connectToDb().catch(console.error);
