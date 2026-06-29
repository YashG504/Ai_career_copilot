import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/career-copilot';

async function main() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB for test data');

  const User = require('../models/User').default;
  const Resume = require('../models/Resume').default;

  // Create uploads dir and dummy file
  const uploadDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, 'resume-test.pdf');
  fs.writeFileSync(filePath, 'This is a test resume content. Skills: JavaScript, Node.js, React.\nExperience: 3 years.');

  // Create test user
  const email = 'testuser+auto@example.com';
  const password = 'password123';
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ name: 'Auto Test', email, password });
    console.log('Created user:', email);
  } else {
    console.log('User already exists:', email);
  }

  // Create resume
  const existing = await Resume.findOne({ user: user._id, originalName: 'resume-test.pdf' });
  if (!existing) {
    const resume = await Resume.create({
      user: user._id,
      fileName: 'resume-test.pdf',
      originalName: 'resume-test.pdf',
      fileSize: fs.statSync(filePath).size,
      fileType: 'application/pdf',
      extractedText: 'This is a test resume content. Skills: JavaScript, Node.js, React. Experience: 3 years. Achievements: Improved app performance by 20%.',
      version: 1,
      label: 'Auto Test Resume'
    });
    console.log('Created resume id:', resume._id.toString());
  } else {
    console.log('Resume already exists with id:', existing._id.toString());
  }

  await mongoose.disconnect();
  console.log('Done');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
