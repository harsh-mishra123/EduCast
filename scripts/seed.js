require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const config = require('../src/shared/config/env');
const { logger } = require('../src/shared/utils/logger');

async function seedAuth() {
  const User = require('../src/services/auth/models/User');
  
  const users = [
    {
      name: 'Admin User',
      email: 'admin@classcast.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'admin',
      isEmailVerified: true
    },
    {
      name: 'Test Educator',
      email: 'educator@classcast.com',
      password: await bcrypt.hash('educator123', 10),
      role: 'educator',
      isEmailVerified: true
    },
    {
      name: 'Test Student',
      email: 'student@classcast.com',
      password: await bcrypt.hash('student123', 10),
      role: 'student',
      isEmailVerified: true
    }
  ];
  
  for (const user of users) {
    await User.findOneAndUpdate(
      { email: user.email },
      user,
      { upsert: true, new: true }
    );
  }
  
  logger.info('Auth database seeded');
}

async function seedClass() {
  const Course = require('../src/services/class/models/Course');
  const LiveLecture = require('../src/services/class/models/LiveLecture');
  
  const educator = await mongoose.connection.db
    .collection('users')
    .findOne({ email: 'educator@classcast.com' });
  
  if (educator) {
    await Course.findOneAndUpdate(
      { title: 'Sample Course' },
      {
        educatorId: educator._id,
        title: 'Sample Course',
        description: 'This is a sample course for testing',
        price: 999,
        status: 'published',
        sections: [
          {
            title: 'Introduction',
            order: 0,
            videos: [
              { title: 'Welcome Video', videoUrl: 'https://example.com/video1.mp4', order: 0 }
            ]
          }
        ]
      },
      { upsert: true }
    );
    
    await LiveLecture.findOneAndUpdate(
      { title: 'Sample Live Lecture' },
      {
        educatorId: educator._id,
        title: 'Sample Live Lecture',
        description: 'Join this live session to learn about ClassCast',
        price: 499,
        scheduledStartTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        scheduledEndTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
        status: 'scheduled'
      },
      { upsert: true }
    );
  }
  
  logger.info('Class database seeded');
}

async function seed() {
  try {
    // Connect to each database
    const authConn = await mongoose.createConnection(config.MONGO_AUTH_URI);
    const classConn = await mongoose.createConnection(config.MONGO_CLASS_URI);
    
    // Set up models
    const User = require('../src/services/auth/models/User');
    const Course = require('../src/services/class/models/Course');
    const LiveLecture = require('../src/services/class/models/LiveLecture');
    
    // Seed auth
    const users = [
      {
        name: 'Admin User',
        email: 'admin@classcast.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        isEmailVerified: true
      },
      {
        name: 'Test Educator',
        email: 'educator@classcast.com',
        password: await bcrypt.hash('educator123', 10),
        role: 'educator',
        isEmailVerified: true
      },
      {
        name: 'Test Student',
        email: 'student@classcast.com',
        password: await bcrypt.hash('student123', 10),
        role: 'student',
        isEmailVerified: true
      }
    ];
    
    for (const user of users) {
      await User.findOneAndUpdate(
        { email: user.email },
        user,
        { upsert: true, new: true }
      );
    }
    
    // Get educator ID
    const educator = await User.findOne({ email: 'educator@classcast.com' });
    
    if (educator) {
      await Course.findOneAndUpdate(
        { title: 'Sample Course' },
        {
          educatorId: educator._id,
          title: 'Sample Course',
          description: 'This is a sample course for testing',
          price: 999,
          status: 'published',
          sections: [
            {
              title: 'Introduction',
              order: 0,
              videos: [
                { title: 'Welcome Video', videoUrl: 'https://example.com/video1.mp4', duration: 120, order: 0 }
              ]
            }
          ]
        },
        { upsert: true }
      );
      
      await LiveLecture.findOneAndUpdate(
        { title: 'Sample Live Lecture' },
        {
          educatorId: educator._id,
          title: 'Sample Live Lecture',
          description: 'Join this live session to learn about ClassCast',
          price: 499,
          scheduledStartTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          scheduledEndTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
          status: 'scheduled'
        },
        { upsert: true }
      );
    }
    
    logger.info('Database seeding completed!');
    process.exit(0);
  } catch (error) {
    logger.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();