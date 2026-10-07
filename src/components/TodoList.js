import React, { useState } from 'react';

const TodoList = ({ todos, removeTodo, toggleCompleteTodo }) => {
  // --- STATE FOR THE LIVE SEARCH TRACKER FILTER ---
  const [searchTerm, setSearchTerm] = useState('');

  // 1. FILTER FUNCTION: Keeps tasks matching the search letters on the fly
  const filteredTodos = todos.filter(todo => 
    todo.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 2. HELPER ACTION: Checks if a saved date is strictly in the past
  const isOverdue = (dateString) => {
    if (!dateString) return false;
    
    // Normalize dates to midnight to prevent timezone false alarms
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const taskDate = new Date(dateString);
    taskDate.setHours(0, 0, 0, 0);
    
    return taskDate < today;
  };

  return (
    <div className="todo-list-container" style={{
      maxWidth: '500px',
      margin: '40px auto 0 auto', 
      padding: '30px',
      boxSizing: 'border-box',
      backgroundColor: 'rgba(255, 255, 255, 0.8)', 
      backdropFilter: 'blur(10px)', 
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
      border: '1px solid rgba(255, 255, 255, 0.25)',
      textAlign: 'left',
      fontFamily: 'Arial, sans-serif'
    }}>
      
      {/* 5. THE LIVE FILTER INPUT BAR */}
      <div style={{ marginBottom: '20px' }}>
        <input 
          type="text"
          placeholder="🔍 Search active list items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            fontSize: '14px',
            border: '1px solid #ccc',
            borderRadius: '6px',
            outline: 'none',
            boxSizing: 'border-box',
            fontFamily: 'Arial, sans-serif'
          }}
        />
      </div>

      <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '22px', borderBottom: '1px solid #ccc', paddingBottom: '10px', color: '#333' }}>
        My Active Tasks:
      </h3>
      
      {filteredTodos.length === 0 ? (
        <p style={{ color: '#666', fontStyle: 'italic' }}>No matching tasks found!</p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
          {filteredTodos.map((todo) => {
            // Run evaluation check parameters on this specific row iteration loop
            const overdueFlag = isOverdue(todo.dueDate) && !todo.completed;

            return (
              <li key={todo.id} className="todo-item" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 0',
                borderBottom: '1px solid rgba(0,0,0,0.05)',
                fontSize: '16px'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '0', wordBreak: 'break-word' }}>
                  {/* Task Text with Dynamic Strike or Overdue Crimson Highlighting */}

<span style={{ 
  textDecoration: todo.completed ? 'line-through' : 'none',
  color: todo.completed ? '#888' : (overdueFlag ? '#cc0000' : '#000'),
  fontWeight: overdueFlag ? 'bold' : 'normal',
  transition: 'all 0.3s ease',
  
  // --- ADD THIS MAGIC LINE TO SCRUB THE WHITE GLOW SHADOW COMPLETELY ---
  textShadow: 'none' 
}}>
  {todo.text}
{/* DUE DATE LABEL DISPLAYER & OVERDUE WARNING ALARM NODES */}
{todo.dueDate && (
  <span style={{ 
    fontSize: '12px', 
    color: overdueFlag ? '#cc0000' : '#666',
    fontWeight: overdueFlag ? 'bold' : 'normal',
    
    // --- CLEAR OUT GLOW TEXT SHADOWS HERE AS WELL ---
    textShadow: 'none' 
  }}>
    ⏰ Due: {todo.dueDate} {overdueFlag && '⚠️ (OVERDUE!)'}
  </span>
)}
</span>
                </div>

                <div className="todo-item-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                  <button
                    onClick={() => toggleCompleteTodo(todo.id, todo.completed)}
                    style={{
                      backgroundColor: todo.completed ? '#28a745' : '#e0e0e0',
                      color: todo.completed ? 'white' : '#333',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '12px',
                      transition: 'background-color 0.3s ease'
                    }}
                  >
                    {todo.completed ? '✓ Completed' : 'Mark as done'}
                  </button>

                  <button 
                    onClick={() => removeTodo(todo.id)}
                    style={{
                      backgroundColor: '#cc0000',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '12px'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default TodoList;
