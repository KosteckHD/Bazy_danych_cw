# Oracle PL/Sql

widoki, funkcje, procedury, triggery

ćwiczenie 2

(kontynuacja ćwiczenia 1)

---

Imiona i nazwiska autorów : Michał Kościanek, Michał Mąka

---

<style>
  {
    font-size: 16pt;
  }
</style>

<style scoped>
 li, p {
    font-size: 14pt;
  }
</style>

<style scoped>
 pre {
    font-size: 10pt;
  }
</style>

# Zadanie 6

Zmiana struktury bazy danych. W tabeli `trip` należy dodać redundantne pole `no_available_places`. Dodanie redundantnego pola uprości kontrolę dostępnych miejsc (sprawdzenie liczby dostępnych miejsc), ale nieco skomplikuje procedury dodawania rezerwacji, zmiany statusu czy też zmiany maksymalnej liczby miejsc na wycieczki (potrzebna będzie dodatkowa aktualizacja w tabeli `trip`).

Należy przygotować polecenie/procedurę przeliczającą wartość pola `no_available_places` dla wszystkich wycieczek (do jednorazowego wykonania)

Obsługę pola `no_available_places` można zrealizować przy pomocy procedur lub triggerów

Należy zwrócić uwagę na spójność rozwiązania.

> UWAGA
> Należy stworzyć nowe wersje tych widoków/procedur/triggerów (np. dodając do nazwy dopisek 6 - od numeru zadania). Poprzednie wersje procedur należy pozostawić w celu umożliwienia weryfikacji ich poprawności.

- zmiana struktury tabeli

```sql
alter table trip add
    no_available_places int null
```

- polecenie przeliczające wartość `no_available_places`
  - należy wykonać operację "przeliczenia" liczby wolnych miejsc i aktualizacji pola `no_available_places`

# Zadanie 6 - rozwiązanie

## wykonał: Michał Mąka | review: Michał Kościanek

```sql

CREATE OR REPLACE PROCEDURE p_calc_avaliable_places AS
BEGIN
    -- przeliczamy wolne miejsca dla każdej wycieczki z informacji o rezerwacjach
    UPDATE trip t
    SET t.no_available_places = t.max_no_places - (
        SELECT COUNT(*)
        FROM reservation r
        WHERE r.trip_id = t.trip_id
          AND r.status IN ('N', 'P')
    );
END;


BEGIN
    p_calc_avaliable_places;
END;

```

---

# Zadanie 6a - procedury

Obsługę pola `no_available_places` należy zrealizować przy pomocy procedur

- procedura dodająca rezerwację powinna aktualizować pole `no_available_places` w tabeli trip
- podobnie procedury odpowiedzialne za zmianę statusu oraz zmianę maksymalnej liczby miejsc na wycieczkę
- należy przygotować procedury oraz jeśli jest to potrzebne, zaktualizować triggery oraz widoki

> UWAGA
> Należy stworzyć nowe wersje tych widoków/procedur/triggerów (np. dodając do nazwy dopisek 6a - od numeru zadania). Poprzednie wersje procedur należy pozostawić w celu umożliwienia weryfikacji ich poprawności.

- może być potrzebne wyłączenie 'poprzednich wersji' triggerów

# Zadanie 6a - rozwiązanie

## wykonał: Michał Mąka | review: Michał Kościanek

```sql

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

```

---

# Zadanie 6b - triggery

Obsługę pola `no_available_places` należy zrealizować przy pomocy triggerów

- podczas dodawania rezerwacji trigger powinien aktualizować pole `no_available_places` w tabeli trip
- podobnie, podczas zmiany statusu rezerwacji
- należy przygotować trigger/triggery oraz jeśli jest to potrzebne, zaktualizować procedury modyfikujące dane oraz widoki

> UWAGA
> Należy stworzyć nowe wersje tych widoków/procedur/triggerów (np. dodając do nazwy dopisek 6b - od numeru zadania). Poprzednie wersje procedur należy pozostawić w celu umożliwienia weryfikacji ich poprawności.

- może być potrzebne wyłączenie 'poprzednich wersji' triggerów

# Zadanie 6b - rozwiązanie

## wykonał: Michał Kościanek | review: Michał Mąka

```sql
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


CREATE OR REPLACE PROCEDURE p_modify_reservation_status_6b(
    p_reservation_id INT,
    p_status CHAR
) IS
BEGIN
    UPDATE reservation
    SET status = p_status
    WHERE reservation_id = p_reservation_id;
END;

```
