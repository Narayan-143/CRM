const express = require('express');
const router = express.Router();
const {
  getDeals,
  getDealById,
  createDeal,
  updateDeal,
  updateDealStage,
  deleteDeal,
} = require('../controllers/dealController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(getDeals)
  .post(createDeal);

router.route('/:id')
  .get(getDealById)
  .put(updateDeal)
  .delete(deleteDeal);

router.patch('/:id/stage', updateDealStage);

module.exports = router;
