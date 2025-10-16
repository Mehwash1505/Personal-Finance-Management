import React from 'react';

const BudgetStatus = ({ budgets, summary }) => {
  // Create a map for quick lookups of spending summary
  const spendingMap = summary.reduce((acc, item) => {
    acc[item.name] = item.value;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Budget Status</h3>
      {budgets.length > 0 ? (
        budgets.map((budget) => {
          const spent = spendingMap[budget.category] || 0;
          const progress = (spent / budget.limit) * 100;
          const isOverBudget = progress > 100;

          return (
            <div key={budget.category}>
              <div className="flex justify-between mb-1 text-sm">
                <span className="font-medium">{budget.category.replace(/_/g, ' ')}</span>
                <span className="text-gray-600">${spent.toFixed(2)} / ${budget.limit.toFixed(2)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div
                  className={`h-4 rounded-full ${isOverBudget ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-sm text-gray-500">No budgets set yet. Use the form above to add one.</p>
      )}
    </div>
  );
};

export default BudgetStatus;