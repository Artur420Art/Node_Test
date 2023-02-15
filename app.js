const { query } = require('express');
const express = require('express');
const app = express();
const PORT = 3000;
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb://127.0.0.1:27017";
app.use(express.urlencoded({extended: true}));

const client = new MongoClient(uri, { 
    useNewUrlParser: true,
    useUnifiedTopology : true 
});
const db = client.db('test');
const col_user = db.collection('users');
const col_lib = db.collection('library');
const now_user = "";
app.post('/registration', (req, res) => {
    col_user.insertOne({name : req.body.name, age : req.body.age})
    res.send("Ok")
})

app.post('/addBook', (req, res) => {
    counter = req.query.q
    col_lib.insertOne({name : req.body.name, description : req.body.description, count: counter }).then(()=> {
        res.send("ok")
    }).catch(err => {
        res.send(err);
    })
})
app.get('/books', async(req, res) => {
    books_name = req.query.q;
    let sendResult = [];
    const Result = await col_lib.find( { name : { $regex : books_name, $options : "i"}}).toArray();
    Result.forEach((element) => {
        sendResult.push(element.name);
        var counter = element.count;
        counter--;
        col_lib.updateOne({count: element.count}, {$set: {count: counter }}, {upsert: true})
    .then(() => {res.send("done!!")})
    .catch(err => {req.send("error!!!")});
        if(element.count === 0) {
            res.send("Nothing");
        }
    });
    res.send(sendResult);
    res.send("Ok")
})
app.get('/delete', async(req, res) => {
    books_name = req.query.q;
    col_lib.findOneAndDelete({name : books_name}).then(() => {
        res.send("Deleted");
    }).catch(err => {res.send(err)});
})

app.listen(PORT);