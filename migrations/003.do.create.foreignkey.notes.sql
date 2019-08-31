ALTER TABLE notes
    ADD COLUMN
        folderid INTEGER REFERENCES folders(id)
        ON DELETE SET NULL;