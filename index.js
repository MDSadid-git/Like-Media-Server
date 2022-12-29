const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const port = process.env.PORT || 5000;
const stripe = require("stripe")(process.env.STRIPE_KEY);

//midell
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fdmrdur.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("unauthorized access");
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.DB_JWT, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

async function run() {
  try {
    const randomCollection = client.db("likeMidia").collection("random");
    const userCollection = client.db("likeMidia").collection("user");
    const myPostCollection = client.db("likeMidia").collection("myPost");
    const randomProductsCollection = client
      .db("resalePhone")
      .collection("randomProdcts");

    const verifyAdmin = async (req, res, next) => {
      const decodedEmail = req.decoded.email;
      const query = { email: decodedEmail };
      const user = await userCollection.findOne(query);

      if (user?.role !== "admin") {
        return res.status(403).send({ message: "forbidden access" });
      }
      next();
    };

    app.patch("/editPost/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };

      const result = await randomCollection.updateOne(query, {
        $set: req.body,
      });
      res.send(result);
    });
    app.get("/editPost/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await randomCollection.findOne(query);
      res.send(result);
    });
    app.delete("/editPost/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await randomCollection.deleteOne(query);
      res.send(result);
    });
    app.get("/allPost", async (req, res) => {
      const query = {};
      const result = await randomCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/myallPost", async (req, res) => {
      const query = {};
      const result = await myPostCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/myEditPost/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await myPostCollection.findOne(query);
      res.send(result);
    });
    app.get("/resalesPhone", async (req, res) => {
      const query = {};
      const result = await randomCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/resaleApple/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await randomCollection.findOne(query);
      res.send(result);
    });
    app.patch("/PostUpdate/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };

      const result = await randomCollection.updateOne(query, {
        $set: req.body,
      });
      res.send(result);
    });
    app.post("/myPost", async (req, res) => {
      const order = req.body;
      const result = await randomCollection.insertOne(order);
      res.send(result);
    });
    //users
    app.get("/users", async (req, res) => {
      const query = {};
      const users = await userCollection.find(query).toArray();
      res.send(users);
    });
    app.post("/users", async (req, res) => {
      const users = req.body;
      const result = await userCollection.insertOne(users);
      res.send(result);
    });
    // jwt
    app.get("/jwt", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      if (user) {
        const token = jwt.sign({ email }, process.env.DB_JWT, {
          expiresIn: "1d",
        });
        return res.send({ accessToken: token });
      }
      res.status(403).send({ accessToken: "" });
    });

    //Add Post
    app.get("/porducts", async (req, res) => {
      const query = {};
      const reslut = await randomProductsCollection.find(query).toArray();
      res.send(reslut);
    });
  } finally {
  }
}
run().catch((err) => console.log(err));
app.get("/", (req, res) => {
  res.send("Like Media Server is running");
});

app.listen(port, () => console.log("my Server is running!!!"));
