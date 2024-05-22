const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000

const app = express()

const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174'],
}
app.use(cors(corsOptions))
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.apuyeda.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    const foodCollection = client.db('FoodUnity').collection('food collection')
    const requestedFood = client.db('FoodUnity').collection('requested food')

    app.get('/foods', async (req, res) => {
      const result = await foodCollection.find().toArray()
      res.send(result)
    })
    //get a single food data from db using job id
    app.get('/food/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await foodCollection.findOne(query)
      res.send(result)
    })
    //save a food data in db
    app.post('/food', async(req,res)=>{
      const foodData = req.body;
      const result = await foodCollection.insertOne(foodData)
      res.send(result)
    })

    //get all foods posted by a specific user
    app.get('/foods/:email', async(req,res)=>{
      const email = req.params.email;
      const query = {'donator.email': email}
      const result = await foodCollection.find(query).toArray()
      res.send(result)
    })
    //delete a specific added food from db
    app.delete('/food/:id', async(req,res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await foodCollection.deleteOne(query)
      res.send(result)
    })
    //update a food data in db
    app.put('/food/:id', async(req,res)=>{
      const id = req.params.id;
      const foodData = req.body
      const query = {_id: new ObjectId(id)}
      const options = {upsert: true}
      const updateDoc = {
        $set:{
          ...foodData
        }
      }
      const result = await foodCollection.updateOne(query,updateDoc,options)
      res.send(result)
    })

    // save requested food data in db
    app.post('/requestedFood', async(req,res)=>{
      const foodData = req.body;
      const result = await requestedFood.insertOne(foodData)
      res.send(result)
    })
    //get requested foods foods posted by a specific user
    app.get('/requestedFoods/:email', async(req,res)=>{
      const email = req.params.email;
      const query = {userEmail: email}
      const result = await requestedFood.find(query).toArray()
      res.send(result)
    })

    // Get all foods data from db for search & sort
    app.get('/allFoods', async (req, res) => {
      const sort = req.query.sort
      const search = req.query.search

      let query = {
        foodName: { $regex: search, $options: 'i' },
      }
      let options = {}
      if (sort) options = { sort: { 
        expiredDate: sort === 'asc' ? 1 : -1 } }
      const result = await foodCollection
        .find(query, options).toArray()
      res.send(result)
    })


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello From FoodUnity Server')
})

app.listen(port, () => console.log(`Server Running on port  ${port}`))