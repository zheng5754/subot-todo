import type { Todo } from '../hooks/useTodos';

interface Props {
  todo: Todo;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

const priorityConfig = {
  high: { label: '高', color: '#E8650A' },
  medium: { label: '中', color: '#D4A853' },
  low: { label: '低', color: '#6B7280' },
};

export function TodoItem({ todo, onToggle, onDelete }: Props) {
  return (
    <div className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
      />
      <span
        className="priority-badge"
        style={{ backgroundColor: priorityConfig[todo.priority].color }}
      >
        {priorityConfig[todo.priority].label}
      </span>
      <div className="todo-content">
        <span className="todo-text">{todo.text}</span>
        {todo.image && (
          <div className="media-container">
            <img src={todo.image} alt="附件" className="todo-media" />
            <a href={todo.image} download={`image-${todo.id}.png`} className="download-btn">
              ⬇ 下载图片
            </a>
          </div>
        )}
      </div>
      {todo.assignee && (
        <span className="assignee-tag">@{todo.assignee}</span>
      )}
      <button className="delete-btn" onClick={() => onDelete(todo.id)}>
        删除
      </button>
    </div>
  );
}
