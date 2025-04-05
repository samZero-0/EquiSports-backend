const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const fetch = require('node-fetch'); // Add this for API calls

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
        const database = client.db('Assignment-10');
        const equipmentCollection = database.collection('equipments');

        // Hugging Face Chat Endpoint
        app.post('/message', async (req, res) => {
            try {
                const response = await fetch(
                    "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1",
                    {
                        headers: { 
                            Authorization: `Bearer ${process.env.HF_API_KEY}`,
                            "Content-Type": "application/json" 
                        },
                        method: "POST",
                        body: JSON.stringify({ 
                            inputs: req.body.message,
                            parameters: {
                                max_new_tokens: 250,
                                return_full_text: false
                            }
                        }),
                    }
                );

                if (!response.ok) {
                    throw new Error(`HF API error: ${response.statusText}`);
                }

                const result = await response.json();
                res.send({ message: result[0].generated_text });
            } catch (error) {
                console.error("HuggingFace Error:", error);
                res.status(500).send({
                    error: "AI service unavailable",
                    details: error.message
                });
            }
        });

        // Your existing equipment routes
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
        });

        app.post('/equipments', async (req, res) => {
            const newEquipment = req.body;
            console.log('Adding new equipment', newEquipment)
            const result = await equipmentCollection.insertOne(newEquipment);
            res.send(result);
        });

        app.put('/equipments/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedEquipment = req.body;
            const equipment = {
                $set: {
                    img: updatedEquipment.img,
                    itemName: updatedEquipment.itemName,
                    categoryName: updatedEquipment.categoryName,
                    description: updatedEquipment.description,
                    price: updatedEquipment.price,
                    rating: updatedEquipment.rating,
                    customization: updatedEquipment.customization,
                    processingTime: updatedEquipment.processingTime,
                    stockStatus: updatedEquipment.stockStatus,
                    userEmail: updatedEquipment.userEmail,
                    userName: updatedEquipment.userName,
                }
            };
            const result = await equipmentCollection.updateOne(filter, equipment, options);
            res.send(result);
        });

        app.delete('/equipments/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await equipmentCollection.deleteOne(query);
            res.send(result);
        });

    } finally {
        // Client cleanup handled elsewhere
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Backend connected')
});

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});