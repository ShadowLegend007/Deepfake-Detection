import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface PieChartProps {
  data: Array<{
    name: string;
    value: number;
    color?: string;
    id?: string;
  }>;
  title?: string;
}

const DEFAULT_COLORS = ['#7c3aed', '#8b5cf6', '#3b82f6', '#60a5fa', '#10b981'];

export function PieChart({ data, title }: PieChartProps) {
  // Custom label renderer matching the reference style
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }: any) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = outerRadius * 1.2; // Push labels out slightly
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const percentage = (percent * 100).toFixed(0);

    return (
      <text
        x={x}
        y={y}
        fill="currentColor"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-bold fill-foreground"
      >
        {`${name} ${percentage}%`}
      </text>
    );
  };

  return (
    <div className="w-full flex flex-col h-full min-h-[250px]">
      {title && (
        <h3 className="text-3xl font-bold text-accent mb-6 cool-font flex items-center gap-3 pl-4">{title}</h3>
      )}
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPie>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={{ stroke: 'rgba(255,255,255,0.3)', strokeWidth: 1 }}
              label={renderCustomizedLabel}
              outerRadius={60}
              innerRadius={0}
              dataKey="value"
              stroke="#ffffff"
              strokeWidth={1}
              isAnimationActive={true}
              animationBegin={0}
              animationDuration={1500}
              animationEasing="ease-out"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                  stroke="#ffffff"
                  strokeWidth={1}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                padding: '8px 12px',
                boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
              }}
              itemStyle={{
                color: 'hsl(var(--foreground))',
                fontSize: '13px',
                fontWeight: '500',
              }}
              labelStyle={{
                color: 'hsl(var(--muted-foreground))',
                fontSize: '12px',
              }}
              formatter={(value: number) => `${value}g`}
            />
            <Legend
              verticalAlign="bottom"
              height={40}
              iconType="square"
              iconSize={12}
              formatter={(value, entry: any) => (
                <span className="text-sm font-medium ml-2" style={{ color: entry.payload.fill }}>
                  {value}
                </span>
              )}
            />
          </RechartsPie>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
