<?php
/**
 * Analytics
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the LICENSE.md file.
 *
 * @author Marcel Scherello <analytics@scherello.de>
 * @copyright 2021 Marcel Scherello
 */

namespace OCA\Analytics\Controller;

use OCA\Analytics\Db\StorageMapper;
use OCA\Analytics\Service\ThresholdService;
use OCP\AppFramework\Controller;
use OCP\ILogger;
use OCP\IRequest;

class StorageController extends Controller
{
    private $logger;
    private $StorageMapper;
    private $ThresholdService;

    public function __construct(
        string $AppName,
        IRequest $request,
        ILogger $logger,
        StorageMapper $StorageMapper,
        ThresholdService $ThresholdService
    )
    {
        parent::__construct($AppName, $request);
        $this->logger = $logger;
        $this->StorageMapper = $StorageMapper;
        $this->ThresholdService = $ThresholdService;
    }

    /**
     * Get the items for the selected category
     *
     * @NoAdminRequired
     * @param $datasetMetadata
     * @return array
     */
    public function read($datasetMetadata)
    {
        $availableDimensions = array();
        $header = array();

        // output the dimensions available for filtering of this datasource
        // this needs to map the technical name to its displayname in the report
        $availableDimensions['dimension1'] = $datasetMetadata['dimension1'];
        $availableDimensions['dimension2'] = $datasetMetadata['dimension2'];

        // return the header texts of the data being transferred according to the current drilldown state selected by user
        $options = json_decode($datasetMetadata['filteroptions'], true);
        if (!isset($options['drilldown']['dimension1'])) $header[0] = $datasetMetadata['dimension1'];
        if (!isset($options['drilldown']['dimension2'])) $header[1] = $datasetMetadata['dimension2'];
        $header[6] = $datasetMetadata['value'];
        $header = array_values($header);

        $data = $this->StorageMapper->read($datasetMetadata['id'], $options);
        $data = array_values($data);
        foreach ($data as $key => $value) {
            $data[$key] = array_values($value);
        }

        return empty($data) ? [
            'dimensions' => $availableDimensions,
            'status' => 'nodata',
            'error' => 0
        ] : [
            'header' => $header,
            'dimensions' => $availableDimensions,
            'data' => $data,
            'error' => 0
        ];
    }

    /**
     * Get the items for the selected category
     *
     * @NoAdminRequired
     * @param int $datasetId
     * @param $dimension1
     * @param $dimension2
     * @param $value
     * @param string|null $user_id
     * @param null $bulkInsert
     * @return array
     * @throws \Exception
     */
    public function update(int $datasetId, $dimension1, $dimension2, $value, string $user_id = null, $bulkInsert = null)
    {
        TODO:
        //dates in both columns
        $dimension2 = $this->convertGermanDateFormat($dimension2);
        //convert date into timestamp
        //$timestamp = $this->convertGermanDateFormat($timestamp);
        $value = $this->floatvalue($value);
        $validate = '';
        $insert = $update = $error = $action = 0;

        if ($value !== false) {
            try {
                $action = $this->StorageMapper->create($datasetId, $dimension1, $dimension2, $value, $user_id, null, $bulkInsert);
            } catch (\Exception $e) {
                $error = 1;
            }
            if ($action === 'insert') $insert = 1;
            elseif ($action === 'update') $update = 1;
        } else {
            $error = 1;
        }

        if ($error === 0) $validate = $this->ThresholdService->validate($datasetId, $dimension1, $dimension2, $value);

        return [
            'insert' => $insert,
            'update' => $update,
            'error' => $error,
            'validate' => $validate
        ];
    }

    /**
     * delete data
     *
     * @NoAdminRequired
     * @param int $datasetId
     * @param $dimension1
     * @param $dimension2
     * @return bool
     */
    public function delete(int $datasetId, $dimension1, $dimension2)
    {
        return $this->StorageMapper->delete($datasetId, $dimension1, $dimension2);
    }

    /**
     * Simulate delete data
     *
     * @NoAdminRequired
     * @param int $datasetId
     * @param $dimension1
     * @param $dimension2
     * @return array
     */
    public function deleteSimulate(int $datasetId, $dimension1, $dimension2)
    {
        return $this->StorageMapper->deleteSimulate($datasetId, $dimension1, $dimension2);
    }

    private function floatvalue($val)
    {
        $val = str_replace(",", ".", $val);
        $val = preg_replace('/\.(?=.*\.)/', '', $val);
        $val = preg_replace('/[^0-9-.]+/', '', $val);
        if (is_numeric($val)) {
            return number_format(floatval($val), 2, '.', '');
        } else {
            return false;
        }
    }

    private function convertGermanDateFormat($val)
    {
        $fullString = explode(' ', $val);
        $dateLength = strlen($fullString[0]);
        $dateParts = explode('.', $fullString[0]);

        if ($dateLength >= 6 && $dateLength <= 10 && count($dateParts) === 3) {
            // is most likely a german date format 20.02.2020
            $fullString[0] = $dateParts[2] . '-' . sprintf('%02d', $dateParts[1]) . '-' . sprintf('%02d', $dateParts[0]);
            $val = implode(' ', $fullString);
        }
        return $val;
    }
}