import express from 'express'
import { PORT, MongoDBURL } from './config.js'
import { MongoClient, ServerApiVersion } from "mongodb"

const app = express()

app.use(express.json())

const client = new MongoClient(MongoDBURL, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
}
);

const tasksDB = client.db("ToDotasks")
const mytasks = tasksDB.collection("taskscollection")




app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`)

})

app.post('/task1', (req, res) => {

    const data = req.body

    //if (!description) {
    //    return res.status(400).send("No task description found");
    //}

    if (data.description.length > 160) {
        return res.status(400).send("Task description too long "+data.description.length);

    }
    mytasks.insertOne(data)
        .then(response => {
            return res.status(201).send(JSON.stringify(data.description)+data.description.length);
        })
        .catch(err =>console.log(err))
            
            
})
