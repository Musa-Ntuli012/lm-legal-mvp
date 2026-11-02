import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const BLOCK_TYPES = [
  { id: 'SCENARIO', label: 'Scenario & Instructions', icon: 'CLIP' },
  { id: 'EMAIL', label: 'Email', icon: 'EML' },
  { id: 'DOCUMENT', label: 'Document', icon: 'DOC' },
  { id: 'QUESTION', label: 'Question', icon: 'Q' },
  { id: 'DECISION', label: 'Decision (Branching)', icon: 'DEC' },
  { id: 'DRAFTING', label: 'Drafting Workspace', icon: 'DRAFT' },
  { id: 'SUBMISSION', label: 'Submission', icon: 'SUBMIT' },
];

const TYPE_LABELS: Record<string, string> = {
  SCENARIO: 'Scenario & Instructions',
  EMAIL: 'Email',
  DOCUMENT: 'Document',
  QUESTION: 'Question',
  DECISION: 'Decision',
  DRAFTING: 'Drafting',
  SUBMISSION: 'Submission',
};

interface Block {
  id: string;
  type: string;
  title: string | null;
  content: string | null;
  config: string | null;
  branches: string | null;
  order: number;
}

interface Task {
  id: string;
  title: string;
  practiceArea: string;
  description: string | null;
  status: string;
  blocks: Block[];
  rubric: any;
  modelAnswer: any;
}

export function TaskBuilder() {
  const { taskId } = useParams<{ taskId?: string }>();
  const navigate = useNavigate();
  const [task, setTask] = useState<Task | null>(null);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  [taskId];
  const [newBlockType, setNewBlockType] = useState<string>('');
  const [editBlockId, setEditBlockId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{
    type: string;
    title: string;
    content: string;
    config: string;
    branches: string;
    order: number;
  }>({
    type: '',
    title: '',
    content: '',
    config: '',
    branches: '',
    order: 0,
  });

  useEffect(() => {
    loadTask();
  }, []);

  const loadTask = async () => {
    if (!taskId) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}`);
      const data = await res.json();
      if (data.task) {
        setTask(data.task);
        setBlocks(data.task.blocks || []);
      }
    } catch (e) {
      console.error('Failed to load task', e);
    } finally {
      setLoading(false);
    }
  };

  const saveTask = async (updates: Partial<Task>) => {
    if (!taskId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        loadTask();
      }
    } catch (e) {
      console.error('Failed to save task', e);
    } finally {
      setSaving(false);
    }
  };

  const addBlock = async (type: string) => {
    if (!taskId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/blocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      if (res.ok) {
        const data = await res.json();
        setBlocks([...blocks, data.block]);
      }
    } catch (e) {
      console.error('Failed to add block', e);
    } finally {
      setSaving(false);
    }
  };

  const updateBlock = async (block: Block) => {
    if (!taskId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/blocks/${block.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(block),
      });
      if (res.ok) {
        const data = await res.json();
        setBlocks(blocks.map((b) => (b.id === block.id ? data.block : b)));
      }
    } catch (e) {
      console.error('Failed to update block', e);
    } finally {
      setSaving(false);
    }
  };

  const deleteBlock = async (id: string) => {
    if (!taskId || !confirm('Remove this block?')) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}/blocks/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setBlocks(blocks.filter((b) => b.id !== id));
      }
    } catch (e) {
      console.error('Failed to delete block', e);
    } finally {
      setSaving(false);
    }
  };

  const reorderBlocks = async (newOrder: Block[]) => {
    if (!taskId) return;
    setSaving(true);
    try {
      const blockIds = newOrder.map((b) => b.id);
      await fetch(`/api/tasks/${taskId}/blocks/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockIds }),
      });
      setBlocks([...newOrder]);
    } catch (e) {
      console.error('Failed to reorder blocks', e);
    } finally {
      setSaving(false);
    }
  };

  const publishTask = async () => {
    if (!taskId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PUBLISHED' }),
      });
      if (res.ok) {
        setTask((t) => (t ? { ...t, status: 'PUBLISHED' } : t));
      }
    } catch (e) {
      console.error('Failed to publish task', e);
    } finally {
      setSaving(false);
    }
  };

  const moveBlock = (id: string, direction: 'up' | 'down') => {
    const idx = blocks.findIndex((b) => b.id === id);
    if (direction === 'up' && idx > 0) {
      const newBlocks = [...blocks];
      [newBlocks[idx], newBlocks[idx - 1]] = [newBlocks[idx - 1], newBlocks[idx]];
      newBlocks[idx].order = idx;
      newBlocks[idx - 1].order = idx - 1;
      setBlocks(newBlocks);
      reorderBlocks(newBlocks);
    } else if (direction === 'down' && idx < blocks.length - 1) {
      const newBlocks = [...blocks];
      [newBlocks[idx], newBlocks[idx + 1]] = [newBlocks[idx + 1], newBlocks[idx]];
      newBlocks[idx].order = idx;
      newBlocks[idx + 1].order = idx + 1;
      setBlocks(newBlocks);
      reorderBlocks(newBlocks);
    }
  };

  const startEdit = (block: Block) => {
    setEditBlockId(block.id);
    setEditForm({
      type: block.type,
      title: block.title || '',
      content: block.content || '',
      config: block.config || '',
      branches: block.branches || '',
      order: block.order,
    });
  };

  const cancelEdit = () => {
    setEditBlockId(null);
    setEditForm({
      type: '', title: '', content: '', config: '', branches: '', order: 0,
    });
  };

  const saveEdit = async () => {
    if (!editBlockId) return;
    const block = blocks.find((b) => b.id === editBlockId);
    if (!block) return;
    await updateBlock({
      ...block,
      type: editForm.type,
      title: editForm.title,
      content: editForm.content,
      config: editForm.config,
      branches: editForm.branches,
      order: editForm.order,
    });
    cancelEdit();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-beige-bg">
        <div className="animate-pulse rounded-full h-8 w-8 bg-navy"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="card text-center py-20">
        <h2 className="card-title">Task not found</h2>
        <button
          onClick={() => navigate('/admin')}
          className="btn btn-primary mt-4"
        >
          Back to admin
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="card-title">Task Builder</h1>
          <p className="card-subtitle">
            Build and configure blocks for &ldquo;{task.title}&rdquo;
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/admin')}
            className="btn btn-outline btn-sm"
          >
            Back to admin
          </button>
          <button
            onClick={publishTask}
            disabled={saving || task.status === 'PUBLISHED'}
            className={`btn btn-primary ${task.status === 'PUBLISHED' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {task.status === 'PUBLISHED' ? 'Published' : 'Publish task'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Block list */}
        <div className="lg:col-span-4">
          <div className="card">
            <div className="mb-4">
              <h2 className="card-title mb-2">Blocks ({blocks.length})</h2>
              <div className="flex gap-2 mb-4">
                {BLOCK_TYPES.map((bt) => (
                  <button
                    key={bt.id}
                    onClick={() => addBlock(bt.id)}
                    disabled={saving}
                    className="btn btn-outline btn-sm flex items-center gap-1 text-xs"
                  >
                    <span>{bt.icon}</span>
                    <span>{bt.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              {blocks.map((block) => (
                <div
                  key={block.id}
                  className="flex items-center gap-2 p-3 rounded-lg border border-beige-border bg-beige-surface cursor-move group"
                >
                  <button
                    onClick={() => moveBlock(block.id, 'up')}
                    disabled={block.order === 1}
                    className="text-xs text-text-muted hover:text-navy p-1"
                  >
                    Up
                  </button>
                  <button
                    onClick={() => moveBlock(block.id, 'down')}
                    disabled={block.order === blocks.length}
                    className="text-xs text-text-muted hover:text-navy p-1"
                  >
                    Down
                  </button>
                  <span className="text-xs font-mono text-text-muted">{block.order}</span>
                  <span className="badge badge-beige text-xs">{TYPE_LABELS[block.type]}</span>
                  <span className="text-sm text-text-surface truncate">{block.title || '(untitled)'}</span>
                  <button
                    onClick={() => startEdit(block)}
                    className="text-xs text-navy hover:underline opacity-0 group-hover:opacity-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteBlock(block.id)}
                    className="text-xs text-red-600 hover:underline opacity-0 group-hover:opacity-100"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {blocks.length === 0 && (
                <div className="text-center py-8 text-text-muted">
                  No blocks yet. Add blocks to build your task.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Block editor / preview */}
        <div className="lg:col-span-8">
          {editBlockId ? (
            <div className="card">
              <h2 className="card-title mb-4">Edit block</h2>
              <div className="space-y-4">
                <div>
                  <label className="label">Block type</label>
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                    className="input"
                    disabled
                  >
                    {BLOCK_TYPES.map((bt) => (
                      <option key={bt.id} value={bt.id}>
                        {bt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Title</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Content (JSON)</label>
                  <textarea
                    value={editForm.content}
                    onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                    className="input h-32 font-mono text-xs"
                    placeholder='{"key": "value"}'
                  />
                </div>
                <div>
                  <label className="label">Config (JSON, optional)</label>
                  <textarea
                    value={editForm.config}
                    onChange={(e) => setEditForm({ ...editForm, config: e.target.value })}
                    className="input h-24 font-mono text-xs"
                    placeholder='{}'
                  />
                </div>
                <div>
                  <label className="label">Branches (JSON, optional)</label>
                  <textarea
                    value={editForm.branches}
                    onChange={(e) => setEditForm({ ...editForm, branches: e.target.value })}
                    className="input h-24 font-mono text-xs"
                    placeholder='{"optionId": "targetBlockId"}'
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={cancelEdit} className="btn btn-outline btn-sm">
                    Cancel
                  </button>
                  <button onClick={saveEdit} disabled={saving} className="btn btn-primary btn-sm">
                    Save
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="card">
              <h2 className="card-title mb-4">Preview</h2>
              <p className="card-subtitle mb-4">
                Blocks will render in order. Drag to reorder, click a block to edit.
              </p>
              <div className="space-y-4">
                {blocks.map((block, i) => (
                  <div
                    key={block.id}
                    className="p-4 rounded-lg border border-beige-border bg-white"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-navy">{i + 1}. {TYPE_LABELS[block.type]}</span>
                      <span className="badge badge-beige text-xs">{block.type}</span>
                    </div>
                    {block.title && (
                      <div className="text-sm text-text-surface font-medium">{block.title}</div>
                    )}
                    <div className="text-sm text-text-muted mt-2">
                      {block.content ? block.content.substring(0, 100) + '…' : '(no content)'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
