const {getMeetingChart}=require('../controllers/Chart')
const authMiddleware = require('../middleware/authMiddleware');
const express = require('express');
const {getAITimeSavedChart}=require('../controllers/timeSavingChart')
const {getTopContributors}=require('../controllers/contributer')
const { getStats, getUsers } = require('../controllers/getStats');



const countRouter = express.Router();


// All meeting routes require authorization
countRouter.use(authMiddleware);

countRouter.get("/stats", getStats);
countRouter.get("/chart", getMeetingChart);
countRouter.get("/ai-chart", getAITimeSavedChart);
countRouter.get("/contributors", getTopContributors);

countRouter.get("/users", getUsers);
module.exports = countRouter;
