import { skillGroupEntries } from '@/lib/content'
import { SectionTitle } from '@/components/effects/SectionTitle'
import { Reveal } from '@/components/effects/Reveal'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function Skills() {
  return (
    <section id="skills">
      <div className="container">
        <div className="sec-label">Skills</div>
        <SectionTitle>Technical Expertise</SectionTitle>
        <p className="sec-sub">A cross-disciplinary stack spanning AI engineering and field marine science.</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {skillGroupEntries.map((group, i) => (
            <Reveal as="div" delay={i * 0.05} key={group.title}>
              <Card className="h-full border-border/60 bg-card/90 transition-colors hover:bg-[var(--surface2)]">
                <CardContent>
                  <div className="sg-title">{group.title}</div>
                  <div className="flex flex-wrap gap-1.5">
                    {group.tags.map((t) => (
                      <Badge key={t} variant="outline" className="h-auto rounded-full px-2.5 py-1 text-[0.76rem] font-normal">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
