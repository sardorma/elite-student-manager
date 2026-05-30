import { useState, useCallback, useRef } from 'react';

export function useToast() {
  const [toast, setToast] = useState({ visible: false, msg: '' });
  const timerRef = useRef(null);

  const showToast = useCallback((msg) => {
    setToast({ visible: true, msg });
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setToast({ visible: false, msg: '' }), 2400);
  }, []);

  return { toast, showToast };
}
