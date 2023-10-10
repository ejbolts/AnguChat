const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const registerRoute = require("./routes/register");
const loginRoute = require("./routes/login");
const updateRoute = require("./routes/update");
const removeRoute = require("./routes/remove");
const groupRoute = require("./routes/group");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/register", registerRoute);
app.use("/login", loginRoute);
app.use("/update", updateRoute);
app.use("/remove", removeRoute);
app.use("/group", groupRoute);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
module.exports = app;
