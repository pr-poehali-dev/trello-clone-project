CREATE TABLE t_p35498734_trello_clone_project.boards (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  cover_color VARCHAR(50) DEFAULT 'purple',
  team_id INTEGER,
  owner_id INTEGER,
  is_starred BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);