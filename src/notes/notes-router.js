'use strict';

const path = require( 'path' );
const express = require( 'express' );
const xss = require( 'xss' );
const notesService = require( './notes-service' );

const notesRouter = express.Router();
const jsonParser = express.json();

const serializeNotes = notes => ({
    id: notes.id,
    title: xss(notes.title),
    content: xss(notes.content),
    modified: xss(notes.modified),
    folderid: xss(notes.folderid)
});

notesRouter
    .route( '/notes' )
    .get(( req, res, next ) => {
        const knexInstance = req.app.get( 'db' );
        notesService.getAll( knexInstance )
            .then( notes => {
                res.json( notes.map( serializeNotes ));
            })
            .catch( next );
    })
    .post(jsonParser, ( req, res, next ) => {

        const { title, content, modified, folderid } = req.body;

        const newNote = { title, content, modified, folderid };

        for (const [ key, value ] of Object.entries( newNote )) {
            if ( value === null ) {
                return res
                    .status( 400 )
                    .json({
                        error: { message: `Missing '${ key }' in request body` }
                    });
            }
        }

        notesService.insert(
            req.app.get( 'db' ),
            newNote
        )
            .then( note => {
                res
                    .status( 201 )
                    .location( path.posix.join( req.originalUrl, `/${ note.id }` ))
                    .json( serializeNotes( note ));
            })
            .catch( next );
    });

notesRouter
    .route( '/notes/:noteId' )

    .all(( req, res, next ) => {
        notesService.getById(
            req.app.get( 'db' ),
            req.params.noteId
        )
            .then( note => {
                if ( !note ) {
                    return res
                        .status( 404 )
                        .json({
                            error: { message: `note doesn't exist` } // eslint-disable-line quotes
                        });
                }
                res.note = note;
                next();
            })
            .catch( next );
    })

    .get(( req, res, next ) => { // eslint-disable-line no-unused-vars
        res.json( serializeNotes( res.note ));
    })

    .delete(( req, res, next ) => {
        notesService.delete(
            req.app.get( 'db' ),
            req.params.noteId
        )
            .then(numRowsAffected => { // eslint-disable-line no-unused-vars
                res.status( 204 ).end();
            })
            .catch( next );
    })

    .patch(jsonParser, ( req, res, next ) => {

        const { title, content, modified } = req.body;
        
        const noteToUpdate = { title, content, modified };

        const numberOfValues = Object.values( noteToUpdate ).filter( Boolean ).length;
        
        if ( numberOfValues === 0  )
            return res
                .status( 400 )
                .json({
                    error: {
                        message: `Request body must contain either 'title', 'content', or 'modified` // eslint-disable-line quotes
                    }
                });

        notesService.update(
            req.app.get( 'db' ),
            req.params.noteId,
            noteToUpdate
        )
            .then( numRowsAffected => { // eslint-disable-line no-unused-vars
                res
                    .status( 204 )
                    .end();
            })
            .catch( next );
    });

module.exports = notesRouter;