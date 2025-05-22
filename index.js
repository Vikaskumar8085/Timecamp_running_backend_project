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
// const moment = require("moment");

// const employees = [
//   {name: "John", joiningDate: "2021/05/15"},
//   {name: "Alice", joiningDate: "2021/06/20"},
//   {name: "Bob", joiningDate: "2022/01/10"},
//   {name: "Charlie", joiningDate: "2023/03/01"},
//   {name: "Daisy", joiningDate: "2024/07/25"},
//   {name: "SeniorDev", joiningDate: "2013/01/15"}, // more than 10 years
//   {name: "Intern", joiningDate: "2025/03/10"}, // less than 1 year
// ];

// // Filter employees with 1–10 years of experience
// const filteredEmployees = employees
//   .map((emp) => {
//     const join = moment(emp.joiningDate);
//     const now = moment();
//     const years = now.diff(join, "years");
//     return {...emp, experienceYears: years};
//   })
//   .filter((emp) => emp.experienceYears >= 1 && emp.experienceYears <= 10)
//   .map((emp) => ({
//     name: emp.name,
//     experience: `${emp.experienceYears} years`,
//   }));

// console.log(filteredEmployees);
