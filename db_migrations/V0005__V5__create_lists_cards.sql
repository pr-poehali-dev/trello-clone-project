CREATE TABLE t_p35498734_trello_clone_project.lists (
  id SERIAL PRIMARY KEY,
  board_id INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  position INTEGER DEFAULT 0,
  color VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE t_p35498734_trello_clone_project.cards (
  id SERIAL PRIMARY KEY,
  list_id INTEGER NOT NULL,
  board_id INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  position INTEGER DEFAULT 0,
  priority VARCHAR(20) DEFAULT 'medium',
  due_date TIMESTAMP,
  assignee_id INTEGER,
  labels TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);