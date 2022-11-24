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

async function run(){
try{
  //save user api
  const usersCollection = client.db('car_showroom').collection('users');


  app.post('/users', async(req, res) => {
    const user = req.body;
    console.log(user);
    const result = await usersCollection.insertOne(user);
    res.send(result);
  })

}finally{

}
}
run().catch((error) => console.error(error));


app.get("/", (req, res) => {
  res.send("Car Showroom  Service is Running...");
});

app.listen(Port, () => {
  console.log(`Car Showroom  Service is Running  ${Port}`);
});
