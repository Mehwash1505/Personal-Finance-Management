import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MonthlySummaryChart = ({ data }) => {
  return (
    <div className="bg-surface/80 backdrop-blur-xl border border-border p-6 rounded-xl shadow-2xl">
      <h2 className="text-xl font-semibold mb-4 text-text-light">Monthly Income vs. Expenses</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5, }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke='#30363D'/>
          <XAxis dataKey="month" tick={{ fill: '#7d8590' }}/>
          <YAxis tick={{ fill: '#7d8590' }} tickFormatter={(value) => `$${value}`} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#161B22', border: '1px solid #30363d' }} 
            formatter={(value) => `$${value.toFixed(2)}`}
            cursor={{fill: 'rgba(110, 118, 129, 0.2)'}}
          />
          <Legend wrapperStyle={{ color: '#E6EDF3' }} />
          <Bar dataKey="Income" fill="#10B981" />
          <Bar dataKey="Expenses" fill="#3B82F6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MonthlySummaryChart;