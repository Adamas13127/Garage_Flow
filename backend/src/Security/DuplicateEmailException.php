<?php

/*
 * Ce fichier declare l'exception DuplicateEmailException du backend GarageFlow.
 * Il existe pour signaler proprement qu'un email est deja utilise pendant l'inscription.
 * Il communique avec AuthService et AuthController afin de retourner une erreur HTTP 409.
 */

namespace App\Security;

use RuntimeException;

/**
 * Cette exception indique qu'un compte existe deja avec l'email demande.
 */
class DuplicateEmailException extends RuntimeException
{
}