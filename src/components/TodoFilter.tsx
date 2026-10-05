type Filter = 'all' | 'active' | 'completed';

interface Props {
  filter: Filter;
  onChange: (filter: Filter) => void;
}

export function TodoFilter({ filter, onChange }: Props) {
  return (
    <div className="filters">
      <button
        className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
        onClick={() => onChange('all')}
      >
        全部
      </button>
      <button
        className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
        onClick={() => onChange('active')}
      >
        待完成
      </button>
      <button
        className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
        onClick={() => onChange('completed')}
      >
        已完成
      </button>
    </div>
  );
}
