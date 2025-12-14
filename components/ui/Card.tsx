import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'
import { ReactNode } from 'react'

interface CardProps {
    children: ReactNode
    className?: string
    hoverEffect?: boolean
}

export function Card({ children, className = '', hoverEffect = false }: CardProps) {
    const baseClasses = 'rounded-2xl p-6 border border-white/10 backdrop-blur-sm'

    if (!hoverEffect) {
        return (
            <div className={cn(baseClasses, className)}>
                {children}
            </div>
        )
    }

    return (
        <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
            className={cn(baseClasses, 'relative overflow-hidden', className)}
        >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 pointer-events-none transition-opacity duration-500 hover:opacity-100" />
            <div className="relative z-10">{children}</div>
        </motion.div>
    )
}
