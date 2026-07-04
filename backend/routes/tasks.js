const express = require("express");
const router = express.Router();

const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");

router.get("/", getTasks);

router.post("/create", createTask);

router.delete("/:id", deleteTask);
module.exports = router;