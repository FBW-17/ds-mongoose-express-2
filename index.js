const express = require("express")
const api = express()
const mongoose = require("mongoose")
const faker = require("faker")

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    firstname: String,
    lastname: String,
    isAdmin: Boolean
}, {versionKey: false})

const User = mongoose.model("users", userSchema)

api.use(express.json())
api.use((req, res, next) => {
    res.set("ACCESS-CONTROL-ALLOW-ORIGIN", "*")
    res.set("ACCESS-CONTROL-ALLOW-HEADERS", "*")
    res.set("ACCESS-CONTROL-ALLOW-METHODS", "*")
    next()
})


api.listen(3000, () => console.log("Listening on port 3000"))

mongoose.connect("mongodb://localhost/users", {
    useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false
})

api.get("/seed", (req, res, next) => {    
    // seed 5 fresh records into users collection
    for(let i=0; i<5; i++) {
        let user = new User({
            name: faker.name.findName(), 
            isAdmin: faker.random.boolean()
        })
        user.save()
    }
})

api.get("/user", async (req, res, next) => {
    let users = await User.find()
    res.send(users)
})

api.get("/user/:id", async (req, res, next) => {
    let id = req.params.id
    console.log(id)
    try {
        let user = await User.findById(id)
        res.send(user)
    }
    catch(err) { next(err) }
})

api.post("/user", async (req, res, next) => {
    let userPosted = req.body
    try {
        let user = await User.create(req.body)
        console.log("User created: ", userPosted)
        res.send(user)
    }
    catch(err) { next(err) }
})

api.patch("/user/:id", async (req, res, next) => {
    let id = req.params.id
    console.log(id)
    console.log(req.body)
    try {
        let user = await User.findByIdAndUpdate(id, req.body, { new: true })
        console.log("User Updated", user)
        res.send(user)
    }
    catch(err) { next(err) }
})

api.delete("/user/:id", async (req, res, next) => {
    let id = req.params.id
    console.log(id)
    try {
        let user = await User.findByIdAndDelete(id)
        res.send(user)
    }
    catch(err) { next(err) }
})

api.use((err, req, res, next) => {
    console.log("ERROR occured:")
    console.log(err.message || err)
    res.status(500).send({
        error: err.message || err
    })
})

/**
 * FETCH statements:
 * 
 * GET: fetch('http://localhost:3000/user')
 * GET: fetch('http://localhost:3000/user/15')
 * POST: fetch('http://localhost:3000/user', {
             method: "POST", headers: {"Content-Type": "application/json"},
             body: JSON.stringify({firstname: "Firstname", lastname: "Lastname"})
         })
   PATCH: fetch('http://localhost:3000/user/15', {
             method: "PATCH", headers: {"Content-Type": "application/json"},
             body: JSON.stringify({firstname: "FirstnameNew", lastname: "LastnameNew"})
         })
   DELETE: fetch('http://localhost:3000/user/7', { method: "DELETE" })
         })
*/
