// ReadinessChecklist Component
import { ShieldCheck, Check } from 'lucide-react';

export interface ChecklistItem {
  id: string;
  title: string;
  desc: string;
  checked: boolean;
}

interface ReadinessChecklistProps {
  items: ChecklistItem[];
  onToggleItem: (id: string) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export function ReadinessChecklist({ items, onToggleItem, onClose, isModal = false }: ReadinessChecklistProps) {
  const allChecked = items.every(i => i.checked);

  // Dynamic list styling depending on modal context
  const listContainerStyle = isModal
    ? { display: 'flex', flexDirection: 'column' as const, gap: '10px', flex: 1, overflowY: 'auto' as const, paddingRight: '4px' }
    : { display: 'flex', flexDirection: 'column' as const, gap: '10px', paddingRight: '4px' };

  return (
    <div className={isModal ? "checklist-box" : "panel-container"}>
      <div className="panel-header" style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={20} className={allChecked ? 'speed-eco' : ''} />
          <span className="panel-title">Pre-Ride Safety Check</span>
        </div>
        <p className="panel-subtitle">Maintain awareness. Zen riding starts before ignition.</p>
      </div>

      <div style={listContainerStyle}>
        {items.map(item => (
          <div
            key={item.id}
            className={`checklist-item ${item.checked ? 'checked' : ''}`}
            onClick={() => onToggleItem(item.id)}
          >
            <div className="checkbox-visual">
              {item.checked && <Check size={14} strokeWidth={3} />}
            </div>
            <div className="checklist-text">
              <span className="checklist-title">{item.title}</span>
              <span className="checklist-desc">{item.desc}</span>
            </div>
          </div>
        ))}
      </div>

      {allChecked ? (
        <div 
          className="speed-eco" 
          style={{ 
            textAlign: 'center', 
            background: 'rgba(57, 255, 20, 0.05)', 
            border: '1px dashed rgba(57, 255, 20, 0.2)',
            padding: '12px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: '600',
            marginTop: '8px'
          }}
        >
          ✓ You are ready! Ride safely and respect the road.
        </div>
      ) : (
        <div 
          style={{ 
            textAlign: 'center', 
            background: 'rgba(255, 255, 255, 0.02)', 
            border: '1px dashed var(--border-color)',
            padding: '12px',
            borderRadius: '12px',
            fontSize: '12px',
            color: 'var(--text-secondary)',
            marginTop: '8px'
          }}
        >
          Check all parameters before starting your engine.
        </div>
      )}

      {isModal && onClose && (
        <button className="close-modal-btn" onClick={onClose}>
          Done
        </button>
      )}
    </div>
  );
}
