import type { ComponentType } from "react";

interface StatItem {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
}

interface StatsGridProps {
  stats: StatItem[];
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{stat.label}</span>
            <div className="rounded-md p-1.5" style={{ backgroundColor: stat.color + "20" }}>
              <stat.icon className="size-4" style={{ color: stat.color }} />
            </div>
          </div>
          <p className="mt-2 text-2xl font-semibold text-foreground">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
