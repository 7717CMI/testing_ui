'use client'

import React from 'react'
import { Button } from '@/components/ui/button'

interface Props {
    children: React.ReactNode
    fallback?: React.ReactNode
}

interface State {
    hasError: boolean
    error?: Error
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo)
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
                    <div className="text-center space-y-4 max-w-md">
                        <div className="text-6xl mb-4">⚠️</div>
                        <h2 className="text-2xl font-bold text-red-600">Something went wrong</h2>
                        <p className="text-muted-foreground">
                            We're sorry, but something unexpected occurred. Please try refreshing the page.
                        </p>
                        {this.state.error && process.env.NODE_ENV === 'development' && (
                            <div className="mt-4 p-4 bg-red-50 dark:bg-red-950 rounded-lg text-left">
                                <p className="text-sm font-mono text-red-800 dark:text-red-200">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}
                        <Button onClick={() => window.location.reload()} className="mt-4">
                            Refresh Page
                        </Button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
