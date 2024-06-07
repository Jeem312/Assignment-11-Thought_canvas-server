const express = require('express');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');

const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


 // middlewares
 const verifyToken = (req,res,next)=>{
  // console.log('inside verify token',req.headers);
  if(!req.headers.authorization){
    return res.status(401).send({message: 'unauthorized access'});

  }
  const token = req.headers.authorization.split(' ')[1];
  // console.log(token)
  jwt.verify(token ,process.env.ACCESS_TOKEN_SECRET, (err,decoded)=>{
    if(err){
      // console.log(err)

      return res.status(401).send({message: ' acces denied'})
    }
    req.decoded = decoded;
    next();
})} 

  const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.wibgfjr.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
  
  // Create a MongoClient with a MongoClientOptions object to set the Stable API version
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
 
  async function run() {
  
    try {
      const userCollection = client.db("Assignment-12").collection('users');
      const assetCollection = client.db("Assignment-12").collection('asset');
      const packageCollection = client.db("Assignment-12").collection('packages');
     
     
 


    // user related api
     
    app.post('/user',async(req,res)=>{
      const userInfo = req.body;
      // console.log('userinfo',userInfo);
      const result = await userCollection.insertOne(userInfo);
    
      res.send(result);
     })

// console.log('token',process.env.ACCESS_TOKEN_SECRET)
 // JWT Related api
 app.post('/jwt',async(req,res)=>{
  const user = req.body;
  // console.log(user)
  const token = jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{
    expiresIn:'365d'
  });
  res.send({ token });
})
// asset related api
app.post('/assets',async(req,res)=>{
  const cursor = req.body;
  const result = await assetCollection.insertOne(cursor);
  res.send(result);
})

// role related api
app.get('/users/hr/:email',verifyToken ,async(req,res)=>{
  const email = req.params.email;
  if(email !== req.decoded.email){
    return res.status(403).send({message: 'forbidden access'})
  }
  const query = {email:email};
  const user = await userCollection.findOne(query);
  let hr = false;
  if (user){
    hr = user?.role === 'Hr';
    
  }
  res.send({hr});

 })
app.get('/users/employee/:email',verifyToken ,async(req,res)=>{
  const email = req.params.email;
  if(email !== req.decoded.email){
    return res.status(403).send({message: 'forbidden access'})
  }
  const query = {email:email};
  const user = await userCollection.findOne(query);
  let employee = false;
  if (user){
    employee = user?.role === 'Employee';
    
  }
  res.send({employee});

 })
    //  package related api
    app.get('/package',async(req,res)=>{
      const cursor = packageCollection.find();
      const result = await cursor.toArray();
      res.send(result);


    })

      // Connect the client to the server	(optional starting in v4.7)
    //   await client.connect();
      // Send a ping to confirm a successful connection
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      // Ensures that the client will close when you finish/error
    //   await client.close();
    }
  }
  run().catch(console.dir);
  app.get('/',(req,res)=>{
      res.send('server is running');
  })
  
   app.listen(port,()=>{
      console.log(`port:${port}`)
   })