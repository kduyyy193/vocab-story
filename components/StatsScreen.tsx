import React from 'react';
import { useVocabulary } from '../hooks/useVocabulary';
declare var Recharts: any; // Use Recharts from CDN global

const StatsScreen: React.FC = () => {
    const { stats } = useVocabulary();

    // The Recharts library is loaded from a CDN. It might not be available
    // immediately when the component mounts. We check for its existence
    // before attempting to use it.
    if (typeof Recharts === 'undefined') {
        return (
            <div className="p-6 bg-white dark:bg-dark-card rounded-lg shadow-lg animate-fade-in text-center">
                <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-dark-text">Your Progress</h2>
                <p className="text-gray-600 dark:text-dark-text-secondary">Loading chart library...</p>
            </div>
        );
    }

    const { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } = Recharts;

    const data = [
        { name: 'Not Learned', value: stats.notLearned },
        { name: 'Learning', value: stats.learning },
        { name: 'Mastered', value: stats.mastered },
    ];

    const COLORS = ['#94a3b8', '#f97316', '#16a34a'];

    return (
        <div className="p-6 bg-white dark:bg-dark-card rounded-lg shadow-lg animate-fade-in">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-dark-text">Your Progress</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-center">
                <div className="p-4 bg-gray-100 dark:bg-slate-800 rounded-lg">
                    <p className="text-3xl font-bold text-primary">{stats.total}</p>
                    <p className="text-sm text-gray-500 dark:text-dark-text-secondary">Total Words</p>
                </div>
                 <div className="p-4 bg-gray-100 dark:bg-slate-800 rounded-lg">
                    <p className="text-3xl font-bold text-success">{stats.mastered}</p>
                    <p className="text-sm text-gray-500 dark:text-dark-text-secondary">Mastered</p>
                </div>
                 <div className="p-4 bg-gray-100 dark:bg-slate-800 rounded-lg">
                    <p className="text-3xl font-bold text-warning">{stats.learning}</p>
                    <p className="text-sm text-gray-500 dark:text-dark-text-secondary">Learning</p>
                </div>
            </div>

            <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                                const RADIAN = Math.PI / 180;
                                const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                                const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                return (
                                    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                                        {`${(percent * 100).toFixed(0)}%`}
                                    </text>
                                );
                            }}
                            outerRadius={150}
                            fill="#8884d8"
                            dataKey="value"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value} words`} />
                        <Legend />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default StatsScreen;