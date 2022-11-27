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
    // const advertisesCollection = client
    //   .db("car_showroom")
    //   .collection("advertises");

    //send category products client
    app.get("/category/:category", async (req, res) => {
      const category = req.params.category;
      console.log(category);
      const query = { category };
      const products = await productsCollection.find(query).toArray();
      res.send(products);
    });

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
      const query = { email: product.email };
      const user = await usersCollection.findOne(query);
      if (user.role == "Seller") {
        const result = await productsCollection.insertOne(product);
        return res.send(result);
      }
      res.status(401).send({ message: "unauthorize access" });
    });

    // get all products (for my products)
    app.get("/products", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const products = await productsCollection.find(query).toArray();
      res.send(products);
    });

    //delete review from my reviews
    app.delete("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/products/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const advertise = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: advertise,
      };
      const result = await productsCollection.updateOne(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
    });

    //all  advertises
    app.get("/advertises", async (req, res) => {
      const query = {advertise: true};
      const users = await productsCollection.find(query).toArray();
      res.send(users);
    });

    //categories
    app.get("/categories", async (req, res) => {
      const query = {};
      const brands = await productsCollection
        .find(query)
        .project({ category: 1 })
        .toArray();
      console.log(brands);
      res.send(brands);
    });
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
