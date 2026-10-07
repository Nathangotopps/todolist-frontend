import React, { useState } from 'react';
import { ref, push } from 'firebase/database';
import { db } from '../firebase';

const AddTodoForm = ({ currentUserId, selectedCategory }) => {
  const [todoText, setTodoText] = useState('');
  const [dueDate, setDueDate] = useState(''); // New state to hold the chosen date string

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (todoText.trim() === '') {
      alert('Please enter a to-do item.');
      return;
    }

    try {
      const dynamicTodosRef = ref(db, `users/${currentUserId}/${selectedCategory}`);

      // Save the task along with the target completion date!
      await push(dynamicTodosRef, {
        text: todoText,
        completed: false,
        dueDate: dueDate || null, // Saves the string (YYYY-MM-DD) or null if left empty
        createdAt: Date.now()
      });

      setTodoText('');
      setDueDate(''); // Clear the calendar picker field on success
      console.log('To-do added successfully!');

    } catch (error) {
      console.error('Error adding to-do: ', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      marginTop: '20px',
      width: '100%',
      alignItems: 'center'
    }}>
      <div className="todo-form-row" style={{ display: 'flex', gap: '10px', width: '80%', justifyContent: 'center' }}>
        <input
          type="text"
          placeholder="Add a new to-do..."
          value={todoText}
          onChange={(e) => setTodoText(e.target.value)}
          style={{
            padding: '12px 16px',
            fontSize: '16px', // kept at 16px on purpose: iOS Safari auto-zooms on inputs under 16px
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '6px',
            outline: 'none',
            flex: 2,
            minWidth: '0', // lets the input actually shrink inside a flex row instead of overflowing
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(5px)',
            fontFamily: 'Arial, sans-serif'
          }}
        />
        
        {/* 1. DATE PICKER CALENDAR INPUT ELEMENT */}
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          style={{
            padding: '12px',
            fontSize: '16px', // bumped from 14px to avoid iOS Safari auto-zoom on focus
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '6px',
            outline: 'none',
            flex: 1,
            minWidth: '0',
            backgroundColor: 'rgba(255, 255, 255, 0.85)',
            cursor: 'pointer',
            fontFamily: 'Arial, sans-serif'
          }}
        />
      </div>

      <button type="submit" className="add-todo-btn" style={{
        backgroundColor: '#007',
        color: 'white',
        padding: '12px 24px',
        fontSize: '16px',
        fontWeight: 'bold',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        fontFamily: 'Arial, sans-serif',
        width: 'auto'
      }}>
        Add To-do
      </button>
    </form>
  );
};

export default AddTodoForm;
