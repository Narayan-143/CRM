const Deal = require('../models/Deal');

const VALID_STAGES = ['New', 'Contacted', 'Qualified', 'Won', 'Lost'];

// @desc    Get all deals for logged-in user
// @route   GET /api/deals
// @access  Private
const getDeals = async (req, res) => {
  try {
    const deals = await Deal.find({ userId: req.user._id })
      .populate('contactId', 'name email company')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: deals.length,
      data: deals,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching deals',
    });
  }
};

// @desc    Get single deal by ID
// @route   GET /api/deals/:id
// @access  Private
const getDealById = async (req, res) => {
  try {
    const deal = await Deal.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate('contactId', 'name email company phone notes');

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found',
      });
    }

    res.status(200).json({
      success: true,
      data: deal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching deal',
    });
  }
};

// @desc    Create a new deal
// @route   POST /api/deals
// @access  Private
const createDeal = async (req, res) => {
  try {
    const { title, contactId, value, stage, notes } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Deal title is required',
      });
    }

    const assignedStage = stage && VALID_STAGES.includes(stage) ? stage : 'New';

    const deal = await Deal.create({
      title,
      contactId: contactId || null,
      value: Number(value) || 0,
      stage: assignedStage,
      notes: notes || '',
      userId: req.user._id,
    });

    const populatedDeal = await Deal.findById(deal._id).populate(
      'contactId',
      'name email company'
    );

    res.status(201).json({
      success: true,
      message: 'Deal created successfully',
      data: populatedDeal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating deal',
    });
  }
};

// @desc    Update a deal
// @route   PUT /api/deals/:id
// @access  Private
const updateDeal = async (req, res) => {
  try {
    const { title, contactId, value, stage, notes } = req.body;

    const deal = await Deal.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found',
      });
    }

    if (title) deal.title = title;
    if (contactId !== undefined) deal.contactId = contactId || null;
    if (value !== undefined) deal.value = Number(value) || 0;
    if (stage && VALID_STAGES.includes(stage)) deal.stage = stage;
    if (notes !== undefined) deal.notes = notes;

    await deal.save();

    const updatedDeal = await Deal.findById(deal._id).populate(
      'contactId',
      'name email company'
    );

    res.status(200).json({
      success: true,
      message: 'Deal updated successfully',
      data: updatedDeal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating deal',
    });
  }
};

// @desc    Update deal stage (for Kanban drag & drop)
// @route   PATCH /api/deals/:id/stage
// @access  Private
const updateDealStage = async (req, res) => {
  try {
    const { stage } = req.body;

    if (!stage || !VALID_STAGES.includes(stage)) {
      return res.status(400).json({
        success: false,
        message: `Invalid stage. Must be one of: ${VALID_STAGES.join(', ')}`,
      });
    }

    const deal = await Deal.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found',
      });
    }

    deal.stage = stage;
    await deal.save();

    const populatedDeal = await Deal.findById(deal._id).populate(
      'contactId',
      'name email company'
    );

    res.status(200).json({
      success: true,
      message: 'Deal stage updated successfully',
      data: populatedDeal,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating deal stage',
    });
  }
};

// @desc    Delete a deal
// @route   DELETE /api/deals/:id
// @access  Private
const deleteDeal = async (req, res) => {
  try {
    const deal = await Deal.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found',
      });
    }

    await Deal.deleteOne({ _id: deal._id });

    res.status(200).json({
      success: true,
      message: 'Deal deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting deal',
    });
  }
};

module.exports = {
  getDeals,
  getDealById,
  createDeal,
  updateDeal,
  updateDealStage,
  deleteDeal,
};
