import { useState, useCallback } from 'react';

export function useModal() {
  const [modal, setModal] = useState({ open: false, title: '', value: '', cb: null });

  const openModal = useCallback((title, value, cb) => {
    setModal({ open: true, title, value: value || '', cb });
  }, []);

  const closeModal = useCallback(() => {
    setModal({ open: false, title: '', value: '', cb: null });
  }, []);

  const confirmModal = useCallback((val) => {
    if (val?.trim() && modal.cb) modal.cb(val.trim());
    closeModal();
  }, [modal.cb, closeModal]);

  return { modal, openModal, closeModal, confirmModal };
}
