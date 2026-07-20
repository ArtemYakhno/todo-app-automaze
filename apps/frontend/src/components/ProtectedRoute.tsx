import type { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
}

// Placeholder — real JWT check lands in the feature plan (AuthModule).
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  return children
}
