const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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
    const bookingCollection = client.db("resalePhone").collection("booking");

    app.get("/resalesPhone", async (req, res) => {
      const data = req.query.name;
      // console.log(data);
      const query = {};
      const result = await resaleCollection.find(query).toArray();
      const bookingQuery = { productName: data.productName };
      console.log(bookingQuery);
      res.send(result);
    });
    app.get("/resaleApple/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await resaleCollection.findOne(query);
      res.send(result);
    });
    //booking area start
    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      console.log(booking);
      const result = await bookingCollection.insertOne(booking);
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
