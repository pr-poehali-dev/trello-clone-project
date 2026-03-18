CREATE TABLE t_p35498734_trello_clone_project.notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  related_board_id INTEGER,
  related_card_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);