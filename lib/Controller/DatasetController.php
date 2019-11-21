<?php
/**
 * Data Analytics
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the LICENSE.md file.
 *
 * @author Marcel Scherello <audioplayer@scherello.de>
 * @copyright 2019 Marcel Scherello
 */

namespace OCA\Analytics\Controller;

use OCA\Analytics\Service\DatasetService;
use OCP\AppFramework\Controller;
use OCP\AppFramework\Http\DataResponse;
use OCP\AppFramework\Http\JSONResponse;
use OCP\ILogger;
use OCP\IRequest;


class DatasetController extends Controller
{
    private $logger;
    private $DatasetService;
    private $ShareController;

    public function __construct(
        $appName,
        IRequest $request,
        ILogger $logger,
        ShareController $ShareController,
        DatasetService $DatasetService
    )
    {
        parent::__construct($appName, $request);
        $this->logger = $logger;
        $this->DatasetService = $DatasetService;
        $this->ShareController = $ShareController;
    }

    /**
     * get all datasets
     * @NoAdminRequired
     */
    public function index()
    {
        $ownDatasets = $this->DatasetService->index();
        $sharedDatasets = $this->ShareController->getSharedDatasets();
        $ownDatasets = array_merge($ownDatasets, $sharedDatasets);
        return new JSONResponse($ownDatasets);
    }

    /**
     * get own dataset details
     * @NoAdminRequired
     * @param int $datasetId
     * @return DataResponse
     */
    public function read(int $datasetId)
    {
        return new DataResponse($this->DatasetService->getOwnDataset($datasetId));
    }

    /**
     * create new datasets
     * @NoAdminRequired
     * @return bool
     */
    public function create()
    {
        return $this->DatasetService->create();
    }

    /**
     * get dataset details
     * @NoAdminRequired
     * @param int $datasetId
     * @return bool
     */
    public function delete(int $datasetId)
    {
        return $this->DatasetService->delete($datasetId);
    }

    /**
     * get dataset details
     * @NoAdminRequired
     * @param int $datasetId
     * @return bool
     */
    public function update(int $datasetId, $name, $parent, $type, $link, $visualization, $chart, $dimension1, $dimension2, $dimension3)
    {
        return $this->DatasetService->update($datasetId, $name, $parent, $type, $link, $visualization, $chart, $dimension1, $dimension2, $dimension3);
    }

}