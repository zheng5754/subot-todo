import { useState } from 'react';
import { useSocket } from './hooks/useSocket';
import { TodoInput } from './components/TodoInput';
import { TodoFilter } from './components/TodoFilter';
import { TodoItem } from './components/TodoItem';
import { TodoStats } from './components/TodoStats';
import { ShareButton } from './components/ShareButton';

function App() {
  const roomId = new URLSearchParams(window.location.search).get('room') || undefined;
  const {
    todos,
    connected,
    addTodo,
    toggleTodo,
    deleteTodo,
    clearCompleted,
    shareRoom,
  } = useSocket({ roomId });
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const stats = {
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length,
  };

  const handleShare = () => {
    const url = shareRoom();
    alert(`链接已复制到剪贴板：\n${url}\n\n将此链接分享给其他人即可协作编辑！`);
  };

  return (
    <div className="container">
      <div className="header">
        <img src="/logo.png" alt="速搏特" className="logo" />
        <h1>速搏特品牌部待办事项</h1>
      </div>

      <div className="share-row">
        <ShareButton onShare={handleShare} connected={connected} />
        <span className={`connection-status ${connected ? 'online' : 'offline'}`}>
          {connected ? '🟢 在线' : '🔴 离线'}
        </span>
      </div>

      <TodoInput onAdd={addTodo} />

      <TodoFilter filter={filter} onChange={setFilter} />

      <div className="todo-list">
        {filteredTodos.length === 0 ? (
          <div className="empty-state">暂无待办事项</div>
        ) : (
          filteredTodos.map(todo => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={toggleTodo}
              onDelete={deleteTodo}
            />
          ))
        )}
      </div>

      <TodoStats
        active={stats.active}
        completed={stats.completed}
        onClearCompleted={clearCompleted}
      />
    </div>
  );
}

export default App;
