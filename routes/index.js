const express = require('express');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const noteLimit = process.env.NOTE_LIMIT || 200;

const router = express.Router();

const notesJson = fs.readFileSync(path.join(__dirname, '../db/db.json'));
let notes = JSON.parse(notesJson);

router.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/notes.html'));
});

router.get('/api/notes', (req, res) => {
  notes = JSON.parse(fs.readFileSync(path.join(__dirname, '../db/db.json')));
  res.json(notes);
});

router.post('/api/notes', ({ body }, res) => {
  if (notes.length >= noteLimit) {
    res.status(403).json({
      error: 'Note limit exceeded. Please delete notes before adding new ones.'
    });
    return;
  } else {
    const newNote = body;
    newNote.id = 1 + notes.reduce((acc, a) => Math.max(acc, a.id), 0);
    notes.push(newNote);

    fs.writeFile(path.join(__dirname, '../db/db.json'), JSON.stringify(notes, null, 2), (err) => {
      if (err) {
        console.error(err.message);
        res.status(500).json({
          error: err.message
        });
      }
      res.json({
        message: 'New note saved',
        note: newNote
      });
    });
  }
});

router.delete('/api/notes/:id', (req, res) => {
  let i = 0;
  while (i < notes.length) {
    if (notes[i].id === parseInt(req.params.id)) {
      break;
    }
    i++;
  }
  if (i < notes.length) {
    notes.splice(i, 1);
    fs.writeFile(path.join(__dirname, '../db/db.json'), JSON.stringify(notes, null, 2), (err) => {
      if (err) {
        console.error(err.message);
        res.status(500).json({
          error: err.message
        });
      }
      res.json({
        message: 'Deleted Note',
        id: i
      });
    });
  } else {
    res.status(404).json({ error: 'Note not found' });
  }
});

module.exports = router;