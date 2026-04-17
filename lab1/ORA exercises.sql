-- start
create sequence s_person_seq
   start with 1
   increment by 1;

create table person
(
  person_id int not null
      constraint pk_person
         primary key,
  firstname varchar(50),
  lastname varchar(50)
);

alter table person
    modify person_id int default s_person_seq.nextval;


create sequence s_trip_seq
   start with 1
   increment by 1;

create table trip
(
  trip_id int  not null
     constraint pk_trip
         primary key,
  trip_name varchar(100),
  country varchar(50),
  trip_date date,
  max_no_places int
);

alter table trip
    modify trip_id int default s_trip_seq.nextval;


create sequence s_reservation_seq
   start with 1
   increment by 1;

create table reservation
(
  reservation_id int not null
      constraint pk_reservation
         primary key,
  trip_id int,
  person_id int,
  status char(1)
);

alter table reservation
    modify reservation_id int default s_reservation_seq.nextval;


alter table reservation
add constraint reservation_fk1 foreign key
( person_id ) references person ( person_id );

alter table reservation
add constraint reservation_fk2 foreign key
( trip_id ) references trip ( trip_id );

alter table reservation
add constraint reservation_chk1 check
(status in ('N','P','C'));

create sequence s_log_seq
   start with 1
   increment by 1;


create table log
(
    log_id int not null
         constraint pk_log
         primary key,
    reservation_id int not null,
    log_date date not null,
    status char(1)
);

alter table log
    modify log_id int default s_log_seq.nextval;

alter table log
add constraint log_chk1 check
(status in ('N','P','C')) enable;

alter table log
add constraint log_fk1 foreign key
( reservation_id ) references reservation ( reservation_id );

-- trip
insert into trip(trip_name, country, trip_date, max_no_places)
values ('Wycieczka do Paryza', 'Francja', to_date('2023-09-12', 'YYYY-MM-DD'), 3);

insert into trip(trip_name, country, trip_date,  max_no_places)
values ('Piekny Krakow', 'Polska', to_date('2026-05-03','YYYY-MM-DD'), 2);

insert into trip(trip_name, country, trip_date,  max_no_places)
values ('Znow do Francji', 'Francja', to_date('2026-05-01','YYYY-MM-DD'), 2);

insert into trip(trip_name, country, trip_date,  max_no_places)
values ('Hel', 'Polska', to_date('2026-05-01','YYYY-MM-DD'),  2);

-- person
insert into person(firstname, lastname)
values ('Jan', 'Nowak');

insert into person(firstname, lastname)
values ('Jan', 'Kowalski');

insert into person(firstname, lastname)
values ('Jan', 'Nowakowski');

insert into person(firstname, lastname)
values  ('Novak', 'Nowak');

-- reservation
-- trip1
insert  into reservation(trip_id, person_id, status)
values (1, 1, 'P');

insert into reservation(trip_id, person_id, status)
values (1, 2, 'N');

-- trip 2
insert into reservation(trip_id, person_id, status)
values (2, 1, 'P');

insert into reservation(trip_id, person_id, status)
values (2, 4, 'C');

-- trip 3
insert into reservation(trip_id, person_id, status)
values (2, 4, 'P');

-- trip
insert into trip(trip_name, country, trip_date, max_no_places)
values ('Wycieczka do Paryza', 'Francja', to_date('2023-09-12', 'YYYY-MM-DD'), 3);

insert into trip(trip_name, country, trip_date,  max_no_places)
values ('Piekny Krakow', 'Polska', to_date('2026-05-03','YYYY-MM-DD'), 2);

insert into trip(trip_name, country, trip_date,  max_no_places)
values ('Znow do Francji', 'Francja', to_date('2026-05-01','YYYY-MM-DD'), 2);

insert into trip(trip_name, country, trip_date,  max_no_places)
values ('Hel', 'Polska', to_date('2026-05-01','YYYY-MM-DD'),  2);

-- person
insert into person(firstname, lastname)
values ('Jan', 'Furtak');

insert into person(firstname, lastname)
values ('Jan', 'Czarski');

insert into person(firstname, lastname)
values ('Jan', 'Meszka');

insert into person(firstname, lastname)
values  ('Mariusz', 'Mrówka');

-- reservation
-- trip1
insert  into reservation(trip_id, person_id, status)
values (1, 7, 'P');

insert into reservation(trip_id, person_id, status)
values (1, 8, 'N');

-- trip 2
insert into reservation(trip_id, person_id, status)
values (2, 1, 'P');

insert into reservation(trip_id, person_id, status)
values (2, 4, 'C');

-- trip 3
insert into reservation(trip_id, person_id, status)
values (2, 4, 'P');


-- vw_reservation
-- widok łączy dane z tabel: trip, person, reservation
-- zwracane dane: reservation_id, country, trip_date, trip_name, firstname, lastname, status, trip_id, person_id

CREATE OR REPLACE VIEW vw_reservation AS
SELECT
    reservation_id,
    country,
    trip_date,
    trip_name,
    firstname,
    lastname,
    status,
    t.trip_id,
    p.person_id
FROM reservation r
JOIN trip t ON r.trip_id = t.trip_id
JOIN person p ON r.person_id = p.person_id;


select * from vw_reservation;

-- vw_trip - pokazanie wolnych miejsc (C - niezliczone)

CREATE OR REPLACE VIEW vw_trip AS
SELECT
    trip_id,
    country,
    trip_date,
    trip_name,
    max_no_places,
    (max_no_places - (
        SELECT COUNT(*)
        FROM reservation r
        WHERE r.trip_id = t.trip_id and r.status in ('N', 'P')
    )) AS no_available_places
FROM trip t;

select * from vw_trip;


-- vw_avaliable_trip - vw_trip with time and space constraint

CREATE OR REPLACE VIEW vw_available_trip AS
SELECT
    trip_id,
    country,
    trip_date,
    trip_name,
    max_no_places,
    no_available_places
FROM vw_trip
WHERE trip_date > SYSDATE
AND no_available_places > 0;

SELECT * FROM vw_available_trip;


-- Zadanie 2 - FUNKCJE --------------------------------------------------------------------------------------------

-- Tworze typ obiektowy reprezentujący pojedynczy wiersz rezerwacji
CREATE OR REPLACE TYPE t_reservation_rec AS OBJECT (
    reservation_id INT, country VARCHAR2(50), trip_date DATE, trip_name VARCHAR2(100),
    firstname VARCHAR2(50), lastname VARCHAR2(50), status CHAR(1), trip_id INT, person_id INT
);


-- Tworzymy typ tabelaryczny bazujący na typie wierszu powyżej
CREATE OR REPLACE TYPE t_reservation_tab IS TABLE OF t_reservation_rec;


-- Typy dla wycieczek
CREATE OR REPLACE TYPE t_trip_rec AS OBJECT (
    trip_id INT, country VARCHAR2(50), trip_date DATE, trip_name VARCHAR2(100),
    max_no_places INT, no_available_places INT
);
-- ten sam zabieg co wczesniej
CREATE OR REPLACE TYPE t_trip_tab IS TABLE OF t_trip_rec;


CREATE OR REPLACE FUNCTION f_trip_participants(p_trip_id INT)
RETURN t_reservation_tab PIPELINED
IS
    v_count INT;
BEGIN
    -- sprawdzenie czy mamy pasujące wyniki
    SELECT COUNT(*) INTO v_count FROM trip WHERE trip_id = p_trip_id;
    IF v_count = 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'Wycieczka o podanym ID nie istnieje.');
    END IF;
    -- zwrócenie poprawnego wyniku
    FOR curr IN (SELECT * FROM vw_reservation WHERE trip_id = p_trip_id) LOOP
        PIPE ROW(t_reservation_rec(curr.reservation_id, curr.country, curr.trip_date,
                 curr.trip_name, curr.firstname, curr.lastname, curr.status, curr.trip_id, curr.person_id));
    END LOOP;
    RETURN;
END;


CREATE OR REPLACE FUNCTION f_person_reservations(p_person_id INT)
RETURN t_reservation_tab PIPELINED
IS
BEGIN
    -- Pominąłem kontrolę parametru dla zwięzłości, ale można ją dodać analogicznie
    FOR curr IN (SELECT * FROM vw_reservation WHERE person_id = p_person_id) LOOP
        PIPE ROW(t_reservation_rec(curr.reservation_id, curr.country, curr.trip_date,
                 curr.trip_name, curr.firstname, curr.lastname, curr.status, curr.trip_id, curr.person_id));
    END LOOP;
    RETURN;
END;

CREATE OR REPLACE FUNCTION f_available_trips_to(p_country VARCHAR2, p_date_from DATE, p_date_to DATE)
RETURN t_trip_tab PIPELINED
IS
BEGIN
-- sprawdzenie czy data rozpoczecia wycieczki nie jest po dacie zakonczenia
    IF p_date_from > p_date_to THEN
        RAISE_APPLICATION_ERROR(-20002, 'Data OD nie może być późniejsza niż data DO.');
    END IF;
-- zwrocenie tabeli poprawnych wyników
    FOR curr IN (
        SELECT * FROM vw_available_trip
        WHERE country = p_country
          AND trip_date BETWEEN p_date_from AND p_date_to
    ) LOOP
        PIPE ROW(t_trip_rec(curr.trip_id, curr.country, curr.trip_date,
                 curr.trip_name, curr.max_no_places, curr.no_available_places));
    END LOOP;
    RETURN;
END;



-- ZADANIE 3 - PROCEDURY

-- - `p_add_reservation`
--   - zadaniem procedury jest dopisanie nowej rezerwacji
--   - parametry: `trip_id`, `person_id`
--   - procedura powinna kontrolować czy wycieczka jeszcze się nie odbyła, i czy sa wolne miejsca
--   - procedura powinna również dopisywać inf. do tabeli `log`

CREATE OR REPLACE PROCEDURE p_add_reservation(
    input_trip_id INT,
    input_person_id INT
)
IS
    var_available_places INT;
    var_trip_date DATE;
    var_log_reservation_id INT;
    var_person_check VARCHAR2(100);
BEGIN
    BEGIN
        SELECT no_available_places, trip_date
            INTO var_available_places, var_trip_date
        FROM vw_trip
        WHERE trip_id = input_trip_id;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20010, 'Wycieczka nie istnieje.');
    END;

    IF var_available_places <= 0 THEN
        RAISE_APPLICATION_ERROR(-20011, 'Brak wolnych miejsc.');
    END IF;

    IF var_trip_date <= SYSDATE THEN
        RAISE_APPLICATION_ERROR(-20012, 'Data wycieczki jest w przeszłości.');
    END IF;

    BEGIN
        SELECT LASTNAME INTO var_person_check
        FROM PERSON WHERE PERSON_ID = input_person_id;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20013, 'Osoba nie istnieje.');
    END;

    INSERT INTO RESERVATION (trip_id, person_id, status)
    VALUES (input_trip_id,input_person_id,'N')
    RETURNING RESERVATION_ID INTO var_log_reservation_id;

    INSERT INTO LOG (RESERVATION_ID, LOG_DATE, STATUS)
    VALUES (var_log_reservation_id, SYSDATE, 'N');
END;

BEGIN
 p_add_reservation(3,1);
END;
SELECT * FROM RESERVATION;



-- - `p_modify_reservation_status`
--   - zadaniem procedury jest zmiana statusu rezerwacji
--   - parametry: `reservation_id`, `status`
--   - dopuszczalne są wszystkie zmiany statusu
--     - ale procedura powinna kontrolować czy taka zmiana jest możliwa, np. zmiana statusu już anulowanej wycieczki (przywrócenie do stanu aktywnego nie zawsze jest możliwa – może już nie być miejsc)
--   - procedura powinna również dopisywać inf. do tabeli `log`

-- p_modify_reservation_status
CREATE OR REPLACE PROCEDURE p_modify_reservation_status (
    input_reservation_id INT,
    input_status CHAR
    )
IS
    var_old_status CHAR;
    var_trip_id INT;
    var_available_places INT;
BEGIN
    BEGIN
        SELECT status, trip_id INTO var_old_status, var_trip_id
        FROM reservation WHERE reservation_id = input_reservation_id;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20021, 'Nie istnieje rezerwacja o podanym ID.');
    END;

    -- przywracanie z anulowanej
    IF var_old_status = 'C' AND input_status IN ('N', 'P') THEN
        SELECT no_available_places INTO var_available_places
        FROM vw_trip WHERE trip_id = var_trip_id;

        IF var_available_places <= 0 THEN
            RAISE_APPLICATION_ERROR(-20020, 'Brak wolnych miejsc.');
        END IF;
    END IF;

    UPDATE reservation
    SET status = input_status
    WHERE reservation_id = input_reservation_id;

    INSERT INTO log (reservation_id, log_date, status)
    VALUES (input_reservation_id, SYSDATE, input_status);
END;

BEGIN
    p_modify_reservation_status(3,'P');
end;

BEGIN
    p_modify_reservation_status(4,'P');
end;

SELECT * FROM RESERVATION;


-- - `p_modify_max_no_places`
--   - zadaniem procedury jest zmiana maksymalnej liczby miejsc na daną wycieczkę
--   - parametry: `trip_id`, `max_no_places`
--   - nie wszystkie zmiany liczby miejsc są dozwolone, nie można zmniejszyć liczby miejsc na wartość poniżej liczby zarezerwowanych miejsc


-- p_modify_max_no_places
CREATE OR REPLACE PROCEDURE p_modify_max_no_places(
    input_trip_id INT,
    input_no_places INT)
IS
    var_taken_places INT;
    var_trip_exists INT; -- do sprawdzenia istnienia danej wycieczki
BEGIN
    SELECT COUNT(*) INTO var_taken_places
    FROM reservation
    WHERE trip_id = input_trip_id AND status IN ('N', 'P');

    IF input_no_places < var_taken_places THEN
        RAISE_APPLICATION_ERROR(-20030,
            'Próba zmiany ilości miejsc na mniejszą niż liczba zarezerwowanych.');
    END IF;

    
    SELECT COUNT(*) INTO var_trip_exists FROM trip WHERE trip_id = input_trip_id;

    IF var_trip_exists = 0 THEN
        RAISE_APPLICATION_ERROR(-20031, 'Nie ma wycieczki o danym ID.');
    END IF;

    UPDATE trip SET max_no_places = input_no_places WHERE trip_id = input_trip_id;

END;

BEGIN
    p_modify_max_no_places(2,1);
end;


-- ZADANIE 4 - TRIGGERY


-- Trigger akutalizując zmiany do tabeli log
CREATE OR REPLACE TRIGGER trg_reservation_log
AFTER INSERT OR UPDATE OF status ON reservation
FOR EACH ROW
BEGIN
    INSERT INTO log (reservation_id, log_date, status)
    VALUES (:NEW.reservation_id, SYSDATE, :NEW.status);
END;


-- Trigger zabraniający usuwania rezerwacji
CREATE OR REPLACE TRIGGER trg_reservation_prevent_del
BEFORE DELETE ON reservation
FOR EACH ROW
BEGIN
    RAISE_APPLICATION_ERROR(-20040, 'Usuwanie rezerwacji jest zablokowane. Zmień status na C (Canceled).');
END;


CREATE OR REPLACE PROCEDURE p_add_reservation_4(
    input_trip_id INT,
    input_person_id INT)
IS
    var_available_places INT;
    var_trip_date DATE;
BEGIN
    BEGIN
        SELECT no_available_places, trip_date
            INTO var_available_places, var_trip_date
        FROM vw_trip
        WHERE trip_id = input_trip_id;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20010, 'Wycieczka nie istnieje.');
    END;
    -- wyjątek obycia się już wycieczki
    IF var_trip_date <= SYSDATE THEN
        RAISE_APPLICATION_ERROR(-20011, 'Wycieczka już się odbyła lub trwa.');
    END IF;
    -- wyjatek przy brakujacych miejsach wycieczki
    IF var_available_places <= 0 THEN
        RAISE_APPLICATION_ERROR(-20012, 'Brak wolnych miejsc na wycieczkę.');
    END IF;

    -- Tabela log zaktualizuje się sama przez trigger
    INSERT INTO reservation (trip_id, person_id, status)
    VALUES (input_trip_id, input_person_id, 'N');
END;


CREATE OR REPLACE PROCEDURE p_modify_reservation_status_4(
    input_reservation_id INT,
    input_status CHAR)
IS
    var_old_status CHAR(1);
    var_trip_id INT;
    var_available_places INT;
BEGIN
    BEGIN
        SELECT status, trip_id INTO var_old_status, var_trip_id
        FROM reservation WHERE reservation_id = input_reservation_id;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20021, 'Nie istnieje rezerwacja o podanym ID.');
    END;

    IF var_old_status = 'C' AND input_status IN ('N', 'P') THEN
        SELECT no_available_places INTO var_available_places FROM vw_trip WHERE trip_id = var_trip_id;
        -- warunek sprawdzający czy można zmienić status z odwolanego na nowy/potwierdzony i oplacony spowodowany przez brak miejsc
        IF var_available_places <= 0 THEN
            RAISE_APPLICATION_ERROR(-20020, 'Nie można przywrócić rezerwacji. Brak wolnych miejsc.');
        END IF;
    END IF;

    -- Log zostanie wpisany przez trigger
    UPDATE reservation SET status = input_status WHERE reservation_id = input_reservation_id;
END;





-- ZADANIE 5 - TRIGGERY

-- trigger sprawdzający ilosc wolnych miejsc
CREATE OR REPLACE TRIGGER trg_check_available_places
FOR INSERT OR UPDATE OF status ON reservation
COMPOUND TRIGGER

    -- var_trips - lista ID wycieczek aktualizowanych, bo inaczej przy wielu na raz kaput
    TYPE t_trip_list IS TABLE OF INT INDEX BY PLS_INTEGER;
    var_trips t_trip_list;
    var_idx INT := 1;

    BEFORE EACH ROW IS
    BEGIN
        -- zliczamy jezeli dodane nowe ok rezerwacje
        IF INSERTING AND :NEW.status IN ('N', 'P') THEN
            var_trips(var_idx) := :NEW.trip_id;
            var_idx := var_idx + 1;
        -- zliczamy dodatkowo, jeżeli z stan zmienia sie z anulowanej
        ELSIF UPDATING AND :OLD.status = 'C' AND :NEW.status IN ('N', 'P') THEN
            var_trips(var_idx) := :NEW.trip_id;
            var_idx := var_idx + 1;
        END IF;
    END BEFORE EACH ROW;

    -- sprawdzenie po aktualizacji ile jest wolnych miejsc
    AFTER STATEMENT IS
        var_available_places INT;
    BEGIN
        FOR i IN 1 .. var_trips.COUNT LOOP
            SELECT no_available_places INTO var_available_places
            FROM vw_trip
            WHERE trip_id = var_trips(i);

            IF var_available_places < 0 THEN
                RAISE_APPLICATION_ERROR(-20050, 'Brak wolnych miejsc - trigger.');
            END IF;
        END LOOP;

    END AFTER STATEMENT;

END trg_check_available_places;


CREATE OR REPLACE PROCEDURE p_add_reservation_5(
    input_trip_id INT,
    input_person_id INT
)
IS
    var_trip_date DATE;
BEGIN
    BEGIN
        SELECT trip_date
            INTO var_trip_date
        FROM trip
        WHERE trip_id = input_trip_id;
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            RAISE_APPLICATION_ERROR(-20010, 'Wycieczka nie istnieje.');
    END;

    IF var_trip_date <= SYSDATE THEN
        RAISE_APPLICATION_ERROR(-20012, 'Data wycieczki jest w przeszłości.');
    END IF;

    INSERT INTO RESERVATION (trip_id, person_id, status)
    VALUES (input_trip_id,input_person_id,'N');
END;

CREATE OR REPLACE PROCEDURE p_modify_reservation_status_5(
    input_reservation_id INT,
    input_status CHAR
    )
IS
BEGIN
    UPDATE reservation
    SET status = input_status
    WHERE reservation_id = input_reservation_id;

    -- sql%rowcount - ile zmienilo sie wierszy przez procedure
    IF SQL%ROWCOUNT = 0 THEN
        RAISE_APPLICATION_ERROR(-20021, 'Nie istnieje rezerwacja o podanym ID.');
    END IF;
END;

begin
    p_modify_reservation_status_5(4,'P');
end;






-- CZĘŚĆ 2

-- Zadanie 6

alter table trip add
    no_available_places int null;

CREATE OR REPLACE PROCEDURE p_recalculate_places_6 AS
BEGIN
    UPDATE trip t
    SET t.no_available_places = t.max_no_places - (
        SELECT COUNT(*)
        FROM reservation r
        WHERE r.trip_id = t.trip_id
          AND r.status IN ('N', 'P')
    );
END;

BEGIN
    p_recalculate_places_6;
END;

select * from trip;

select * from reservation;

select * from person;


-- Zadanie 6a


CREATE OR REPLACE VIEW vw_trip_6a AS
SELECT
    trip_id,
    trip_name,
    country,
    trip_date,
    max_no_places,
    no_available_places
FROM trip;

-- dodanie rezerwacji z licznikiem miejsc
CREATE OR REPLACE PROCEDURE p_add_reservation_6a(
    p_trip_id INT,
    p_person_id INT
) IS
    v_available INT;
    v_reservation_id INT; -- dla logów
BEGIN
    SELECT no_available_places INTO v_available
    FROM trip WHERE trip_id = p_trip_id;

    IF v_available <= 0 THEN
        RAISE_APPLICATION_ERROR(-20060, 'Brak wolnych miejsc.');
    END IF;

    INSERT INTO RESERVATION (trip_id, person_id, status)
    VALUES (p_trip_id,p_person_id,'N')
    RETURNING RESERVATION_ID INTO v_reservation_id;

    INSERT INTO LOG (RESERVATION_ID, LOG_DATE, STATUS)
    VALUES (v_reservation_id, SYSDATE, 'N');

    -- ustawienie miejsc w trip
    UPDATE trip
    SET no_available_places = no_available_places - 1
    WHERE trip_id = p_trip_id;
END;

select * from trip;
begin
    p_add_reservation_6a(2,1);
end;

-- procedura zmiany statusu
CREATE OR REPLACE PROCEDURE p_modify_reservation_status_6a(
    p_reservation_id INT,
    p_new_status CHAR
) IS
    v_old_status CHAR;
    v_trip_id INT;
BEGIN
    SELECT status, trip_id INTO v_old_status, v_trip_id
    FROM reservation WHERE reservation_id = p_reservation_id;

    -- anulowana -> aktualna
    IF v_old_status = 'C' AND p_new_status IN ('N', 'P') THEN
        UPDATE trip SET no_available_places = no_available_places - 1 WHERE trip_id = v_trip_id;
    -- aktualna -> anulowana
    ELSIF v_old_status IN ('N', 'P') AND p_new_status = 'C' THEN
        UPDATE trip SET no_available_places = no_available_places + 1 WHERE trip_id = v_trip_id;
    END IF;

    UPDATE reservation
    SET status = p_new_status
    WHERE reservation_id = p_reservation_id;
END;


-- Procedura zmiany maksymalnej ilosci wolnych miejsc
CREATE OR REPLACE PROCEDURE p_modify_max_no_places_6a(
    p_trip_id INT,
    p_new_max INT
) IS
    v_taken_places INT;
BEGIN
    SELECT (max_no_places - no_available_places) INTO v_taken_places
    FROM trip
    WHERE trip_id = p_trip_id;

    IF p_new_max < v_taken_places THEN
        RAISE_APPLICATION_ERROR(-20061,
            'Próba zmiany ilości miejsc na mniejszą niż liczba zarezerwowanych.');
    END IF;

    -- aktualizacja + obliczenie nowych miejsc zajetych
    UPDATE trip
    SET max_no_places = p_new_max,
        no_available_places = p_new_max - v_taken_places
    WHERE trip_id = p_trip_id;
END;



-- Zadanie 6b

-- Trigger na zmiane statusu w rezerwacjach
CREATE OR REPLACE TRIGGER trg_manage_places_6b
BEFORE INSERT OR UPDATE OF status ON reservation
FOR EACH ROW
BEGIN
    -- Dodanie rezerwacji
    IF INSERTING THEN
        IF :NEW.status IN ('N', 'P') THEN
            UPDATE trip
            SET no_available_places = no_available_places - 1
            WHERE trip_id = :NEW.trip_id;
        END IF;

    -- Aktualizowanie statsu rezerwacji
    ELSIF UPDATING THEN
        -- aktywna -> anulowana +1 miejsce
        IF :OLD.status IN ('N', 'P') AND :NEW.status = 'C' THEN
            UPDATE trip
            SET no_available_places = no_available_places + 1
            WHERE trip_id = :NEW.trip_id;
        -- anulowana -> aktywna -1 miejsce
        ELSIF :OLD.status = 'C' AND :NEW.status IN ('N', 'P') THEN
            UPDATE trip
            SET no_available_places = no_available_places - 1
            WHERE trip_id = :NEW.trip_id;
        END IF;
    END IF;
END;

CREATE OR REPLACE PROCEDURE p_add_reservation_6b(
    p_trip_id INT,
    p_person_id INT
) IS
    v_available INT;
BEGIN
    SELECT no_available_places INTO v_available
    FROM trip WHERE trip_id = p_trip_id;

    -- wyjątek braku miejsc
    IF v_available <= 0 THEN
        RAISE_APPLICATION_ERROR(-20070, 'Brak miejsc');
    END IF;

    -- Aktualizacja miejsc w trip sama przez trigger
    INSERT INTO reservation (trip_id, person_id, status)
    VALUES (p_trip_id, p_person_id, 'N');
END;

select * from trip;
begin
    p_add_reservation_6b(2,1);
end;


CREATE OR REPLACE PROCEDURE p_modify_reservation_status_6b(
    p_reservation_id INT,
    p_status CHAR
) IS
BEGIN
    UPDATE reservation
    SET status = p_status
    WHERE reservation_id = p_reservation_id;
END;


select * from trip;
select * from reservation;

begin
    p_modify_reservation_status_6b(4,'P');
end;