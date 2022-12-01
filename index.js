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
    const resaleCollection = client.db("resalePhone").collection("resale");
    const bookingCollection = client.db("resalePhone").collection("booking");
    const userCollection = client.db("resalePhone").collection("user");
    const paymentsCollection = client.db("resalePhone").collection("payments");
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

    app.get("/resalesPhone", async (req, res) => {
      const query = {};
      const result = await resaleCollection.find(query).toArray();
      res.send(result);
    });
    app.post("/create-payment-intent", async (req, res) => {
      const booking = req.body;
      const price = booking.price;
      const amount = price * 100;

      const paymentIntent = await stripe.paymentIntents.create({
        currency: "usd",
        amount: amount,
        payment_method_types: ["card"],
      });
      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    });

    app.post("/payments", async (req, res) => {
      const payment = req.body;
      const result = await paymentsCollection.insertOne(payment);
      const id = payment.bookingId;
      const filter = { _id: ObjectId(id) };
      const updatedDoc = {
        $set: {
          paid: true,
          transactionId: payment.transactionId,
        },
      };
      const updatedResult = await bookingCollection.updateOne(
        filter,
        updatedDoc
      );
      res.send(result);
    });
    app.get("/resaleApple/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await resaleCollection.findOne(query);
      res.send(result);
    });
    //booking area start
    app.get("/bookings", verifyJWT, async (req, res) => {
      const email = req.query.email;
      const decodedEmail = req.decoded.email;

      if (email !== decodedEmail) {
        return res.status(403).send({ message: "forbidden access" });
      }

      const query = { email: email };
      const bookings = await bookingCollection.find(query).toArray();
      res.send(bookings);
    });
    app.get("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const reslut = await bookingCollection.findOne(query);
      res.send(reslut);
    });
    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      const result = await bookingCollection.insertOne(booking);
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

    //make Admin
    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });
    app.put("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });
    app.put("/users/verify/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          verify: "verify",
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });

    // delete
    app.delete("/users/:id", verifyJWT, verifyAdmin, async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });
    app.post("/porducts", async (req, res) => {
      const product = req.body;
      const reslut = await randomProductsCollection.insertOne(product);
      res.send(reslut);
    });

    //Add products
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
  res.send("Resale Server is running");
});

app.listen(port, () => console.log("my Server is running!!!"));
