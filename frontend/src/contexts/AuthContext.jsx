import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(null)
    const [bootstrapping, setBootstrapping] = useState(true)

    useEffect(() => {
        const session = authService.getStoredSession()

        if (session?.user && session?.token) {
            setUser(session.user)
            setToken(session.token)
        }

        setBootstrapping(false)
    }, [])

    const value = useMemo(
        () => ({
            user,
            token,
            bootstrapping,
            async login(credentials) {
                const session = await authService.login(credentials)
                setUser(session.user)
                setToken(session.token)
                return session
            },
            async register(payload) {
                const session = await authService.register(payload)
                return session
            },
            hydrate(session) {
                authService.saveSession(session)
                setUser(session.user)
                setToken(session.token)
            },
            logout() {
                authService.logout()
                setUser(null)
                setToken(null)
            },
        }),
        [bootstrapping, token, user],
    )

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    const context = useContext(AuthContext)

    if (!context) {
        throw new Error('useAuth must be used inside AuthProvider')
    }

    return context
}
