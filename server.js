var express = require("express");
var app = express();
var path = require("path");
const port = process.env.PORT || 3000;

app.use(express.json());

// main page
app.get("/", function (req, res) {
  try {
    res.sendFile(path.join(__dirname, "index.html"));
  }
  catch (e) {
    res.sendStatus(404);
  }
});

// images
app.get("/img/:rank/:suit", function (req, res) {
  try {
    res.sendFile(path.join(__dirname, 
                           "img",
                           req.params.rank + 
                           "_of_" + 
                           req.params.suit + 
                           ".png"));
  }
  catch (e) {
    res.sendStatus(404);
  }
});

app.listen(port, () => {
  console.log("Poker server started on port " + port);
});

