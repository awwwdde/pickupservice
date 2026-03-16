import type { FC } from 'react'
import { Link } from 'react-router-dom'

const ProjectsPage: FC = () => {
  const projects = [
    { id: '1', name: 'Проект 1' },
    { id: '2', name: 'Проект 2' },
    { id: '3', name: 'Проект 3' },
  ]

  return (
    <div>
      <h1>Проекты</h1>
      <ul>
        {projects.map((project) => (
          <li key={project.id}>
            <Link to={`/portfolio/${project.id}`}>{project.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ProjectsPage
