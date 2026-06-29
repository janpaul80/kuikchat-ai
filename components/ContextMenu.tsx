import React, { useEffect, useRef } from 'react';

interface ContextMenuAction {
  label: string;
  onClick: () => void;
}

interface ContextMenuProps {
  x: number;
  y: number;
  actions: ContextMenuAction[];
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, actions, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      style={{ top: y, left: x }}
      className="fixed bg-white dark:bg-kuik-dark-header rounded-md shadow-lg p-2 z-50 border border-gray-200 dark:border-gray-700 min-w-[150px]"
    >
      <ul>
        {actions.map((action, index) => (
          <li key={index}>
            <button
              onClick={action.onClick}
              className="w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-kuik-dark-text-primary hover:bg-gray-100 dark:hover:bg-kuik-dark-panel rounded-md"
            >
              {action.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContextMenu;
