const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, completeWizard, uploadPhoto, getDashboard } = require('../controllers/profileController');
const { protect } = require('../middleware/auth');
const { uploadProfile } = require('../middleware/upload');

router.use(protect);
router.get('/', getProfile);
router.put('/', updateProfile);
router.post('/wizard', completeWizard);
router.post('/photo', uploadProfile.single('photo'), uploadPhoto);
router.get('/dashboard', getDashboard);

module.exports = router;
