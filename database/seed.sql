-- Naplnění tabulky places pevnými místy (příklad 6 míst)
INSERT INTO places (name, row, column) VALUES
('1A', 1, 1),
('1B', 1, 2),
('2A', 2, 1),
('2B', 2, 2),
('3A', 3, 1),
('3B', 3, 2);

-- Ukázkové předměty
INSERT INTO subjects (name, code) VALUES
('Matematika', 'MAT'),
('Angličtina', 'ANG');

-- Ukázkoví žáci v zasedacím pořádku
INSERT INTO seating_plans (firstname, lastname, subject_id, place_id) VALUES
('Jan', 'Novák', 1, 1),
('Petr', 'Svoboda', 2, 2);

INSERT INTO subjects (name, code) VALUES ('Matematika', 'MAT');
INSERT INTO subjects (name, code) VALUES ('Angličtina', 'ENG');
INSERT INTO subjects (name, code) VALUES ('Fyzika', 'FYZ');