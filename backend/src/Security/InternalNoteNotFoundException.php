<?php

/*
 * Ce fichier declare l'exception InternalNoteNotFoundException du backend GarageFlow.
 * Il existe pour masquer les notes internes qui n'appartiennent pas a l'intervention du garage connecte.
 * Il communique avec InternalNoteService et le controleur garage pour retourner une erreur HTTP 404.
 */

namespace App\Security;

use RuntimeException;

/** Cette exception indique qu'une note interne est introuvable dans l'intervention autorisee. */
class InternalNoteNotFoundException extends RuntimeException
{
}