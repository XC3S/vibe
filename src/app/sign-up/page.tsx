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
      <h1 className="text-2xl font-bold mb-4">Sign up with OAuth</h1>
      <button 
        onClick={() => signUpWith('oauth_apple')}
        className="px-4 py-2 bg-black text-white rounded-md flex items-center gap-2 hover:bg-gray-800 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.55 4c.33 0 .63.18.79.46.16.28.16.62.02.9-.44.87-1.27 1.45-2.24 1.54-.19.02-.37-.14-.37-.33 0-.19.15-.36.33-.39.7-.06 1.31-.47 1.61-1.09.05-.11.16-.18.27-.18zm3.98 9.45c.14-.26.21-.55.21-.85 0-.98-.76-1.79-1.74-1.85-.31-1.56-1.86-2.69-3.54-2.69-.9 0-1.73.33-2.36.87-.06-.36-.1-.72-.1-1.11 0-3.59 2.91-6.51 6.5-6.51 3.58 0 6.5 2.92 6.5 6.5 0 2.76-1.72 5.11-4.15 6.06-.18.07-.34-.08-.32-.27z"></path>
          <path d="M14.24 15.29c.93.47 1.98.72 3.07.73.24 0 .44.19.44.43s-.2.43-.44.43c-1.26-.01-2.49-.31-3.56-.84-.91.45-1.93.7-3 .7-1.32 0-2.58-.39-3.66-1.12-1.29-.87-2.27-2.18-2.74-3.69-.49-1.58-.44-3.31.16-4.78.59-1.46 1.68-2.65 3.1-3.35 1.32-.65 2.83-.81 4.33-.41 1.46.38 2.78 1.28 3.67 2.54.85 1.2 1.29 2.67 1.22 4.18-.06 1.39-.54 2.73-1.39 3.8-.14.17-.39.21-.57.07-.18-.14-.22-.39-.08-.57.72-.9 1.13-2.02 1.18-3.21.06-1.3-.32-2.56-1.05-3.59-.76-1.08-1.9-1.84-3.18-2.17-1.29-.34-2.57-.2-3.7.35-1.24.61-2.18 1.64-2.69 2.9-.51 1.27-.56 2.74-.13 4.12.41 1.3 1.24 2.43 2.36 3.17.93.62 2 .95 3.13.95.85 0 1.67-.19 2.43-.54z"></path>
        </svg>
        Sign up with Apple
      </button>
    </div>
  )
} 