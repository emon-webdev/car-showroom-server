const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
require("dotenv").config();

const Port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@cluster0.ocr25uf.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    //save user api
    const usersCollection = client.db("car_showroom").collection("users");
    const productsCollection = client.db("car_showroom").collection("products");

    //users post db
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      console.log(newUser);
      const query = { email: newUser.email };
      const user = await usersCollection.findOne(query);
      if (!user) {
        const result = usersCollection.insertOne(newUser);
        return res.send(result);
      }
      res.send("already store data");
    });


    // all product post db
    app.post("/products", async (req, res) => {
      const product = req.body;
      console.log(product);
      const query = { email: product.email };
      const user = await usersCollection.findOne(query);
      if (user.role == "Seller") {
        const result = await productsCollection.insertOne(product);
        return res.send(result);
      }
      res.status(401).send({ message: "unauthorize access" });
    });











    // get all products
    // app.get("/products", async (req, res) => {
    //   const email = req.query.email;
    //   const query = { email: email };
    //   const products = await productsCollection.find(query).toArray();
    //   res.send(products);
    // });


  } finally {
  }
}
run().catch((error) => console.error(error));

app.get("/", (req, res) => {
  res.send("Car Showroom  Service is Running...");
});

app.listen(Port, () => {
  console.log(`Car Showroom  Service is Running  ${Port}`);
});
