const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
dotenv.config();    
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k2nj4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");

        const database = client.db('Assignment-10');
        const equipmentCollection = database.collection('equipments');


        app.get('/equipments', async (req, res) => {
            const cursor = equipmentCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get('/equipments/byEmail/:email', async (req, res) => {
            const email = req.params.email;
            const query = {userEmail: `${email}`}
            const cursor = equipmentCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get('/equipments/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await equipmentCollection.findOne(query);
            res.send(result);
        })

        app.post('/equipments', async (req, res) => {
            const newEquipment = req.body;
            console.log('Adding new equipment', newEquipment)
            const result = await equipmentCollection.insertOne(newEquipment);
            res.send(result);
        });



        // app.put('/equipments/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const filter = { _id: new ObjectId(id) };
        //     const options = { upsert: true };
        //     const updatedDoc = {
        //         $set: req.body
        //     }

        //     const result = await coffeeCollection.updateOne(filter, updatedDoc, options )

        //     res.send(result);
        // })

        // app.delete('/equipments/:id', async (req, res) => {
        //     console.log('going to delete', req.params.id);
        //     const id = req.params.id;
        //     const query = { _id: new ObjectId(id) }
        //     const result = await coffeeCollection.deleteOne(query);
        //     res.send(result);
        // })



    } finally {
        // Ensures that the client will close when you finish/error
        //   await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Backend connected')
})

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
})
