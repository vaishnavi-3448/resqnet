const express = require('express');
const router = express.Router();
const {
  createRequest,
  getAllRequests,
  getMyRequests,
  getRequestById,
  claimRequest,
  resolveRequest,
  getNearbyRequests
} = require('../controllers/requestController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes require login
router.use(protect);

router.post('/', authorize('victim'), createRequest);
router.get('/', authorize('volunteer', 'ngo', 'admin'), getAllRequests);
router.get('/my', authorize('victim'), getMyRequests);
router.get('/nearby', authorize('volunteer', 'ngo'), getNearbyRequests);
router.get('/:id', getRequestById);
router.put('/:id/claim', authorize('volunteer', 'ngo'), claimRequest);
router.put('/:id/resolve', authorize('volunteer', 'ngo', 'admin'), resolveRequest);

module.exports = router;