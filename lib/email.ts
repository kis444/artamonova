// lib/email.ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendPasswordResetEmail(to: string, code: string) {
  try {
    const { error } = await resend.emails.send({
      from: 'ARTamonova English <onboarding@resend.dev>',
      to,
      subject: 'Password Reset Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>Password Reset</h2>
          <p>Your reset code is:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #7c3aed; padding: 16px; background: #f3f4f6; border-radius: 8px; text-align: center;">
            ${code}
          </div>
          <p style="color: #666; margin-top: 16px;">Expires in 15 minutes.</p>
        </div>
      `,
    })
    if (error) console.error('Email error:', error)
    return !error
  } catch (error) {
    console.error('Email error:', error)
    return false
  }
}

export async function sendBookingConfirmation({
  to, name, programName, date, time, meetLink, price, isAdmin = false,
}: {
  to: string; name: string; programName: string
  date: string; time: string; meetLink: string; price: number; isAdmin?: boolean
}) {
  const subject = isAdmin
    ? `New booking: ${name} — ${date} at ${time}`
    : 'Your lesson is confirmed!'

  try {
    const { error } = await resend.emails.send({
      from: 'ARTamonova English <onboarding@resend.dev>',
      to,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">✅ Lesson Confirmed</h2>
          <p>Hello ${name},</p>
          <p>Your lesson has been confirmed and payment received.</p>
          <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; color: #666;">Program</td><td style="padding: 8px; font-weight: bold;">${programName}</td></tr>
            <tr style="background:#f9f9f9"><td style="padding: 8px; color: #666;">Date</td><td style="padding: 8px; font-weight: bold;">${date}</td></tr>
            <tr><td style="padding: 8px; color: #666;">Time</td><td style="padding: 8px; font-weight: bold;">${time}</td></tr>
            <tr style="background:#f9f9f9"><td style="padding: 8px; color: #666;">Price</td><td style="padding: 8px; font-weight: bold;">€${price}</td></tr>
          </table>
          ${meetLink ? `<a href="${meetLink}" style="display:inline-block; background:#7c3aed; color:white; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:bold;">Join Google Meet</a>` : ''}
          <p style="color: #666; margin-top: 16px; font-size: 14px;">⚠️ Important: Payment is required at least 24 hours before the lesson. If payment is not received in time, the lesson will be automatically cancelled.</p>
        </div>
      `,
    })
    if (error) console.error('Email error:', error)
    return !error
  } catch (error) {
    console.error('Email error:', error)
    return false
  }
}

export async function sendLessonReminder({
  to, name, programName, date, time, meetLink,
}: {
  to: string; name: string; programName: string
  date: string; time: string; meetLink: string
}) {
  try {
    const { error } = await resend.emails.send({
      from: 'ARTamonova English <onboarding@resend.dev>',
      to,
      subject: `⏰ Reminder: Your lesson starts in 1 hour`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">⏰ Lesson in 1 Hour!</h2>
          <p>Hello ${name}, your lesson is starting soon.</p>
          <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; color: #666;">Program</td><td style="padding: 8px; font-weight: bold;">${programName}</td></tr>
            <tr style="background:#f9f9f9"><td style="padding: 8px; color: #666;">Date</td><td style="padding: 8px; font-weight: bold;">${date}</td></tr>
            <tr><td style="padding: 8px; color: #666;">Time</td><td style="padding: 8px; font-weight: bold;">${time}</td></tr>
          </table>
          <a href="${meetLink}" style="display:inline-block; background:#7c3aed; color:white; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:bold;">Join Google Meet Now</a>
        </div>
      `,
    })
    if (error) console.error('Email error:', error)
    return !error
  } catch (error) {
    console.error('Email error:', error)
    return false
  }
}

export async function sendCancellationEmail({
  to, name, programName, date, time, reason,
}: {
  to: string; name: string; programName: string
  date: string; time: string; reason: string
}) {
  try {
    const { error } = await resend.emails.send({
      from: 'ARTamonova English <onboarding@resend.dev>',
      to,
      subject: `Lesson Cancelled — ${date} at ${time}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #dc2626;">❌ Lesson Cancelled</h2>
          <p>Hello ${name},</p>
          <p>Unfortunately, your lesson has been cancelled.</p>
          <table style="width:100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px; color: #666;">Program</td><td style="padding: 8px; font-weight: bold;">${programName}</td></tr>
            <tr style="background:#f9f9f9"><td style="padding: 8px; color: #666;">Date</td><td style="padding: 8px; font-weight: bold;">${date}</td></tr>
            <tr><td style="padding: 8px; color: #666;">Time</td><td style="padding: 8px; font-weight: bold;">${time}</td></tr>
            <tr style="background:#f9f9f9"><td style="padding: 8px; color: #666;">Reason</td><td style="padding: 8px; font-weight: bold;">${reason}</td></tr>
          </table>
          <p style="color: #666; font-size: 14px;">Please book a new lesson at your convenience.</p>
        </div>
      `,
    })
    if (error) console.error('Email error:', error)
    return !error
  } catch (error) {
    console.error('Email error:', error)
    return false
  }
}