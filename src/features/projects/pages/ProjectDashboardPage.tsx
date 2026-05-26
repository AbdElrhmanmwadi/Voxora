import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Card from '../../../core/ui/Card'

export default function ProjectDashboardPage() {
  const { projectId } = useParams()
  const nav = useNavigate()
  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold">Project — {projectId}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="cursor-pointer hover:scale-105 transition-transform" onClick={() => nav(`files`)}>
          <h3 className="font-semibold">Files</h3>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">Upload and process assets</p>
        </Card>

        <Card className="cursor-pointer hover:scale-105 transition-transform" onClick={() => nav(`ask`)}>
          <h3 className="font-semibold">Ask AI</h3>
        </Card>

        <Card className="cursor-pointer hover:scale-105 transition-transform" onClick={() => nav(`translate`)}>
          <h3 className="font-semibold">Translation</h3>
        </Card>

        <Card className="cursor-pointer hover:scale-105 transition-transform" onClick={() => nav(`voice`)}>
          <h3 className="font-semibold">Voice</h3>
        </Card>
      </div>
    </div>
  )
}
