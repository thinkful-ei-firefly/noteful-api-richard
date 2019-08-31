'use strict';

const dbTable = 'notes';

const NotesService = {
    getAll(knex) {
        return knex
            .select('*')
            .from(dbTable);
    },
    getById(knex, id) {
        return knex
            .from(dbTable)
            .select('*')
            .where('id', id)
            .first();
    },
    insert(knex, newNote) {
        return knex
            .insert(newNote)
            .into(dbTable)
            .returning('*')
            .then(rows => {
                return rows[0];
            });
    },
    update(knex, id, newNoteFields) {
        return knex(dbTable)
            .where({ id })
            .update(newNoteFields);
    },
    delete(knex, id) {
        return knex(dbTable)
            .where({ id })
            .delete();
    },
};



module.exports = NotesService;