import express from 'express'
import { PORT, MongoDBURL } from './config.js'
import { MongoClient, ObjectId, ServerApiVersion } from "mongodb"

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

//Add a task (max length 160 characters)
app.post('/task1', (req, res) => {

    const data = req.body


    if (data.description.length > 160) {
        return res.status(400).send("Task description too long " + data.description.length);

    }
    mytasks.insertOne(data)
        .then(response => {
            return res.status(201).send(JSON.stringify(data.description) + data.description.length);
        })
        .catch(err => console.log(err))


})


//List the status (completed or to be completed) of a task

app.get('/task3/:taskId/status', (req, res) => {
    const { taskId } = req.params;

    if (!taskId) {
        return res.status(400).send("Task ID is required");
    }

    mytasks.findOne({ _id: new ObjectId(taskId) })
        .then(task => {
            if (!task) {
                return res.status(404).send("Task not found");
            }

            const status = task.completed ? "completed" : "to be completed";
            return res.status(200).json({ status });
        })
        .catch(err => {
            console.error('Error fetching task status:', err);
            res.status(500).send("Server error");
        });
});


// List completed tasks only
app.get('/task/completed', async (req, res) => {
    const completedTasks = await
        mytasks.find({ completed: true }).toArray();
    res.status(200).json(completedTasks);
});



// Mark a task as completed or to be completed
app.put('/task/:taskId/status', (req, res) => {
    const { taskId } = req.params;
    const { completed } = req.body;

    if (completed === undefined || typeof completed !== 'boolean') {
        return res.status(400).send("Invalid value for 'completed'. Use 'true' or 'false'");
    }

    mytasks.updateOne(
        { _id: new ObjectId(taskId) },
        { $set: { completed } }
    )
    .then(result => {
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.status(200).json({ message: 'Task status updated successfully' });
    })
    .catch(err => {
        console.error('Error updating task status:', err);
        res.status(500).send("Server error");
    });
});



//Delete a task

app.delete('/delete/:taskId', (req, res) => {
    const { taskId } = req.params;

    mytasks.deleteOne({ _id: new ObjectId(taskId) })
        .then(result => {
            if (result.deletedCount === 0) {
                return res.status(404).json({ error: 'Task not found' });
            }
            res.status(200).json({ message: 'Task deleted successfully' });
        })
        .catch(err => {
            console.error('Error deleting task:', err);
            res.status(500).send("Server error");
        });
});

