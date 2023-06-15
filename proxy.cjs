const express = require("express");
const cors = require("cors");
const proxy = require("express-http-proxy");
const morgan = require("morgan");
const port = 5050;

const app = express();

app.use(cors());
app.use(morgan("dev"));

process.on("uncaughtException", (err) => {
  console.error("Uncaught exception: ", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("Unhandled promise rejection: ", err);
  process.exit(1);
});

app.use("/rpc", proxy("127.0.0.1:26657"));

app.use(
  "/rest",
  proxy("127.0.0.1:1317", {
    userResDecorator: function (proxyRes, proxyResData, userReq, userRes) {
      userRes.status(proxyRes.statusCode); // forward the status code
      console.log("Status Code", proxyRes.statusCode);
      console.log("Response Body", proxyResData.toString());

      return proxyResData;
    },
    proxyErrorHandler: function (err, res, next) {
      // handle proxy errors
      console.log("Error in proxy", err);
      res.status(500);
      res.json({ error: "Error in proxy" });
      next();
    },
  })
);

app.listen(port, () => {
  console.log(`Your proxy server is running on port: ${port}`);
});
