const { generateFollowUpEmail } = require('../services/aiService');

// @desc    Generate follow-up email draft with AI
// @route   POST /api/ai/follow-up
// @access  Private
const generateFollowUp = async (req, res) => {
  try {
    const { contactName, company, notes, dealTitle, dealStage, dealValue } = req.body;

    if (!contactName && !dealTitle) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least a contact name or deal title for email generation',
      });
    }

    const emailDraft = await generateFollowUpEmail({
      contactName,
      company,
      notes,
      dealTitle,
      dealStage,
      dealValue,
    });

    res.status(200).json({
      success: true,
      data: emailDraft,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to generate AI follow-up email',
    });
  }
};

module.exports = {
  generateFollowUp,
};
