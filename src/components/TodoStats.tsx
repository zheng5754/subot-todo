interface Props {
  active: number;
  completed: number;
  onClearCompleted: () => void;
}

export function TodoStats({ active, completed, onClearCompleted }: Props) {
  return (
    <div className="stats">
      <span>{active} 项待办，{completed} 项已完成</span>
      {completed > 0 && (
        <button className="clear-btn" onClick={onClearCompleted}>
          清除已完成
        </button>
      )}
    </div>
  );
}
