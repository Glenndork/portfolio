import { TypeGroup } from '@/components/Typed'
import { AboutBody } from '@/components/About'
import { ExperienceBody } from '@/components/Experience'
import { ProjectsBody } from '@/components/Projects'
import { SkillsBody } from '@/components/Skills'
import { ContributionsBody } from '@/components/Contributions'
import { EducationBody } from '@/components/Education'
import { ContactBody } from '@/components/Contact'
import type { SectionId } from '@/lib/filesystem'

const BODIES: Record<SectionId, (props: { only?: string }) => React.ReactNode> = {
  about: () => <AboutBody />,
  experience: () => <ExperienceBody />,
  projects: ({ only }) => <ProjectsBody only={only} />,
  skills: () => <SkillsBody />,
  activity: () => <ContributionsBody />,
  education: () => <EducationBody />,
  contact: () => <ContactBody />,
}

/**
 * A portfolio section printed as command output. Typing is disabled here —
 * a shell prints its result, it doesn't animate it in.
 */
export function SectionOutput({ section, project }: { section: SectionId; project?: string }) {
  const Body = BODIES[section]

  return (
    <div className="my-3 border-l border-border pl-4">
      <TypeGroup active instant>
        {Body({ only: project })}
      </TypeGroup>
    </div>
  )
}
