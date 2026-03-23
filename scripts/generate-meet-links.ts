// scripts/generate-meet-links.ts
import { connectDB } from '../lib/mongodb.ts'
import { Booking } from '../models/Booking.ts'

async function generateMeetLinks() {
  await connectDB()
  console.log('✅ Connected to database')

  // Găsește toate booking-urile care sunt confirmed dar nu au meetLink
  const bookings = await Booking.find({
    status: 'confirmed',
    meetLink: { $in: [null, '', 'https://meet.google.com/your-meet-link'] }
  }).populate('studentId', 'name email')

  console.log(`Found ${bookings.length} bookings without meet links`)

  let updated = 0
  let failed = 0

  for (const booking of bookings) {
    try {
      // Generează Meet link folosind API-ul
      const response = await fetch(`${process.env.NEXTAUTH_URL}/api/meet/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startTime: new Date(`${booking.date}T${booking.time}`).toISOString(),
          endTime: new Date(`${booking.date}T${booking.time}`).toISOString(),
          studentEmail: booking.studentId?.email,
          studentName: booking.studentId?.name || 'Student',
          lessonTitle: booking.programName,
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Salvează meetLink în booking
        booking.meetLink = data.meetLink
        await booking.save()
        updated++
        console.log(`✅ Updated booking ${booking._id}: ${data.meetLink}`)
      } else {
        failed++
        console.error(`❌ Failed for booking ${booking._id}:`, data.error)
      }
    } catch (error) {
      failed++
      console.error(`❌ Error for booking ${booking._id}:`, error)
    }
  }

  console.log(`\n📊 Summary: ${updated} updated, ${failed} failed`)
  process.exit()
}

generateMeetLinks().catch(console.error)