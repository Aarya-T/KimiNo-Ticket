import { NextRequest, NextResponse } from 'next/server'
import { makeUserAdmin } from '@/lib/admin-utils'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const result = await makeUserAdmin(userId)
    
    if (result.success) {
      return NextResponse.json({ success: true, message: 'User is now admin' })
    } else {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}