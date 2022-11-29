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
    const bookingsCollection = client.db("car_showroom").collection("bookings");
    const categoriesCollection = client
      .db("car_showroom")
      .collection("categories");

    app.get("/category/:category", async (req, res) => {
      const category = req.params.category;
      const query = { category };
      const categoryName = await categoriesCollection.findOne(query);
      res.send(categoryName);
    });

    //send category products client
    app.get("/products/:category", async (req, res) => {
      const category = req.params.category;
      const query = { category };
      const allProduct = await productsCollection.find(query).toArray();
      const availableProducts = allProduct.filter((product) => !product.booked);

      res.send(availableProducts);
    });

    //users post db
    app.post("/bookings", async (req, res) => {
      const bookedProduct = req.body;

      const result = await bookingsCollection.insertOne(bookedProduct);
      res.send(result);
    });

    //send category products client
    app.get("/bookings/:email", async (req, res) => {
      const email = req.params.email;
      const query = { buyerEmail: email };
      const products = await bookingsCollection.find(query).toArray();
      res.send(products);
    });
    //send category products client
    app.get("/bookingsSeller/:email", async (req, res) => {
      const email = req.params.email;
      const query = { sellerEmail: email };
      const products = await bookingsCollection.find(query).toArray();
      res.send(products);
    });

    //booking for payment com__
    app.get("/bookings/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const booking = await bookingsCollection.findOne(query);
      res.send(booking);
    });

    //users post db
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const query = { email: newUser.email };
      const user = await usersCollection.findOne(query);
      if (!user) {
        const result = usersCollection.insertOne(newUser);
        return res.send(result);
      }
      res.send("already store data");
    });

    //all user get
    app.get("/users", async (req, res) => {
      const query = {};
      const users = await usersCollection.find(query).toArray();
      res.send(users);
    });

    //all user put
    app.put("/users/:id", async (req, res) => {
      const id = req.params.id;
      const admin = req.body;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: admin,
      };
      const result = await usersCollection.updateOne(
        query,
        updatedDoc,
        options
      );
      res.send(result);
    });

    //delete review from my reviews
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    //all buyer
    app.get("/allBuyer", async (req, res) => {
      const query = { role: "buyer" };
      const buyer = await usersCollection.find(query).toArray();
      res.send(buyer);
    });
    //all buyer
    app.get("/allSeller", async (req, res) => {
      const query = { role: "Seller" };
      const seller = await usersCollection.find(query).toArray();
      res.send(seller);
    });

    app.get("/users/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isAdmin: user?.role === "admin" });
    });

    app.get("/users/seller/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isSeller: user?.role === "Seller" });
    });
    app.get("/users/buyer/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isBuyer: user?.role === "buyer" });
    });

    app.put("/products", async (req, res) => {
      const email = req.query.email;
      const verifyUser = req.body;
      const filter = { email };
      const options = { upsert: true };
      const updatedDoc = {
        $set: verifyUser,
      };
      const result = await productsCollection.updateMany(
        filter,
        updatedDoc,
        options
      );
      res.send(result);
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
    //update advertise
    app.put("/products/:id", async (req, res) => {
      const id = req.params.id;
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
      const query = { advertise: true };
      const allAdvertises = await productsCollection.find(query).toArray();
      const availableProducts = allAdvertises.filter(
        (product) => !product.booked
      );

      res.send(availableProducts);
    });
    //all  reported
    app.get("/report", async (req, res) => {
      const query = { report: true };
      const users = await productsCollection.find(query).toArray();
      res.send(users);
    });
    //all  reported de
    app.delete("/report/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    });

    //categories
    app.get("/categories", async (req, res) => {
      const query = {};
      const brands = await productsCollection
        .find(query)
        .project({ category: 1 })
        .toArray();
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
