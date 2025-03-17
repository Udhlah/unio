import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  Box,
} from '@mui/material';
import AttachmentIcon from '@mui/icons-material/AttachFile';


function CollaborateDialog({ open, onClose, target, userData}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleSend = () => {
    // Handle sending the message and file
    // console.log('Message:', message);
    console.log('File:', selectedFile);
    onClose(); // Close the dialog
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Collaborate</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <TextField
            autoFocus
            margin="dense"
            label="Message"
            type="text"
            fullWidth
            onChange={handleMessageChange}
          />
          <IconButton
            color="default"
            aria-label="attach file"
            onClick={() => document.getElementById('file-upload-collaborate').click()}
            sx={{ marginLeft: '8px' }}
          >
            <AttachmentIcon />
          </IconButton>
          <input
            type="file"
            id="file-upload-collaborate"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSend} color="primary">
          Send
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CollaborateDialog;