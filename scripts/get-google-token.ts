// scripts/get-google-token.ts
import { google } from 'googleapis'
import readline from 'readline'
import dotenv from 'dotenv'
import path from 'path'

// Încarcă .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

console.log('Checking environment variables:')
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID || '❌ NOT SET')
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '✅ SET' : '❌ NOT SET')
console.log('GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI || '❌ NOT SET')
console.log('')

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
)

const scopes = ['https://www.googleapis.com/auth/calendar']

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
  prompt: 'consent',
})

console.log('🔗 Authorize this app by visiting this url:')
console.log(authUrl)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

rl.question('\n📝 Enter the code from that page here: ', async (code) => {
  try {
    const { tokens } = await oauth2Client.getToken(code)
    console.log('\n✅ Refresh token obtained!')
    console.log('📋 Add this to your .env.local:')
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`)
    rl.close()
  } catch (err) {
    const error = err as Error
    console.error('❌ Error:', error.message)
    rl.close()
  }
})