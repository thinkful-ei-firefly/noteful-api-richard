'use strict';

const dbTable = 'folders';

const FoldersService = {
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
    insert(knex, newFolder) {
        return knex
            .insert(newFolder)
            .into(dbTable)
            .returning('*')
            .then(rows => {
                return rows[0];
            });
    },
    update(knex, id, newFolderFields) {
        return knex(dbTable)
            .where({ id })
            .update(newFolderFields);
    },
    delete(knex, id) {
        return knex(dbTable)
            .where({ id })
            .delete();
    },
};

module.exports = FoldersService;