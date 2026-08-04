'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BusinessInsight } from '../types';

interface Props {
  insights: BusinessInsight[];
}

export function BusinessInsights({ insights }: Props) {
  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success':
        return '🟢';
      case 'danger':
        return '🔴';
      case 'warning':
        return '🟡';
      default:
        return '🔵';
    }
  };

  const getInsightStyle = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/30 text-emerald-800 dark:text-emerald-400';
      case 'danger':
        return 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/30 text-rose-800 dark:text-rose-400';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/30 text-amber-800 dark:text-amber-400';
      default:
        return 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/30 text-blue-800 dark:text-blue-400';
    }
  };

  return (
    <Card className="bg-card text-card-foreground border">
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-foreground flex items-center space-x-2">
          <span>🧠</span>
          <span>Automated Business Insights</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight, idx) => (
          <div
            key={idx}
            className={`flex items-start space-x-3 p-3 rounded-xl border text-xs leading-relaxed ${getInsightStyle(
              insight.type
            )}`}
          >
            <span className="text-base select-none mt-0.5">{getInsightIcon(insight.type)}</span>
            <span className="flex-1 font-medium">{insight.text}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
