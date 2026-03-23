// scripts/check-homework.mjs
import mongoose from 'mongoose'

const MONGODB_URI = 'mongodb+srv://huiznaet078_db_user:Ckt5eHb1IwLE1CD7@cluster0.kdvtxax.mongodb.net/arteng?retryWrites=true&w=majority&appName=Cluster0'

async function checkHomework() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB Atlas')
    
    // Verifică toate colecțiile
    const collections = await mongoose.connection.db.listCollections().toArray()
    console.log('\n📁 Collections in database:')
    collections.forEach(c => console.log(`   - ${c.name}`))
    
    // Verifică modelul Homework
    const Homework = mongoose.models.Homework || mongoose.model('Homework', new mongoose.Schema({}, { strict: false }), 'homeworks')
    
    const total = await Homework.countDocuments()
    console.log(`\n📊 Total homework records: ${total}`)
    
    if (total > 0) {
      const samples = await Homework.find({}).limit(5).lean()
      console.log('\n📝 Sample homework:')
      samples.forEach((hw, i) => {
        console.log(`\n${i + 1}. ID: ${hw._id}`)
        console.log(`   Title: ${hw.title}`)
        console.log(`   Status: ${hw.status}`)
        console.log(`   Student: ${hw.studentName || hw.studentId}`)
        console.log(`   Submission: ${hw.submissionText?.substring(0, 50) || 'No text'}`)
        console.log(`   Created: ${hw.createdAt}`)
      })
    } else {
      console.log('\n❌ No homework found in database')
      console.log('   You need to create some homework first')
    }
    
    await mongoose.disconnect()
    console.log('\n✅ Disconnected')
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

checkHomework()