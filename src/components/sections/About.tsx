import about from '@/content/site/about.json'
import { richText } from '@/lib/richtext'
import { Reveal } from '@/components/effects/Reveal'
import { SectionTitle } from '@/components/effects/SectionTitle'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'

export function About() {
  const [headingLine1, headingLine2] = about.heading.split('\n')

  return (
    <section id="about">
      <div className="container">
        <div className="sec-label">About</div>
        <SectionTitle>
          {headingLine1}
          <br />
          {headingLine2}
        </SectionTitle>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <Reveal as="div" className="md:col-span-7">
            <Card className="h-full border-border/60 bg-card/90">
              <CardContent className="about-text">
                {about.paragraphs.map((p, i) => (
                  <p key={i}>{richText(p)}</p>
                ))}
              </CardContent>
              <CardFooter className="flex flex-wrap gap-2 border-t-0 bg-transparent pt-0">
                {about.links.map((l) => (
                  <Button key={l.label} asChild size="sm" variant="outline" className="rounded-full">
                    <a href={l.url} target="_blank" rel="noreferrer">
                      {l.label}
                    </a>
                  </Button>
                ))}
              </CardFooter>
            </Card>
          </Reveal>

          <Reveal as="div" className="md:col-span-5" delay={0.08}>
            <div className="flex h-full flex-col gap-4">
              <Card className="border-l-2 border-l-[var(--gold)] border-border/60 bg-card/90">
                <CardContent>
                  <div className="award-label">Academic Awards</div>
                  {about.awards.map((a, i) => (
                    <div key={i}>
                      {i > 0 && <Separator className="my-0" />}
                      <div className="award-item !border-b-0">{richText(a)}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-border/60 bg-card/90">
                <CardContent>
                  <div className="sec-label !mb-3">Affiliations</div>
                  <div className="flex flex-wrap gap-2">
                    {about.affiliations.map((a) => (
                      <Badge key={a} variant="secondary" className="h-auto rounded-full px-3 py-1.5 text-[0.76rem] font-medium">
                        {a}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
