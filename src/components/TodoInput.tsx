import { useState, useRef } from 'react';
import type { Priority } from '../hooks/useTodos';

interface Props {
  onAdd: (text: string, priority: Priority, assignee: string, image: string) => void;
}

export function TodoInput({ onAdd }: Props) {
  const [text, setText] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [assignee, setAssignee] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onAdd(text, priority, assignee.trim(), imagePreview);
      setText('');
      setPriority('medium');
      setAssignee('');
      setImagePreview('');
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  return (
    <form className="input-section input-section-full" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="待办事项内容..."
        value={text}
        onChange={e => setText(e.target.value)}
        maxLength={100}
        className="input-main"
      />
      <div className="input-row">
        <select
          className="priority-select"
          value={priority}
          onChange={e => setPriority(e.target.value as Priority)}
        >
          <option value="high">高优先级</option>
          <option value="medium">中优先级</option>
          <option value="low">低优先级</option>
        </select>
        <input
          type="text"
          placeholder="待办人"
          value={assignee}
          onChange={e => setAssignee(e.target.value)}
          maxLength={20}
          className="assignee-input"
        />
      </div>
      <div className="media-row">
        <button type="button" className="media-btn" onClick={() => imageInputRef.current?.click()}>
          📷 上传图片
        </button>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          style={{ display: 'none' }}
        />
        <button type="submit" className="submit-btn">添加</button>
      </div>
      {imagePreview && (
        <div className="media-preview">
          <img src={imagePreview} alt="图片预览" />
          <button type="button" className="remove-media" onClick={() => setImagePreview('')}>×</button>
        </div>
      )}
    </form>
  );
}
