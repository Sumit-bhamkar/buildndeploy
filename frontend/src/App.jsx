
import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "/api/notes";

function App() {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function fetchNotes(searchTerm = "") {
    try {
      setError("");

      const url = new URL(API_URL, window.location.origin);
      if (searchTerm.trim()) {
        url.searchParams.set("search", searchTerm.trim());
      }

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Could not load notes.");
      }

      const data = await response.json();
      setNotes(data);
    } catch (err) {
      setError(
        "Cannot connect to the backend. Check that the server is running on port 5000."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNotes(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  function resetForm() {
    setTitle("");
    setContent("");
    setCategory("General");
    setEditingId(null);
    setShowForm(false);
  }

  async function saveNote(event) {
    event.preventDefault();

    if (!title.trim() || !content.trim()) return;

    setSaving(true);
    setError("");

    try {
      const isEditing = editingId !== null;

      const response = await fetch(
        isEditing ? `${API_URL}/${editingId}` : API_URL,
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            content: content.trim(),
            category,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not save note.");
      }

      resetForm();
      await fetchNotes(search);
    } catch (err) {
      setError(err.message || "Could not save note.");
    } finally {
      setSaving(false);
    }
  }

  function editNote(note) {
    setTitle(note.title);
    setContent(note.content);
    setCategory(note.category);
    setEditingId(note.id);
    setShowForm(true);
  }

  async function deleteNote(id) {
    const confirmed = window.confirm("Are you sure you want to delete this note?");
    if (!confirmed) return;

    setError("");

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not delete note.");
      }

      if (editingId === id) resetForm();
      await fetchNotes(search);
    } catch (err) {
      setError(err.message || "Could not delete note.");
    }
  }

  return (
    <div className="app">
      <aside className="sidebar">
        <a className="brand" href="/">
          <span className="brand-icon">B</span>
         <span>
  Build<span className="accent">N</span>Deploy
</span>
        </a>

        <p className="nav-label">WORKSPACE</p>

        <button className="nav-item active">
          <span>▤</span>
          All Notes
          <span className="note-count">{notes.length}</span>
        </button>

        <div className="sidebar-bottom">
          <div className="profile-avatar">S</div>
          <div>
            <strong>My Workspace</strong>
            <p>DevOps Learner</p>
          </div>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <span className="breadcrumb">
            Workspace / <strong>All Notes</strong>
          </span>
          <span className="status">
            <span />
            Personal Workspace
          </span>
        </header>

        <section className="content-area">
          <div className="welcome">
            <div>
              <p className="eyebrow">YOUR KNOWLEDGE HUB</p>
              <h1>DevOps Notes</h1>
              <p className="subtitle">
                Capture what you learn. Build your future, one note at a time.
              </p>
            </div>

            <button
              className="primary-button"
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
            >
              <span>＋</span> New Note
            </button>
          </div>

          {error && (
            <div className="error-message" role="alert">
              {error}
              <button onClick={() => fetchNotes(search)}>Retry</button>
            </div>
          )}

          <div className="stats">
            <div className="stat-card">
              <span className="stat-icon purple">▤</span>
              <div>
                <p>Total Notes</p>
                <h2>{notes.length}</h2>
              </div>
            </div>

            <div className="stat-card">
              <span className="stat-icon green">⌘</span>
              <div>
                <p>Topics Covered</p>
                <h2>{new Set(notes.map((note) => note.category)).size}</h2>
              </div>
            </div>

            <div className="stat-card">
              <span className="stat-icon orange">✦</span>
              <div>
                <p>Your Focus</p>
                <h2>Keep Learning</h2>
              </div>
            </div>
          </div>

          {showForm && (
            <form className="note-form" onSubmit={saveNote}>
              <h2>{editingId !== null ? "Edit Note" : "Create a Note"}</h2>

              <label htmlFor="note-title">Note Title</label>
              <input
                id="note-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Kubernetes Pods"
                required
              />

              <label htmlFor="note-category">Category</label>
              <select
                id="note-category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                <option>General</option>
                <option>Linux</option>
                <option>Docker</option>
                <option>Kubernetes</option>
                <option>AWS</option>
                <option>CI/CD</option>
                <option>Networking</option>
              </select>

              <label htmlFor="note-content">Note Content</label>
              <textarea
                id="note-content"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Write your learning notes here..."
                rows="4"
                required
              />

              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId !== null
                      ? "Update Note"
                      : "Save Note"}
                </button>
              </div>
            </form>
          )}

          <div className="notes-heading">
            <div>
              <h2>Your Notes</h2>
              <p>All your learning, organized in one place.</p>
            </div>

            <label className="search-box">
              <span>⌕</span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search notes by title..."
              />
            </label>
          </div>

          <div className="notes-grid">
            {loading ? (
              <p>Loading notes...</p>
            ) : (
              <>
                {notes.map((note) => (
                  <article className="note-card" key={note.id}>
                    <div className="note-card-top">
                      <span
                        className={`category category-${note.category
                          .toLowerCase()
                          .replace(/[^a-z]/g, "")}`}
                      >
                        {note.category}
                      </span>

                      <div className="note-actions">
                        <button
                          type="button"
                          className="edit-button"
                          onClick={() => editNote(note)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="delete-button"
                          onClick={() => deleteNote(note.id)}
                          aria-label={`Delete ${note.title}`}
                        >
                          ×
                        </button>
                      </div>
                    </div>

                    <h3>{note.title}</h3>
                    <p className="note-content">{note.content}</p>

                    <div className="note-footer">
                      <span>PERSONAL NOTE</span>
                      <span>↗</span>
                    </div>
                  </article>
                ))}

                {notes.length === 0 && (
                  <div className="empty-state">
                    <h3>No notes found</h3>
                    <p>Try another search or create a new note.</p>
                  </div>
                )}
              </>
            )}
          </div>

          <footer>
            Built for your DevOps journey <span>♥</span>
          </footer>
        </section>
      </main>
    </div>
  );
}

export default App;
