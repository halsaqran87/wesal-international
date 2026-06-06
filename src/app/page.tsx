import { redirect } from 'next/navigation'

export default function RootPage() {
  // Serve the landing page — redirect to /home or handle here
  redirect('/home')
}
