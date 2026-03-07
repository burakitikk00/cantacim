"use client";

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

interface ChartData {
    date: string;
    total: number;
    count: number;
}

export default function DashboardCharts({ data }: { data: ChartData[] }) {
    if (!data || data.length === 0) {
        return (
            <div className="h-64 flex items-center justify-center text-gray-400 bg-gray-50 rounded italic border border-dashed border-gray-200">
                Veri bulunamadı.
            </div>
        );
    }

    return (
        <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FF007F" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="#FF007F" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af', fontSize: 12 }}
                        tickFormatter={(value) => `₺${value.toLocaleString()}`}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: '#fff',
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        }}
                        itemStyle={{ fontSize: '12px', fontWeight: '600' }}
                        labelStyle={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px', color: '#111827' }}
                        formatter={(value: any, name?: string) => {
                            const label = name === "total" ? "Satış Tutarı" : "Sipariş Sayısı";
                            const valStr = name === "total" ? `₺${value.toLocaleString()}` : `${value} Adet`;
                            return [valStr, label];
                        }}
                    />
                    <Area
                        type="monotone"
                        dataKey="total"
                        stroke="#FF007F"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorTotal)"
                        animationDuration={1500}
                    />
                    <Area
                        type="monotone"
                        dataKey="count"
                        stroke="#9ca3af"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        fill="none"
                        animationDuration={1500}
                    />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
