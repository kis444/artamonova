import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { connectDB } from '../lib/mongodb'
import { User } from '../models/User'

async function check() {
  await connectDB()
  const students = await User.find({ role: 'student' }).select('name email permanentMeetLink')
  console.log('Students:')
  students.forEach(s => {
    console.log(`- ${s.name} (${s.email}): ${s.permanentMeetLink || '❌ NO LINK'}`)
  })
  process.exit()
}

check()
