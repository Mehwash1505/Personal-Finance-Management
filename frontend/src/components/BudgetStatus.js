import React from 'react';

const BudgetStatus = ({ budgets, summary }) => {
  // Create a map for quick lookups of spending summary
  const spendingMap = summary.reduce((acc, item) => {
    acc[item.name] = item.value;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-text-light">Budget Status</h3>
      {budgets.length > 0 ? (
        budgets.map((budget) => {
          const spent = spendingMap[budget.category] || 0;
          const progress = (spent / budget.limit) * 100;
          const isOverBudget = progress > 100;

          return (
            <div key={budget.category}>
              <div className="flex justify-between mb-1 text-sm">
                <span className="font-medium text-text-light">{budget.category.replace(/_/g, ' ')}</span>
                <span className="text-text-muted">${spent.toFixed(2)} / ${budget.limit.toFixed(2)}</span>
              </div>
              <div className="w-full bg-border rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${isOverBudget ? 'bg-danger' : 'bg-secondary'}`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
              </div>
            </div>
          );
        })
      ) : (
        <p className="text-sm text-text-muted">No budgets set yet. Use the form above to add one.</p>
      )}
    </div>
  );
};

export default BudgetStatus;