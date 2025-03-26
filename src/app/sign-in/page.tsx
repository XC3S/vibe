'use client'

import * as React from 'react'
import { OAuthStrategy } from '@clerk/types'
import { useSignIn } from '@clerk/nextjs'

export default function OauthSignIn() {
  const { signIn } = useSignIn()

  if (!signIn) return null

  const signInWith = (strategy: OAuthStrategy) => {
    return signIn
      .authenticateWithRedirect({
        strategy,
        redirectUrl: '/sign-in/sso-callback',
        redirectUrlComplete: '/',
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
      <h1 className="text-2xl font-bold mb-4">Sign in with OAuth</h1>
      <button 
        onClick={() => signInWith('oauth_apple')}
        className="px-4 py-2 bg-black text-white rounded-md flex items-center gap-2 hover:bg-gray-800 transition-colors"
      >
        Sign in with Apple
      </button>
    </div>
  )
} 