import React, { useState, useEffect } from 'react';
import axiosApi from "../axios";
import Select from 'react-select';
import { formatDistance, parseISO, format } from 'date-fns';
import './noteslist.css';
import trashIcon from './assets/trash.png';
import editIcon from './assets/edit.png';

const getFullName = (user) => `${user.first_name} ${user.last_name}`;
const getUserInitials = (user) => {
  return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
};

const NotesList = () => {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [formMode, setFormMode] = useState('');
  const [editingNote, setEditingNote] = useState(null);
  const [newNote, setNewNote] = useState({
    title: '',
    content: '',
    shared_with: [],
    date: new Date().toISOString(),
  });
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMyNotes, setShowMyNotes] = useState(false); // State for "My Notes" toggle
  const [loading, setLoading] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState(new Set());
  const [gridVisible, setGridVisible] = useState(false); // New state for grid visibility

  // Assume `loggedInUserId` is the ID of the current logged-in user.
  const loggedInUserId = localStorage.getItem('user_id'); // Replace with actual logged-in user logic.

  // Fetch notes
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const notesWithSharedWith = await axiosApi.get('/notes').then(data =>
          data.map(note => {
            const cleanedDate = note.date.replace(".000000Z", "Z");
            const formattedDate = format(new Date(cleanedDate), "MMM d, HH:mm");
            return {
              ...note,
              formattedDate,
              shared_with: note.shared_with || []
            };
          })
        );
        setNotes(notesWithSharedWith);
        setFilteredNotes(notesWithSharedWith);
        setGridVisible(true);
      } catch (error) {
        console.error("Error fetching notes:", error);
        setNotes([]);
      }
    };
    fetchNotes();
  }, []);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userOptions = await axiosApi.get("/users").then(data =>
          data.map((user) => ({
            value: user.id,
            label: getFullName(user),
            ...user
          }))
        );
        setUsers(userOptions);
      } catch (err) {
        console.error("Failed to fetch users: ", err);
      }
    };
    fetchUsers();
  }, []);

  // Filter notes based on search query or "My Notes" toggle
  useEffect(() => {
    let filtered = notes;
    if (searchQuery) {
      filtered = filtered.filter((note) =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (showMyNotes) {
      filtered = filtered.filter((note) => {
        const isCreator = note.user_id === loggedInUserId;
        return isCreator;
      });
    }
    setFilteredNotes(filtered);
  }, [searchQuery, notes, showMyNotes]);

  // Create note
  const handleCreateNote = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const currentDate = new Date().toISOString();
      const response = await axiosApi.post('/notes', {
        ...newNote,
        date: currentDate,
        shared_with: selectedUsers.map(user => user.value),
      });
      
      const formattedDate = format(new Date(currentDate), "MMM d, HH:mm");
      const noteWithFormattedDate = {
        ...response,
        formattedDate,
      };

      setNotes([noteWithFormattedDate, ...notes]);
      setNewNote({ 
        title: '', 
        content: '', 
        shared_with: [],
        date: new Date().toISOString() 
      });
      setSelectedUsers([]);
      setFormMode('');
    } catch (error) {
      console.error('Error creating note:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update note
  const handleUpdateNote = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const currentDate = new Date().toISOString();
      const updatedNote = {
        ...editingNote,
        date: currentDate,
        shared_with: selectedUsers.map(user => user.value)
      };
      const response = await axiosApi.put(`/notes/${editingNote.id}`, updatedNote);
      
      const formattedDate = format(new Date(currentDate), "MMM d, HH:mm");
      const noteWithFormattedDate = {
        ...response,
        formattedDate,
      };

      setNotes(notes.map(note => 
        note.id === editingNote.id ? noteWithFormattedDate : note
      ));
      setEditingNote(null);
      setSelectedUsers([]);
      setFormMode('');
    } catch (error) {
      console.error('Error updating note:', error);
    } finally {
      setLoading(false);
    }
  };

  // Delete note
  const handleDeleteNote = async (id) => {
    try {
      await axiosApi.delete(`/notes/${id}`);
      setNotes(notes.filter(note => note.id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  // Handle user selection
  const handleUserChange = (selectedOptions) => {
    setSelectedUsers(selectedOptions || []);
    setNewNote(prev => ({
      ...prev,
      shared_with: selectedOptions ? selectedOptions.map(option => option.value) : []
    }));
  };

  // Render timestamp with date-fns
  const renderTimestamp = (date, prefix = '') => {
    if (!date) return null;
    let parsedDate;
    try {
      const cleanedDate = date.replace(".000000Z", "Z");
      parsedDate = parseISO(cleanedDate);
    } catch (e) {
      console.error("Invalid date format:", date);
      return null;
    }
    const formattedDate = format(parsedDate, 'PPp');
    const timeAgo = formatDistance(parsedDate, new Date(), { addSuffix: true });

    return (
      <div className="text-sm text-gray-500">
        {prefix}{formattedDate} ({timeAgo})
      </div>
    );
  };

  const toggleNoteExpansion = (noteId) => {
    setExpandedNotes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(noteId)) {
        newSet.delete(noteId);
      } else {
        newSet.add(noteId);
      }
      return newSet;
    });
  };

  return (
    <div className="notes-container">
      <div className="notes-header">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="button-group">
        <button
          className="my-notes-button"
          onClick={() => setShowMyNotes(!showMyNotes)}
        >
          {showMyNotes ? "Show All Notes" : "Show My Notes"}
        </button>

        <button
          className="add-button"
          onClick={() => {
            setFormMode("add");
            setNewNote({ title: '', content: '', shared_with: [] });
            setSelectedUsers([]);
          }}
        >
          Add Note
        </button>
        </div>
      </div>

      {/* Form Modal */}
      {(formMode === "add" || formMode === "edit") && (
        <div className="modal-overlay">
          <div className="modal-content">
            <form onSubmit={formMode === "add" ? handleCreateNote : handleUpdateNote}>
              <input
                type="text"
                className="form-input"
                placeholder="Title"
                value={formMode === "add" ? newNote.title : editingNote?.title}
                onChange={(e) => 
                  formMode === "add" 
                    ? setNewNote({ ...newNote, title: e.target.value })
                    : setEditingNote({ ...editingNote, title: e.target.value })
                }
                required
              />
              <textarea
                className="form-input"
                placeholder="Content"
                value={formMode === "add" ? newNote.content : editingNote?.content}
                onChange={(e) => 
                  formMode === "add"
                    ? setNewNote({ ...newNote, content: e.target.value })
                    : setEditingNote({ ...editingNote, content: e.target.value })
                }
                required
              />
              <Select
                isMulti
                name="users"
                options={users}
                className="mb-4 custom-select"
                classNamePrefix="select"
                value={selectedUsers}
                onChange={handleUserChange}
                placeholder="Select users to share with..."
              />
              <div className="button-group">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setFormMode('');
                    setSelectedUsers([]);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (formMode === "add" ? "Add" : "Update")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notes List */}
      <div className={`notes-grid ${gridVisible ? 'visible' : ''}`}>
        {filteredNotes.map((note) => (
          <div key={note.id} className={`note-card ${note.shared_with?.length > 0 ? 'has-shared-users' : ''}`}>
            <h3 className="note-title">{note.title}</h3>
            
            <div className="note-content">
              {note.content.length > 150 ? (
                <>
                  {expandedNotes.has(note.id) 
                    ? note.content
                    : `${note.content.slice(0, 150)}...`}
                  <button 
                    className="show-more-btn"
                    onClick={() => toggleNoteExpansion(note.id)}
                  >
                    {expandedNotes.has(note.id) ? 'Show Less' : 'Show More'}
                  </button>
                </>
              ) : (
                note.content
              )}
            </div>

            {note.shared_with && note.shared_with.length > 0 && (
              <div className="shared-users-container">
                <span className="shared-label">Shared with:</span>
                <div className="shared-users">
                  {(expandedNotes.has(note.id) 
                    ? note.shared_with 
                    : note.shared_with.slice(0, 8) 
                  ).map((sharedUser, index) => (
                    <span 
                      key={`${note.id}-shared-${sharedUser.id}`}
                      className="shared-user-initial"
                      title={getFullName(sharedUser)}
                      data-index={index % 8}
                    >
                      {getUserInitials(sharedUser)}
                    </span>
                  ))}
                </div>
                {note.shared_with.length > 8 && !expandedNotes.has(note.id) && (
                  <button 
                    className="show-more-users-btn"
                    onClick={() => toggleNoteExpansion(note.id)}
                  >
                    {`+${note.shared_with.length - 8} more`}
                  </button>
                )}
                {expandedNotes.has(note.id) && note.shared_with.length > 8 && (
                  <button 
                    className="show-less-users-btn"
                    onClick={() => toggleNoteExpansion(note.id)}
                  >
                    Show Less
                  </button>
                )}
              </div>
            )}

            <div className="timestamp">
              {note.formattedDate}
            </div>

            <div className="note-actions">
              <button
                className="edit-button"
                onClick={() => {
                  const sharedUsers = note.shared_with
                    ? note.shared_with.map(user => users.find(u => u.id === user.id))
                    .filter(Boolean)
                    : [];
                  setEditingNote(note);
                  setSelectedUsers(sharedUsers);
                  setFormMode("edit");
                }}
              >
                <img src={editIcon} alt="Edit" />
                Edit
              </button>
              <button
                className="delete-button"
                onClick={() => handleDeleteNote(note.id)}
              >
                <img src={trashIcon} alt="Delete" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotesList;
