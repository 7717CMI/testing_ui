'use client'

import { motion } from "framer-motion"
import { ArrowUp, ArrowDown, TrendingUp, LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimatedCounter } from "./animated-counter"

interface EnhancedMetricCardProps {
  title: string
  value: number
  change?: number
  trend?: "up" | "down" | "neutral"
  icon?: LucideIcon
  delay?: number
  className?: string
  suffix?: string
  prefix?: string
}

export function EnhancedMetricCard({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon,
  delay = 0,
  className = "",
  suffix = "",
  prefix = ""
}: EnhancedMetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay,
        ease: [0.33, 1, 0.68, 1] // Smooth easing
      }}
      whileHover={{ 
        y: -6, 
        scale: 1.02,
        transition: { 
          duration: 0.2,
          type: "spring",
          stiffness: 300,
          damping: 20
        }
      }}
      className={`group ${className}`}
    >
      <Card className="h-full transition-all duration-300 hover:shadow-xl border-border/50 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          {/* Header with icon and trend badge */}
          <div className="flex items-start justify-between mb-4">
            {Icon && (
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300"
              >
                <Icon className="h-5 w-5 text-primary" />
              </motion.div>
            )}
            
            {change !== undefined && trend && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  delay: delay + 0.3, 
                  type: "spring",
                  stiffness: 200
                }}
              >
                <Badge 
                  variant={trend === "up" ? "default" : trend === "down" ? "destructive" : "secondary"}
                  className="gap-1.5 font-semibold"
                >
                  {trend === "up" ? (
                    <ArrowUp className="h-3 w-3" />
                  ) : trend === "down" ? (
                    <ArrowDown className="h-3 w-3" />
                  ) : (
                    <TrendingUp className="h-3 w-3" />
                  )}
                  {Math.abs(change)}%
                </Badge>
              </motion.div>
            )}
          </div>

          {/* Animated number with gradient */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: delay + 0.2 }}
            className="mb-2"
          >
            <motion.div 
              className="text-4xl font-bold tracking-tight"
              style={{
                background: 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6)',
                backgroundSize: '300% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              <AnimatedCounter 
                end={value} 
                duration={1.5}
                suffix={suffix}
                prefix={prefix}
              />
            </motion.div>
          </motion.div>

          {/* Label */}
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

