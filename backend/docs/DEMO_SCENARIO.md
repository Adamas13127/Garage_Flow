<!--
Ce fichier decrit un scenario oral de demonstration du backend GarageFlow.
Il existe pour guider une presentation jury du MVP sans inventer de fonctionnalite hors scope.
Il communique indirectement avec les endpoints API et les roles de securite Symfony.
-->

# Scenario de demonstration MVP

Base locale : `http://127.0.0.1:8000`

1. Creer ou utiliser un client
   - Endpoint : `POST /api/auth/register/client`, puis `POST /api/auth/login`
   - Role : public puis `ROLE_CLIENT`
   - Resultat attendu : un token JWT client est obtenu.

2. Creer ou utiliser un garage de demonstration
   - Endpoint : commande `php bin/console app:create-demo-garage`
   - Role : developpement local
   - Resultat attendu : un garage actif et un gerant sont disponibles.

3. Le client ajoute un vehicule
   - Endpoint : `POST /api/client/vehicles`
   - Role : `ROLE_CLIENT`
   - Resultat attendu : le vehicule est cree avec un id.

4. Le client consulte les garages
   - Endpoint : `GET /api/garages`
   - Role : public
   - Resultat attendu : les garages actifs sont visibles.

5. Le client choisit une prestation et un creneau
   - Endpoints : `GET /api/garages/{id}/services`, `GET /api/garages/{id}/available-slots`
   - Role : public
   - Resultat attendu : une prestation active et un creneau disponible sont choisis.

6. Le client cree une demande de rendez-vous
   - Endpoint : `POST /api/client/appointments`
   - Role : `ROLE_CLIENT`
   - Resultat attendu : un rendez-vous `EN_ATTENTE` est cree.

7. Le garage voit la demande
   - Endpoint : `GET /api/garage/me/appointments?statut=EN_ATTENTE`
   - Role : `ROLE_GERANT` ou `ROLE_EMPLOYE`
   - Resultat attendu : la demande apparait dans le planning garage.

8. Le garage accepte le rendez-vous
   - Endpoint : `PATCH /api/garage/me/appointments/{id}/accept`
   - Role : `ROLE_GERANT` ou `ROLE_EMPLOYE`
   - Resultat attendu : le rendez-vous passe `CONFIRME`.

9. Une intervention est creee automatiquement
   - Endpoint : reponse de l'acceptation ou `GET /api/garage/me/interventions`
   - Role : `ROLE_GERANT` ou `ROLE_EMPLOYE`
   - Resultat attendu : une intervention existe avec le statut initial `VEHICULE_DEPOSE`.

10. Le garage change le statut de l'intervention
    - Endpoint : `PATCH /api/garage/me/interventions/{id}/status`
    - Role : `ROLE_GERANT` ou `ROLE_EMPLOYE`
    - Resultat attendu : l'historique contient une nouvelle ligne.

11. Le client consulte l'avancement
    - Endpoint : `GET /api/client/interventions/{id}`
    - Role : `ROLE_CLIENT`
    - Resultat attendu : le client voit le statut et l'historique visible client.

12. Le garage ajoute une note interne
    - Endpoint : `POST /api/garage/me/interventions/{id}/notes`
    - Role : `ROLE_GERANT` ou `ROLE_EMPLOYE`
    - Resultat attendu : la note est visible cote garage.

13. Le client ne voit pas la note interne
    - Endpoint : `GET /api/client/interventions/{id}`
    - Role : `ROLE_CLIENT`
    - Resultat attendu : aucune note interne n'est presente dans la reponse.

14. Le client recoit les notifications
    - Endpoint : `GET /api/notifications`
    - Role : `ROLE_CLIENT`
    - Resultat attendu : les notifications `RDV_ACCEPTE`, `STATUT_INTERVENTION_CHANGE` ou `VEHICULE_PRET` apparaissent selon le parcours.