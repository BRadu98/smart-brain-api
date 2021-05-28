BEGIN TRANSACTION;

INSERT into users (name, email, entries, joined, age, pet) values ('a', 'a@gmail.com', 5, '2021-01-01', 21, 'cat');
INSERT into login (hash, email) values ('$2a$10$WAK21U0LWl7C//jJ.DOB2uPP1DJQh7KUDgasdyQeGzkop2Pzl8W7u', 'a@gmail.com');

COMMIT;