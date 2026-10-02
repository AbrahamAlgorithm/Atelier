import { SiteNav } from '@/components/landing/SiteNav'
import { Hero } from '@/components/landing/Hero'
import { Problem } from '@/components/landing/Problem'
import { Workflow } from '@/components/landing/Workflow'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { Comparison } from '@/components/landing/Comparison'
import { BuiltFor } from '@/components/landing/BuiltFor'
import { Faq } from '@/components/landing/Faq'
import { FinalCta } from '@/components/landing/FinalCta'
import { SiteFooter } from '@/components/landing/SiteFooter'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#faf9f5]">
      <SiteNav />
      <main>
        <Hero />
        <Problem />
        <Workflow />
        <HowItWorks />
        <Comparison />
        <BuiltFor />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  )
}
