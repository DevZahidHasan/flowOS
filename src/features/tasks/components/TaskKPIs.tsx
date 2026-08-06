'use client';

import { TaskStatistics } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, ListTodo, AlertTriangle, PlayCircle, FolderKanban } from 'lucide-react';

interface Props {
  stats: TaskStatistics | null;
}

export function TaskKPIs({ stats }: Props) {
  if (!stats) return null;

  const kpis = [
    {
      title: 'Total Tasks',
      value: stats.totalCount,
      icon: <FolderKanban className="h-4 w-4 text-blue-500" />,
      description: 'All active tasks',
    },
    {
      title: 'To Do',
      value: stats.todoCount,
      icon: <ListTodo className="h-4 w-4 text-slate-500" />,
      description: 'Waiting to start',
    },
    {
      title: 'In Progress',
      value: stats.inProgressCount,
      icon: <PlayCircle className="h-4 w-4 text-amber-500" />,
      description: 'Currently working on',
    },
    {
      title: 'Completed',
      value: stats.completedCount,
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
      description: 'Finished tasks',
    },
    {
      title: 'Overdue',
      value: stats.overdueCount,
      icon: <AlertTriangle className="h-4 w-4 text-red-500" />,
      description: 'Past due date',
      alert: stats.overdueCount > 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 w-full mb-6">
      {kpis.map((kpi, idx) => (
        <Card key={idx} className={`bg-card/40 backdrop-blur-sm border-border ${kpi.alert ? 'border-red-500/30 bg-red-500/5' : ''}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
            {kpi.icon}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${kpi.alert ? 'text-red-500' : ''}`}>{kpi.value}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {kpi.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
