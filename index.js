const http = require("http");
const app = require("./servers/app");
const credentials = require("./credential/credential");
const server = http.createServer(app);
const cluster = require("cluster");
const os = require("os").cpus();

const port = credentials.SERVER_PORT;

if (cluster.isMaster) {
  for (var i = 0; i < os.length; i++) {
    cluster.fork();
  }
  cluster.on("exit", () => {
    console.log("exit server");
  });
} else {
  server.listen(port, (err) => {
    if (err) {
      console.log(err.message);
    } else {
      console.log("server started", port);
    }
  });
}
