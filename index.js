const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qfoh5.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
  try {
    await client.connect();
    const database = client.db('timekeeper');
    const productsCollection = database.collection('products');
    const servicesCollection = database.collection('services');
    const purchaseInfoCollection = database.collection('purchaseInfo');
    const usersCollection = database.collection('users');
    const ratingsCollection = database.collection('ratings');

    // GET API for Products
    app.get('/products', async(req, res) => {
      const cursor = productsCollection.find({});
      const products = await cursor.toArray();
      res.send(products);
    })

    // GET A SINGLE Product
    app.get('/products/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id : ObjectId(id)};
      const product = await productsCollection.findOne(query);
      res.json(product);
    })

    // POST API FOR ADD A NEW PRODUCT
    app.post('/products', async (req, res) => {
      const product = req.body;
      const result = await productsCollection.insertOne(product);
      res.send(result);
  });


    // DELETE API for Products
    app.delete('/products/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const result = await productsCollection.deleteOne(query);
      res.json(result);
  })

    // GET API for Services
    app.get('/services', async(req, res) => {
      const cursor = servicesCollection.find({});
      const services = await cursor.toArray();
      res.send(services);
    })

    // GET API for purchaseInfo
    app.get('/purchaseInfo', async(req, res) => {
      const cursor = purchaseInfoCollection.find({});
      const purchaseInfo= await cursor.toArray();
      res.send(purchaseInfo);
    })

    // GET API for single user purchaseInfo
    app.get('/purchaseInfo/user', async(req, res) => {
      const email = req.query.email;
      
      const query = {email: email};
      
      const cursor = purchaseInfoCollection.find(query);
      const purchaseInfo = await cursor.toArray();
      res.json(purchaseInfo);
    })

    // POST API for purchaseInfo
    app.post('/purchaseInfo', async(req, res) => {
      const purchaseInfo = req.body;
      console.log(purchaseInfo);

      const result = await purchaseInfoCollection.insertOne(purchaseInfo);
      console.log(result);
      res.json(result); 
    })

    // PUT API for purchaseInfo
    app.put('/purchaseInfo/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const updateDoc = { $set: { status: 'shipped' } };
      const result = await purchaseInfoCollection.updateOne(query, updateDoc);
      res.json(result);
    })

    // DELETE API for purchaseInfo
    app.delete('/purchaseInfo/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: ObjectId(id)};
      const result = await purchaseInfoCollection.deleteOne(query);
      res.json(result);
  })

    // GET API for users
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === 'admin') {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    })

    // POST API For Save User
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      console.log(result);
      res.json(result);
    });

    // PUT API For Google User
    app.put('/users', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    })

    app.put('/users/admin', async(req, res) => {
      const user = req.body;
      const filter = {email: user.email};
      const updateDoc = {$set: {role: 'admin'}};
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    })

    // POST API for rating
    app.post('/ratings', async(req, res) => {
      const rating = req.body;
      const result = await ratingsCollection.insertOne(rating);
      res.send(result);
    })

    // GET API for rating
    app.get('/ratings', async(req, res) => {
      const cursor = ratingsCollection.find({});
      const ratings= await cursor.toArray();
      res.send(ratings);
    })

  }

  finally {
    // await client.close();
  }
}

run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log('listening at port', port)
})