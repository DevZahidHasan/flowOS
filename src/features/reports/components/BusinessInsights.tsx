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
        return 'bg-emerald-950/20 border-emerald-500/20 text-emerald-400';
      case 'danger':
        return 'bg-rose-950/20 border-rose-500/20 text-rose-400';
      case 'warning':
        return 'bg-amber-950/20 border-amber-500/20 text-amber-400';
      default:
        return 'bg-blue-950/20 border-blue-500/20 text-blue-400';
    }
  };

  return (
    <Card className="bg-slate-900 border-white/5">
      <CardHeader>
        <CardTitle className="text-sm font-semibold text-white flex items-center space-x-2">
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
            <span className="flex-1 text-slate-300 font-medium">{insight.text}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
