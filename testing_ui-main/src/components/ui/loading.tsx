export function PageLoader() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary"></div>
                <div className="mt-4 text-muted-foreground text-sm">Loading...</div>
            </div>
        </div>
    )
}

export function ComponentLoader({ message = "Loading..." }: { message?: string }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            {message && <p className="mt-4 text-sm text-muted-foreground">{message}</p>}
        </div>
    )
}

export function Skeleton({ className = "" }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-muted rounded ${className}`}></div>
    )
}
