<?php

/*
 * Ce fichier declare le controleur GarageExportController du backend GarageFlow.
 * Il existe pour exposer un export CSV/JSON des rendez-vous et interventions du garage connecte,
 * sur une periode donnee -- flux d'echange de donnees avec un logiciel externe (tableur, ERP).
 * Il communique avec GarageExportService, GarageManagementService et Symfony Security.
 */

namespace App\Controller;

use App\DTO\ExportRequest;
use App\Entity\Garage;
use App\Entity\User;
use App\Security\GarageNotFoundException;
use App\Security\InvalidAppointmentRequestException;
use App\Service\GarageExportService;
use App\Service\GarageManagementService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/garage/me/export')]
#[IsGranted('ROLE_EMPLOYE')]
class GarageExportController extends AbstractController
{
    public function __construct(
        private readonly GarageExportService $exportService,
        private readonly GarageManagementService $garageManagementService,
        private readonly ValidatorInterface $validator,
    ) {
    }

    #[Route('/appointments', name: 'api_garage_me_export_appointments', methods: ['GET'])]
    public function appointments(Request $request): Response
    {
        $dto = $this->dtoFromQuery($request);
        $validationResponse = $this->validateDto($dto);
        if ($validationResponse instanceof JsonResponse) {
            return $validationResponse;
        }

        try {
            $rows = $this->exportService->exportAppointments($this->garage(), $dto);
        } catch (InvalidAppointmentRequestException $exception) {
            return $this->json(['message' => $exception->getMessage()], Response::HTTP_BAD_REQUEST);
        } catch (GarageNotFoundException $exception) {
            return $this->json(['message' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        }

        return $this->respond($rows, $dto, 'rendez-vous');
    }

    #[Route('/interventions', name: 'api_garage_me_export_interventions', methods: ['GET'])]
    public function interventions(Request $request): Response
    {
        $dto = $this->dtoFromQuery($request);
        $validationResponse = $this->validateDto($dto);
        if ($validationResponse instanceof JsonResponse) {
            return $validationResponse;
        }

        try {
            $rows = $this->exportService->exportInterventions($this->garage(), $dto);
        } catch (InvalidAppointmentRequestException $exception) {
            return $this->json(['message' => $exception->getMessage()], Response::HTTP_BAD_REQUEST);
        } catch (GarageNotFoundException $exception) {
            return $this->json(['message' => $exception->getMessage()], Response::HTTP_NOT_FOUND);
        }

        return $this->respond($rows, $dto, 'interventions');
    }

    private function dtoFromQuery(Request $request): ExportRequest
    {
        $dto = new ExportRequest();
        $dto->from = $request->query->get('from');
        $dto->to = $request->query->get('to');
        $dto->format = $request->query->get('format', 'json');

        return $dto;
    }

    /**
     * @param array<int, array<string, string|int|null>> $rows
     */
    private function respond(array $rows, ExportRequest $dto, string $filenamePrefix): Response
    {
        if ('csv' === $dto->format) {
            return $this->toCsvResponse($rows, sprintf('%s_%s_%s.csv', $filenamePrefix, $dto->from, $dto->to));
        }

        return $this->json(['items' => $rows]);
    }

    /**
     * @param array<int, array<string, string|int|null>> $rows
     */
    private function toCsvResponse(array $rows, string $filename): Response
    {
        $lines = [];
        if ([] !== $rows) {
            $lines[] = implode(';', array_keys($rows[0]));
            foreach ($rows as $row) {
                $lines[] = implode(';', array_map(
                    fn (string|int|null $value): string => str_replace(';', ',', (string) $value),
                    $row
                ));
            }
        }

        $response = new Response(implode("\n", $lines));
        $response->headers->set('Content-Type', 'text/csv; charset=UTF-8');
        $response->headers->set('Content-Disposition', sprintf('attachment; filename="%s"', $filename));

        return $response;
    }

    private function user(): User
    {
        $user = $this->getUser();
        if (!$user instanceof User) {
            throw $this->createAccessDeniedException('Authentification requise.');
        }

        return $user;
    }

    private function garage(): Garage
    {
        return $this->garageManagementService->getGarageForUser($this->user());
    }

    private function validateDto(object $dto): ?JsonResponse
    {
        $errors = $this->validator->validate($dto);
        if (0 === count($errors)) {
            return null;
        }

        $details = [];
        foreach ($errors as $error) {
            $details[$error->getPropertyPath()][] = $error->getMessage();
        }

        return $this->json(['message' => 'Les donnees envoyees sont invalides.', 'errors' => $details], Response::HTTP_BAD_REQUEST);
    }
}
