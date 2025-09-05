"use client"

import { useAuth } from "@/lib/auth"

export default function DebugAuth() {
  const { user, profile, loading, isAdmin } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Debug Information</h1>
      
      <div className="space-y-4">
        <div className="border rounded p-4">
          <h2 className="font-semibold">User Info:</h2>
          <pre className="text-sm bg-gray-100 p-2 rounded mt-2">
            {JSON.stringify({ 
              id: user?.id, 
              email: user?.email,
              user_metadata: user?.user_metadata 
            }, null, 2)}
          </pre>
        </div>
        
        <div className="border rounded p-4">
          <h2 className="font-semibold">Profile Info:</h2>
          <pre className="text-sm bg-gray-100 p-2 rounded mt-2">
            {JSON.stringify(profile, null, 2)}
          </pre>
        </div>
        
        <div className="border rounded p-4">
          <h2 className="font-semibold">Admin Status:</h2>
          <p>isAdmin: {isAdmin ? 'YES' : 'NO'}</p>
          <p>Role from profile: {profile?.role || 'undefined'}</p>
        </div>
      </div>
    </div>
  )
}