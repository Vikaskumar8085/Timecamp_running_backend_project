const cron = require("node-cron");
const Project = require("../../models/Othermodels/Projectmodels/Project");
const Client = require("../../models/AuthModels/Client/Client");

const clientstatuschange = async () => {
  try {
    const today = new Date();
    const expiredProjects = await Project.find({End_Date: {$lt: today}});
    for (const project of expiredProjects) {
      await Client.findOneAndUpdate(
        {Client_Id: project.clientId},
        {Client_Status: "Dead"}
      );
      console.log(`Updated Client ${project.clientId} status to Dead.`);
    }

    console.log("Client status update completed.");
  } catch (error) {
    console.error("Error updating client statuses:", error);
  }
};

module.exports = {
  clientstatuschange,
};
