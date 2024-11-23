const express = require('express');
const path = require('path');
const router = express.Router();


// Static Routes
// Set up "public" folder / subfolders for static files
router.use(express.static("public"));
router.use("/css", express.static(__dirname + "public/css"));
router.use("/js", express.static(__dirname + "public/js"));
router.use("/images", express.static(__dirname + "public/images"));

// Serve favicon
router.get('/favicon.ico', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/images/site/favicon-32x32.png'));
  });

module.exports = router;