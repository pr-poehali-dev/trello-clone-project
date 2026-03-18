INSERT INTO t_p35498734_trello_clone_project.users (name, email, role) VALUES ('Алексей Петров', 'alex@example.com', 'admin') ON CONFLICT (email) DO NOTHING;
INSERT INTO t_p35498734_trello_clone_project.users (name, email, role) VALUES ('Мария Сидорова', 'maria@example.com', 'member') ON CONFLICT (email) DO NOTHING;
INSERT INTO t_p35498734_trello_clone_project.users (name, email, role) VALUES ('Иван Козлов', 'ivan@example.com', 'member') ON CONFLICT (email) DO NOTHING;
INSERT INTO t_p35498734_trello_clone_project.users (name, email, role) VALUES ('Ольга Новикова', 'olga@example.com', 'member') ON CONFLICT (email) DO NOTHING;

INSERT INTO t_p35498734_trello_clone_project.teams (name, description, owner_id) VALUES ('Команда разработки', 'Основная команда разработки продукта', 1);

INSERT INTO t_p35498734_trello_clone_project.boards (title, description, cover_color, owner_id, is_starred) VALUES ('Разработка продукта', 'Основной проект', 'purple', 1, true);
INSERT INTO t_p35498734_trello_clone_project.boards (title, description, cover_color, owner_id) VALUES ('Маркетинг Q1', 'Маркетинговые задачи', 'cyan', 1);
INSERT INTO t_p35498734_trello_clone_project.boards (title, description, cover_color, owner_id) VALUES ('Дизайн системы', 'UI/UX компоненты', 'pink', 1);

INSERT INTO t_p35498734_trello_clone_project.lists (board_id, title, position) VALUES (1, 'Бэклог', 0);
INSERT INTO t_p35498734_trello_clone_project.lists (board_id, title, position) VALUES (1, 'В работе', 1);
INSERT INTO t_p35498734_trello_clone_project.lists (board_id, title, position) VALUES (1, 'На проверке', 2);
INSERT INTO t_p35498734_trello_clone_project.lists (board_id, title, position) VALUES (1, 'Готово', 3);

INSERT INTO t_p35498734_trello_clone_project.cards (list_id, board_id, title, description, position, priority, labels) VALUES (1, 1, 'Создать дизайн главной страницы', 'Разработать макет', 0, 'high', ARRAY['дизайн','UI']);
INSERT INTO t_p35498734_trello_clone_project.cards (list_id, board_id, title, description, position, priority, labels) VALUES (1, 1, 'Настроить CI/CD', 'Автоматизировать деплой', 1, 'medium', ARRAY['devops']);
INSERT INTO t_p35498734_trello_clone_project.cards (list_id, board_id, title, description, position, priority, labels) VALUES (2, 1, 'Разработка API авторизации', 'JWT токены', 0, 'high', ARRAY['backend','auth']);
INSERT INTO t_p35498734_trello_clone_project.cards (list_id, board_id, title, description, position, priority, labels) VALUES (2, 1, 'Написать unit тесты', 'Покрыть тестами модули', 1, 'low', ARRAY['тесты']);
INSERT INTO t_p35498734_trello_clone_project.cards (list_id, board_id, title, description, position, priority) VALUES (3, 1, 'Code review модуля оплаты', 'Проверить безопасность', 0, 'high');
INSERT INTO t_p35498734_trello_clone_project.cards (list_id, board_id, title, description, position, priority, labels) VALUES (4, 1, 'Запуск MVP', 'Финальный релиз', 0, 'medium', ARRAY['релиз']);

INSERT INTO t_p35498734_trello_clone_project.team_members (team_id, user_id, role) VALUES (1, 1, 'admin');
INSERT INTO t_p35498734_trello_clone_project.team_members (team_id, user_id, role) VALUES (1, 2, 'member');
INSERT INTO t_p35498734_trello_clone_project.team_members (team_id, user_id, role) VALUES (1, 3, 'member');
INSERT INTO t_p35498734_trello_clone_project.team_members (team_id, user_id, role) VALUES (1, 4, 'member');

INSERT INTO t_p35498734_trello_clone_project.notifications (user_id, title, message, type, is_read) VALUES (1, 'Новая задача назначена', 'Вам назначена задача "Разработка API авторизации"', 'task', false);
INSERT INTO t_p35498734_trello_clone_project.notifications (user_id, title, message, type, is_read) VALUES (1, 'Комментарий к задаче', 'Мария прокомментировала карточку "Code review"', 'comment', false);
INSERT INTO t_p35498734_trello_clone_project.notifications (user_id, title, message, type, is_read) VALUES (1, 'Приглашение в команду', 'Вы добавлены в команду "Команда разработки"', 'team', true);