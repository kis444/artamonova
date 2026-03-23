// app/api/meet/create/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { google } from 'googleapis'

export async function POST(req: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { startTime, endTime, studentEmail, studentName, lessonTitle } = await req.json()

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    )

    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    const event = {
      summary: `📚 ${lessonTitle || 'English Lesson'} with ${studentName}`,
      description: `English lesson with ${studentName}\n\nBooked via ARTAMONOVA platform.`,
      start: {
        dateTime: startTime,
        timeZone: 'Europe/Chisinau',
      },
      end: {
        dateTime: endTime,
        timeZone: 'Europe/Chisinau',
      },
      attendees: [
        { email: studentEmail },
        { email: session.user.email },
      ],
      conferenceData: {
        createRequest: {
          requestId: `${Date.now()}-${Math.random()}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 60 },
          { method: 'popup', minutes: 30 },
        ],
      },
    }

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      conferenceDataVersion: 1,
      sendUpdates: 'all',
    })

    return NextResponse.json({
      success: true,
      meetLink: response.data.hangoutLink,
      eventId: response.data.id,
      calendarLink: response.data.htmlLink,
    })
  } catch (error) {
    console.error('Google Meet error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create meeting' },
      { status: 500 }
    )
  }
}