import { Bot, LockKeyhole, PhoneOff, Send, Users } from 'lucide-react'

const TRUST_ITEMS = [
  {
    icon: PhoneOff,
    title: 'No phone number required',
    description: 'Create an account with email and username ownership.',
  },
  {
    icon: LockKeyhole,
    title: 'Privacy-first messaging',
    description: 'Built around secure access, protected routes, and private conversations.',
  },
  {
    icon: Bot,
    title: 'Hermes AI',
    description: 'Draft, summarize, translate, and assist without leaving the flow.',
  },
  {
    icon: Send,
    title: 'FileNinja transfers',
    description: 'Secure professional file delivery built into chat workflows.',
  },
  {
    icon: Users,
    title: 'Communities and teams',
    description: 'A roadmap for groups, creators, professional spaces, and collaboration.',
  },
]

export function TrustStrip() {
  return (
    <section className="bg-[#031015] px-4 py-10 text-white">
      <div className="container mx-auto">
        <div className="grid gap-3 md:grid-cols-5">
          {TRUST_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/[0.055] p-5 shadow-2xl shadow-black/20 backdrop-blur"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-base font-bold">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
