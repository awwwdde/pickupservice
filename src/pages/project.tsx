import type { FC } from 'react'
import { useParams } from 'react-router-dom'

const ProjectPage: FC = () => {
  const { id } = useParams()

  return (
    <div>
      <h1>Страница проекта</h1>
      <p>ID проекта: {id}</p>
    </div>
  )
}

export default ProjectPage
