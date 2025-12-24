import './globals.css'
import type { Metadata } from 'next'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
    title: 'AyurSutra - Doctor Portal',
    description: 'Healthcare platform for doctors and medical professionals',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                {children}
                <Toaster position="top-center" />
            </body>
        </html>
    )
}
