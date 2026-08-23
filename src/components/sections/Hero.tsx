import hero from '@/content/site/hero.json'
import { richText } from '@/lib/richtext'
import { MarineCanvas } from '@/components/effects/MarineCanvas'
import { FishCursor } from '@/components/effects/FishCursor'
import { HeroNameReveal } from '@/components/effects/HeroNameReveal'
import StarBorder from '@/components/reactbits/StarBorder'
import DecryptedText from '@/components/reactbits/DecryptedText'
import GlareHover from '@/components/reactbits/GlareHover'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section id="hero">
      <MarineCanvas />
      <FishCursor />

      <div className="container relative z-[3]">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          {/* Identity tile */}
          <Card className="md:col-span-8 border-border/60 bg-card/90 backdrop-blur-sm p-2 md:p-4">
            <CardHeader>
              <div className="hero-kicker !mb-0">
                <span className="dot-live"></span>
                <DecryptedText
                  text={hero.kicker}
                  animateOn="view"
                  sequential
                  revealDirection="center"
                  speed={28}
                  encryptedClassName="text-[var(--text3)] opacity-70"
                />
              </div>
            </CardHeader>
            <CardContent>
              <HeroNameReveal>
                {hero.nameLine1}
                <br />
                <em>{hero.nameLine2}</em>
              </HeroNameReveal>
              <p className="hero-tagline">{richText(hero.tagline)}</p>
              <p className="hero-bio">{richText(hero.bio)}</p>
            </CardContent>
            <CardFooter className="flex flex-wrap gap-3 border-t-0 bg-transparent pt-0">
              {hero.ctas.map((cta) =>
                cta.style === 'star' ? (
                  <StarBorder key={cta.label} as="a" href={cta.url} target={cta.url.startsWith('#') ? undefined : '_blank'} color="#f0a955" speed="4s" thickness={2}>
                    {cta.label}
                  </StarBorder>
                ) : (
                  <Button key={cta.label} asChild size="lg" variant={cta.style === 'fill' ? 'default' : 'outline'} className="rounded-full px-6 h-auto py-3 text-[0.88rem] font-semibold">
                    <a href={cta.url} target={cta.url.startsWith('#') ? undefined : '_blank'} rel="noreferrer">
                      {cta.label}
                    </a>
                  </Button>
                ),
              )}
            </CardFooter>
          </Card>

          {/* Profile tile */}
          <Card className="md:col-span-4 border-border/60 bg-card/90 backdrop-blur-sm items-center justify-center text-center relative overflow-hidden">
            <GlareHover
              width="100%"
              height="100%"
              background="transparent"
              borderColor="transparent"
              borderRadius="0px"
              glareColor="#f0a955"
              glareOpacity={0.3}
              glareAngle={-30}
              glareSize={220}
              transitionDuration={900}
              className="absolute inset-0 z-[3] cursor-default"
            />
            <CardContent className="flex flex-col items-center gap-4">
              <Avatar className="size-28 md:size-32 ring-2 ring-border">
                <AvatarImage src={hero.profileImage} alt={hero.profileName} />
                <AvatarFallback>{hero.profileName.split(' ').map((w) => w[0]).slice(0, 2).join('')}</AvatarFallback>
              </Avatar>
              <div className="profile-meta items-center">
                {hero.meta.map((m) => (
                  <div className="meta-row justify-center" key={m.label}>
                    {m.label} <span>{m.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
