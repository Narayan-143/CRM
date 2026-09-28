const Contact = require('../models/Contact');
const Deal = require('../models/Deal');

// @desc    Get all contacts for logged-in user with optional search
// @route   GET /api/contacts?search=john
// @access  Private
const getContacts = async (req, res) => {
  try {
    const query = { userId: req.user._id };

    if (req.query.search && req.query.search.trim() !== '') {
      const searchRegex = new RegExp(req.query.search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { company: searchRegex },
        { phone: searchRegex },
      ];
    }

    const contacts = await Contact.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching contacts',
    });
  }
};

// @desc    Get single contact by ID
// @route   GET /api/contacts/:id
// @access  Private
const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }

    // Also fetch associated deals for convenience
    const deals = await Deal.find({
      contactId: contact._id,
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        ...contact.toObject(),
        deals,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching contact details',
    });
  }
};

// @desc    Create a new contact
// @route   POST /api/contacts
// @access  Private
const createContact = async (req, res) => {
  try {
    const { name, email, phone, company, notes } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Contact name is required',
      });
    }

    const contact = await Contact.create({
      name,
      email: email || '',
      phone: phone || '',
      company: company || '',
      notes: notes || '',
      userId: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Contact created successfully',
      data: contact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating contact',
    });
  }
};

// @desc    Update a contact
// @route   PUT /api/contacts/:id
// @access  Private
const updateContact = async (req, res) => {
  try {
    const { name, email, phone, company, notes } = req.body;

    const contact = await Contact.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }

    if (name) contact.name = name;
    if (email !== undefined) contact.email = email;
    if (phone !== undefined) contact.phone = phone;
    if (company !== undefined) contact.company = company;
    if (notes !== undefined) contact.notes = notes;

    const updatedContact = await contact.save();

    res.status(200).json({
      success: true,
      message: 'Contact updated successfully',
      data: updatedContact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating contact',
    });
  }
};

// @desc    Delete a contact
// @route   DELETE /api/contacts/:id
// @access  Private
const deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact not found',
      });
    }

    await Contact.deleteOne({ _id: contact._id });

    // Detach contact from any deals
    await Deal.updateMany(
      { contactId: contact._id, userId: req.user._id },
      { $set: { contactId: null } }
    );

    res.status(200).json({
      success: true,
      message: 'Contact deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error deleting contact',
    });
  }
};

module.exports = {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
};
