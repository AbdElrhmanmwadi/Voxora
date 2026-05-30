import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '../../../core/ui/Card'
import Badge from '../../../core/ui/Badge'

const tools = [
  { path: 'files', title: 'Files', description: 'Upload source assets, process chunks, and push indexes.' },
  { path: 'ask', title: 'Ask AI', description: 'Search indexed content and generate grounded answers.' },
  { path: 'translate', title: 'Translation', description: 'Create translation jobs and track output files.' },
  { path: 'voice', title: 'Voice', description: 'Record audio, transcribe, and ask from speech.' }
]

export default function ProjectDashboardPage() {
  const { projectId } = useParams()
  const nav = useNavigate()

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <p className="page-kicker">Project overview</p>
          <h1 className="page-title">Project {projectId}</h1>
          <p className="page-description">Manage the document pipeline from ingestion through retrieval, translation, and voice interaction.</p>
        </div>
        <Badge variant="outline">ID {projectId}</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tools.map((tool) => (
          <Card
            key={tool.path}
            role="button"
            tabIndex={0}
            className="cursor-pointer transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => nav(tool.path)}
            onKeyDown={(event) => event.key === 'Enter' && nav(tool.path)}
          >
            <CardHeader>
              <CardTitle>{tool.title}</CardTitle>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <span className="text-sm font-medium">Open workflow</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
