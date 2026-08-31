-- PostgreSQL checks non-deferrable UNIQUE constraints per row during bulk
-- position shifts. Defer until commit so increment/compact updates are safe.
ALTER TABLE board_placement
    DROP CONSTRAINT uc_user_status_position;

ALTER TABLE board_placement
    ADD CONSTRAINT uc_user_status_position
        UNIQUE (user_id, status, position)
        DEFERRABLE INITIALLY DEFERRED;
