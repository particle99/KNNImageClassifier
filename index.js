const express = require("express");
const path = require("path");

const app = express();

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/main.html"));
});

app.get("/knn.js", (req, res) => {
    res.sendFile(path.join(__dirname, "/knn.js"));
})

app.listen(8000, () => console.log("simulation running"));