import React from 'react';

const Message = ({ type = 'error', children }) => {
  const bgColor = type === 'error' ? 'bg-red-100' : 'bg-green-100';
  const textColor = type === 'error' ? 'text-red-700' : 'text-green-700';

  return (
    <div className={`${bgColor} ${textColor} p-3 rounded-md my-4`}>
      {children}
    </div>
  );
};

export default Message;