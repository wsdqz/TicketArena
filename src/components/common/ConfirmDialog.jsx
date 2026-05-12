import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography
} from '@mui/material';
import { useTranslation } from '../../hooks/useTranslation';

const ConfirmDialog = ({ open, title, message, onConfirm, onCancel, confirmText, cancelText }) => {
  const { t } = useTranslation();

  const defaultConfirmText = t('common.confirm');
  const defaultCancelText = t('common.cancel');

  return (
    <Dialog 
      open={open} 
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="inherit">
          {cancelText || defaultCancelText}
        </Button>
        <Button 
          onClick={onConfirm} 
          variant="contained" 
          color="error"
          autoFocus
        >
          {confirmText || defaultConfirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog; 