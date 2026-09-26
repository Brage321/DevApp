import { useCallback, useState } from 'react';

/* ------------------------------------------------------------------ */
/* Native HTML5 drag-and-drop reordering — no extra dependency.        */
/* Components pair this with ↑/↓ buttons for keyboard/touch access.    */
/* ------------------------------------------------------------------ */

export function useDragOrder<T extends { id: string }>(
  items: T[],
  onReorder: (next: T[]) => void
) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const onDragStart = useCallback((id: string) => () => setDraggingId(id), []);

  const onDragEnter = useCallback(
    (id: string) => () => {
      setOverId(id);
      if (!draggingId || draggingId === id) return;
      const from = items.findIndex((i) => i.id === draggingId);
      const to = items.findIndex((i) => i.id === id);
      if (from < 0 || to < 0) return;
      const next = [...items];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      onReorder(next);
    },
    [draggingId, items, onReorder]
  );

  const onDragEnd = useCallback(() => {
    setDraggingId(null);
    setOverId(null);
  }, []);

  const move = useCallback(
    (id: string, dir: -1 | 1) => {
      const from = items.findIndex((i) => i.id === id);
      const to = from + dir;
      if (from < 0 || to < 0 || to >= items.length) return;
      const next = [...items];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      onReorder(next);
    },
    [items, onReorder]
  );

  return {
    draggingId,
    overId,
    dragProps: (id: string) => ({
      draggable: true,
      onDragStart: onDragStart(id),
      onDragEnter: onDragEnter(id),
      onDragOver: (e: React.DragEvent) => e.preventDefault(),
      onDragEnd: onDragEnd,
      onDrop: onDragEnd,
    }),
    move,
  };
}
