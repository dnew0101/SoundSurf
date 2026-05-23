const express = require("express");
const router = express.Router();
const jamendoController = require("../controllers/jamendoController");

router.get("/search", jamendoController.searchTracks);
router.get("/config", jamendoController.getConfig);

module.exports = router;
