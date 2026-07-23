import { Section } from '@/components/Section'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { projects } from '@/data/content'

/** `only` narrows to a single project, for `cat projects/vawc`. */
export function ProjectsBody({ only }: { only?: string } = {}) {
  const shown = only ? projects.filter((p) => p.name === only) : projects

  return (
      <div className={only ? 'grid grid-cols-1 gap-5' : 'grid grid-cols-2 gap-5 max-[680px]:grid-cols-1'}>
        {shown.map((project) => (
          <Card
            key={project.name}
            className="gap-0 border-border bg-card p-[26px] shadow-none transition-[border-color,transform] duration-250 hover:-translate-y-1 hover:border-[#3a3a3a] focus-within:-translate-y-1 focus-within:border-[#3a3a3a] motion-reduce:transform-none"
          >
            <CardHeader className="gap-0 border-0 p-0">
              <div className="mb-4 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                <span>{project.path}</span>
                <span className="text-dim">{project.no}</span>
              </div>
              <CardTitle className="text-[1.3rem] font-bold">
                <span className="text-muted-foreground">{'{ '}</span>
                {project.name}
                <span className="text-muted-foreground">{' }'}</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              <div className="my-3.5 flex flex-wrap gap-2">
                {project.stack.map((tech) => (
                  <Badge
                    key={tech}
                    variant="outline"
                    className="border-border px-2.5 py-[3px] text-[11.5px] font-normal text-muted-foreground"
                  >
                    {tech}
                  </Badge>
                ))}
              </div>

              <ul className="proj-list flex flex-col gap-2">
                {project.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
  )
}

export function Projects() {
  return (
    <Section id="projects" heading="projects">
      <ProjectsBody />
    </Section>
  )
}
