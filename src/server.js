require("dotenv").config();

const app = require("./app");

app.listen(process.env.PORT, () => {
  console.log(`server is running on localhost:${process.env.PORT}.`);
});
