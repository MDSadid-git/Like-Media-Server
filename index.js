const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

//midell
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fdmrdur.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const resaleCollection = client.db("resalePhone").collection("resale");
    const resaleAppleCollection = client.db("resalePhone").collection("apple");
    const resaleSamsungCollection = client
      .db("resalePhone")
      .collection("samsung");
    const resaleOppoCollection = client.db("resalePhone").collection("oppo");
    app.get("/resalesPhone", async (req, res) => {
      const query = {};
      const result = await resaleCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/resaleApple", async (req, res) => {
      const query = {};
      const result = await resaleAppleCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/resaleSamsung", async (req, res) => {
      const query = {};
      const result = await resaleSamsungCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/resaleOppo", async (req, res) => {
      const query = {};
      const result = await resaleOppoCollection.find(query).toArray();
      res.send(result);
    });
  } finally {
  }
}
run().catch((err) => console.log(err));
app.get("/", (req, res) => {
  res.send("Resale Server is running");
});

app.listen(port, () => console.log("my Server is running!!!"));
