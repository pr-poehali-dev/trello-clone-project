CREATE TABLE t_p35498734_trello_clone_project.teams (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id INTEGER REFERENCES t_p35498734_trello_clone_project.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);