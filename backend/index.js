const express = require("express")
const app= express()

app.get("/test",(req,res)=>{
    res.send("Hello world")
})

app.listen(3000, ()=>{
    console.log("server running on port 3000")
})
