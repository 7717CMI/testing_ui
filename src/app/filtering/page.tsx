'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Filter, Sliders, Target, CheckCircle2, ArrowRight, Activity } from 'lucide-react'

export default function FilteringPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">HealthData AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/"><Button variant="ghost" size="sm">Back to Home</Button></Link>
            <Link href="/search"><Button size="sm">Try Filters</Button></Link>
          </div>
        </div>
      </nav>

      <section className="container py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <Badge className="gap-1 bg-orange-500 text-white"><Filter className="h-3 w-3" /> 50+ Attributes</Badge>
          <h1 className="text-5xl md:text-6xl font-bold">Advanced Filtering</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Filter by state, bed count, ownership, specialties, and 50+ attributes to find exactly what you need.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/search"><Button size="lg" className="gap-2 bg-orange-500 hover:bg-orange-600">Try Filters <ArrowRight className="h-4 w-4" /></Button></Link>
            <Link href="/signup"><Button size="lg" variant="outline">Get Started</Button></Link>
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: <Filter className="h-8 w-8" />, title: 'Multi-Criteria', desc: 'Combine 50+ filters' },
            { icon: <Sliders className="h-8 w-8" />, title: 'Range Filters', desc: 'Beds, ratings, capacity' },
            { icon: <Target className="h-8 w-8" />, title: 'Precise Results', desc: 'Find exact matches' },
          ].map((item, i) => (
            <Card key={i} className="text-center p-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500/10 text-orange-500 rounded-lg mb-4">{item.icon}</div>
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-muted-foreground">{item.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="container py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Filter By</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              'Location (State, City, Zip)',
              'Facility Type',
              'Bed Count Range',
              'Ownership Type',
              'Specialties & Services',
              'Certifications',
              'Rating & Reviews',
              'Verification Status',
              'Insurance Accepted',
              'Languages Spoken',
              'Accessibility Features',
              'Emergency Services',
            ].map((filter, i) => (
              <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                <CheckCircle2 className="h-5 w-5 text-orange-500 shrink-0" />
                <span className="font-medium">{filter}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-24">
        <Card className="bg-gradient-to-r from-orange-500 to-orange-700 text-white border-0">
          <CardContent className="p-12 text-center space-y-6">
            <h2 className="text-3xl font-bold">Find Exactly What You Need</h2>
            <p className="text-xl opacity-90">Advanced filtering for precise healthcare facility discovery</p>
            <Link href="/search"><Button size="lg" variant="secondary" className="gap-2">Try Filters Now <ArrowRight className="h-4 w-4" /></Button></Link>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
