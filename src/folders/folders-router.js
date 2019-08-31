'use strict';

const path = require( 'path' );
const express = require( 'express' );
const xss = require( 'xss' );
const foldersService = require( './folders-service' );

const foldersRouter = express.Router();
const jsonParser = express.json();

const serializeFolder = folders => ({
    id: folders.id,
    title: xss(folders.title),
});

foldersRouter
    .route( '/folders' )
    .get(( req, res, next ) => {
        const knexInstance = req.app.get( 'db' );
        foldersService.getAll( knexInstance )
            .then( folders => {
                res.json( folders.map( serializeFolder ));
            })
            .catch( next );
    })
    .post(jsonParser, ( req, res, next ) => {
        const { title } = req.body;
        const newFolder = { title };

        for (const [ key, value ] of Object.entries( newFolder )) {
            if ( value == null ) {
                return res.status( 400 ).json({
                    error: { message: `Missing '${ key }' in request body` }
                });
            }
        }

        foldersService.insert(
            req.app.get( 'db' ),
            newFolder
        )
            .then( folder => {
                res
                    .status(201)
                    .location( path.posix.join( req.originalUrl, `/${ folder.id }` ))
                    .json( serializeFolder( folder ));
            })
            .catch( next );
    });

foldersRouter
    .route( '/folders/:folderId' )

    .all(( req, res, next ) => {
        foldersService.getById(
            req.app.get( 'db' ),
            req.params.folderId
        )
            .then( folder => {
                if ( !folder ) {
                    return res
                        .status( 404 )
                        .json({
                            error: { message: `Folder doesn't exist` } // eslint-disable-line quotes
                        });
                }
                res.folder = folder;
                next();
            })
            .catch( next );
    })

    .get(( req, res, next ) => { // eslint-disable-line no-unused-vars
        res.json( serializeFolder( res.folder ));
    })

    .delete(( req, res, next ) => {
        foldersService.delete(
            req.app.get( 'db' ),
            req.params.folderId
        )
            .then(numRowsAffected => { // eslint-disable-line no-unused-vars
                res.status( 204 ).end();
            })
            .catch( next );
    })

    .patch(jsonParser, ( req, res, next ) => {
        const { title } = req.body;
        const folderToUpdate = { title };

        const numberOfValues = Object.values( folderToUpdate ).filter( Boolean ).length;
        if ( numberOfValues === 0  )
            return res
                .status( 400 )
                .json({
                    error: {
                        message: `Request body must contain the folder's new 'title'` // eslint-disable-line quotes
                    }
                });

        foldersService.update(
            req.app.get( 'db' ),
            req.params.folderId,
            folderToUpdate
        )
            .then( numRowsAffected => { // eslint-disable-line no-unused-vars
                res
                    .status( 204 )
                    .end();
            })
            .catch( next );
    });


module.exports = foldersRouter;