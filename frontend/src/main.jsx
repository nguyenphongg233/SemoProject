import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { AuthProvider } from './contexts/AuthContext'
import './index.css'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <BrowserRouter>
            <AuthProvider>
                <App />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        duration: 3500,
                        className: 'semo-toast',
                        success: {
                            iconTheme: {
                                primary: '#0f9f6e',
                                secondary: '#ffffff',
                            },
                        },
                        error: {
                            iconTheme: {
                                primary: '#d14343',
                                secondary: '#ffffff',
                            },
                        },
                    }}
                />
            </AuthProvider>
        </BrowserRouter>
    </StrictMode>,
)
