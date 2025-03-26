'use client'

import * as React from 'react'
import { OAuthStrategy } from '@clerk/types'
import { useSignUp } from '@clerk/nextjs'

export default function OauthSignUp() {
  const { signUp } = useSignUp()

  if (!signUp) return null

  const signUpWith = (strategy: OAuthStrategy) => {
    return signUp
      .authenticateWithRedirect({
        strategy,
        redirectUrl: '/sign-up/sso-callback',
        redirectUrlComplete: '/dashboard',
      })
      .then((res) => {
        console.log(res)
      })
      .catch((err: any) => {
        // See https://clerk.com/docs/custom-flows/error-handling
        // for more info on error handling
        console.log(err.errors)
        console.error(err, null, 2)
      })
  }

  // Render a button for Apple OAuth authentication
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-2xl font-bold mb-4">Sign up with OAuth</h1>
      <button 
        onClick={() => signUpWith('oauth_apple')}
        className="px-4 py-2 bg-black text-white rounded-md flex items-center gap-2 hover:bg-gray-800 transition-colors"
      >
        Sign up with Apple
      </button>
    </div>
  )
} 