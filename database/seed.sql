-- Předdefinované předměty
INSERT INTO subjects (name, code) VALUES
('Matematika', 'MAT'),
('Český jazyk', 'CJL'),
('Anglický jazyk', 'ANJ'),
('Fyzika', 'FY'),
('Chemie', 'CH'),
('Dějepis', 'DEJ'),
('Zeměpis', 'ZE');

-- Předdefinovaná místa v třídě (6 lavic x 5 řad)
INSERT INTO places (name, row, column) VALUES 
('A1', 1, 1), ('A2', 1, 2), ('A3', 1, 3), ('A4', 1, 4), ('A5', 1, 5), ('A6', 1, 6),
('B1', 2, 1), ('B2', 2, 2), ('B3', 2, 3), ('B4', 2, 4), ('B5', 2, 5), ('B6', 2, 6),
('C1', 3, 1), ('C2', 3, 2), ('C3', 3, 3), ('C4', 3, 4), ('C5', 3, 5), ('C6', 3, 6),
('D1', 4, 1), ('D2', 4, 2), ('D3', 4, 3), ('D4', 4, 4), ('D5', 4, 5), ('D6', 4, 6),
('E1', 5, 1), ('E2', 5, 2), ('E3', 5, 3), ('E4', 5, 4), ('E5', 5, 5), ('E6', 5, 6);