const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');
const Contact = require('./models/Contact');
const Deal = require('./models/Deal');

const seedData = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/mini-crm';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB for seeding');

    // Check or create demo user
    let user = await User.findOne({ email: 'demo@crm.com' });
    if (!user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      user = await User.create({
        name: 'Alex Rivera',
        email: 'demo@crm.com',
        password: hashedPassword,
      });
      console.log('Created demo user: demo@crm.com / password123');
    } else {
      console.log('Demo user already exists: demo@crm.com');
    }

    // Check if contacts already exist for this user
    const existingContacts = await Contact.countDocuments({ userId: user._id });
    if (existingContacts === 0) {
      console.log('Seeding demo contacts...');
      const contacts = await Contact.insertMany([
        {
          name: 'Sarah Connor',
          email: 'sarah@cyberdyne.io',
          phone: '+1 (555) 234-5678',
          company: 'Cyberdyne Systems',
          notes: 'Looking for a unified solution to manage enterprise accounts. Decision maker.',
          userId: user._id,
        },
        {
          name: 'Michael Scott',
          email: 'mscott@dundermifflin.com',
          phone: '+1 (555) 987-6543',
          company: 'Dunder Mifflin Paper Co',
          notes: 'Interested in bulk paper supply renewal contract for regional offices.',
          userId: user._id,
        },
        {
          name: 'Elena Rostova',
          email: 'elena@novatech.co',
          phone: '+1 (555) 456-7890',
          company: 'NovaTech Solutions',
          notes: 'Needs AI workflow integration for outbound sales team.',
          userId: user._id,
        },
        {
          name: 'David Kim',
          email: 'david.kim@apexventures.com',
          phone: '+1 (555) 345-6789',
          company: 'Apex Ventures',
          notes: 'Met at SaaStr annual summit. Discussed expansion licenses.',
          userId: user._id,
        },
      ]);

      console.log('Seeding demo deals across Kanban stages...');
      await Deal.insertMany([
        {
          title: 'Cyberdyne Enterprise Migration',
          contactId: contacts[0]._id,
          value: 45000,
          stage: 'Qualified',
          notes: 'Demo completed. Security review in progress.',
          userId: user._id,
        },
        {
          title: 'Dunder Mifflin Annual Contract',
          contactId: contacts[1]._id,
          value: 12000,
          stage: 'Contacted',
          notes: 'Sent initial pricing proposal and contract terms.',
          userId: user._id,
        },
        {
          title: 'NovaTech AI Integration Pack',
          contactId: contacts[2]._id,
          value: 28000,
          stage: 'Won',
          notes: 'Signed 1-year contract! Onboarding scheduled.',
          userId: user._id,
        },
        {
          title: 'Apex Ventures Cloud Pilot',
          contactId: contacts[3]._id,
          value: 8500,
          stage: 'New',
          notes: 'Initial inbound lead from website contact form.',
          userId: user._id,
        },
        {
          title: 'Legacy Hardware Upgrade',
          contactId: null,
          value: 5000,
          stage: 'Lost',
          notes: 'Client postponed budget to next fiscal year.',
          userId: user._id,
        },
      ]);

      console.log('✓ Seeding complete!');
    } else {
      console.log('Demo data already seeded.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

seedData();
