const User = require('../models/User');
const Item = require('../models/Item');
const Hostel = require('../models/Hostel');
const Room = require('../models/Room');
const Notice = require('../models/Notice');
const Mess = require('../models/Mess');

const seedInitialData = async () => {
  try {
    // 1. Seed Demo Users if not present
    const demoUsers = [
      {
        name: 'Super Administrator',
        email: 'admin@mountreach.com',
        password: 'admin123',
        role: 'admin',
      },
      {
        name: 'Chief Warden Office',
        email: 'warden@mountreach.com',
        password: 'warden123',
        role: 'warden',
      },
      {
        name: 'Tanmay Developer',
        email: 'developer@mountreach.com',
        password: 'dev123456',
        role: 'admin',
      },
      {
        name: 'Demo Student Resident',
        email: 'student@mountreach.com',
        password: 'student123',
        role: 'student',
      },
    ];

    for (const userData of demoUsers) {
      const exists = await User.findOne({ email: userData.email });
      if (!exists) {
        await User.create(userData);
        console.log(`🌱 Seeded user: ${userData.email} (${userData.role})`);
      }
    }

    const devUser = await User.findOne({ email: 'developer@mountreach.com' }) || await User.findOne({});

    if (devUser) {
      // 2. Seed Sample Items if table is empty
      const itemsCount = await Item.countDocuments();
      if (itemsCount === 0) {
        const sampleItems = [
          {
            title: 'Hostel Smart Access Keycard',
            description: 'RFID NFC enabled secure door lock keycard for students and staff.',
            category: 'Security',
            status: 'active',
            createdBy: devUser._id,
          },
          {
            title: 'High-Speed Wi-Fi Router 6E',
            description: 'Dual-band gigabit mesh network router installed on Block A 2nd Floor.',
            category: 'Networking',
            status: 'active',
            createdBy: devUser._id,
          },
          {
            title: 'Mess Digital Meal Tracker',
            description: 'Automated QR code based student meal punch card and verification terminal.',
            category: 'Mess & Food',
            status: 'completed',
            createdBy: devUser._id,
          },
          {
            title: 'Ergonomic Hostel Study Desk & Chair',
            description: 'Heavy duty wooden desk with LED reading lamp attachment.',
            category: 'Furniture',
            status: 'active',
            createdBy: devUser._id,
          },
          {
            title: 'Solar Water Heater 500L',
            description: 'Rooftop green energy solar thermal water heating system for winter mornings.',
            category: 'Maintenance',
            status: 'active',
            createdBy: devUser._id,
          },
        ];
        await Item.insertMany(sampleItems);
        console.log(`🌱 Seeded ${sampleItems.length} initial items`);
      }

      // 3. Seed Sample Hostel Blocks if empty
      const hostelCount = await Hostel.countDocuments();
      if (hostelCount === 0) {
        const wardenUser = await User.findOne({ role: 'warden' }) || devUser;
        const blockA = await Hostel.create({
          name: 'Sahyadri Boys Hostel (Block A)',
          code: 'SAY-A',
          gender: 'boys',
          totalFloors: 4,
          totalRooms: 48,
          warden: wardenUser._id,
          facilities: ['High-speed Wi-Fi', 'Gymnasium', '24/7 RO Water', 'Laundry Room', 'CCTV Security'],
          description: 'Premier campus hostel for undergraduate and postgraduate male engineering students.',
        });

        const blockB = await Hostel.create({
          name: 'Nilgiri Girls Hostel (Block B)',
          code: 'NIL-B',
          gender: 'girls',
          totalFloors: 4,
          totalRooms: 48,
          warden: wardenUser._id,
          facilities: ['Biometric Entry', 'Wi-Fi 6', 'Reading Hall', 'Cafeteria', 'Emergency Clinic'],
          description: 'Modern and secure residential complex for female students.',
        });

        console.log('🌱 Seeded hostel blocks: Block A and Block B');

        // Seed Sample Rooms
        await Room.create([
          {
            roomNumber: '101',
            hostel: blockA._id,
            floor: 1,
            capacity: 2,
            type: 'AC',
            rentPerMonth: 6500,
            status: 'available',
            amenities: ['AC', 'Attached Bath', '2 Study Desks', 'Balcony'],
          },
          {
            roomNumber: '102',
            hostel: blockA._id,
            floor: 1,
            capacity: 3,
            type: 'Non-AC',
            rentPerMonth: 4500,
            status: 'available',
            amenities: ['Fan', 'Cupboards', '3 Study Desks'],
          },
          {
            roomNumber: '201',
            hostel: blockB._id,
            floor: 2,
            capacity: 2,
            type: 'Deluxe',
            rentPerMonth: 7000,
            status: 'available',
            amenities: ['AC', 'Geyser', 'Balcony', 'Study Table'],
          },
        ]);
        console.log('🌱 Seeded sample hostel rooms');

        // Seed Sample Notices
        await Notice.create([
          {
            title: 'Hostel Re-allotment & Verification for Academic Year 2026',
            content: 'All resident students are requested to complete digital registration on HostelHub and verify fee dues by end of the month.',
            category: 'General',
            priority: 'high',
            targetAudience: 'all',
            postedBy: devUser._id,
          },
          {
            title: 'Special Sunday Feast & Mess Menu Update',
            content: 'This Sunday dinner will feature a special buffet including Paneer Butter Masala, Gulab Jamun, and Biryani.',
            category: 'Mess',
            priority: 'normal',
            targetAudience: 'students',
            postedBy: wardenUser._id,
          },
        ]);
        console.log('🌱 Seeded sample notices');

        // Note: Full 28-meal weekly schedule is seeded with comprehensive menus by messController
        console.log('🌱 Sample notices seeded');
      }
    }
  } catch (err) {
    console.warn('⚠️ Seeder warning:', err.message);
  }
};

module.exports = { seedInitialData };
