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

namespace OCA\Analytics\Datasource;

use OCP\IL10N;
use OCP\ILogger;

class Github implements IDatasource
{
    private $logger;
    private $l10n;

    public function __construct(
        IL10N $l10n,
        ILogger $logger
    )
    {
        $this->l10n = $l10n;
        $this->logger = $logger;
    }

    /**
     * @return string Display Name of the datasource
     */
    public function getName(): string
    {
        return $this->l10n->t('GitHub');
    }

    /**
     * @return int digit unique datasource id
     */
    public function getId(): int
    {
        return 3;
    }

    /**
     * @return array available options of the datasoure
     */
    public function getTemplate(): array
    {
        $template = array();
        array_push($template, ['id' => 'user', 'name' => 'GitHub Username', 'placeholder' => 'GitHub user']);
        array_push($template, ['id' => 'repository', 'name' => 'Repository', 'placeholder' => 'GitHub repository']);
        array_push($template, ['id' => 'limit', 'name' => $this->l10n->t('Limit'), 'placeholder' => $this->l10n->t('Number of rows')]);
        array_push($template, ['id' => 'timestamp', 'name' => $this->l10n->t('Timestamp of dataload'), 'placeholder' => $this->l10n->t('true/false'), 'type' => 'tf']);
        return $template;
    }

    /**
     * Read the Data
     * @param $option
     * @return array available options of the datasoure
     */
    public function readData($option): array
    {
        if (isset($option['link'])) $string = 'https://api.github.com/repos/' . $option['link'] . '/releases';
        else $string = 'https://api.github.com/repos/' . $option['user'] . '/' . $option['repository'] . '/releases';

        $ch = curl_init();
        if ($ch !== false) {
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
            curl_setopt($ch, CURLOPT_HEADER, false);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
            curl_setopt($ch, CURLOPT_URL, $string);
            curl_setopt($ch, CURLOPT_REFERER, $string);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
            curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows; U; Windows NT 5.1; en-US; rv:1.8.1.13) Gecko/20080311 Firefox/2.0.0.13');
            $curlResult = curl_exec($ch);
            curl_close($ch);
        } else {
            $curlResult = '';
        }

        $json = json_decode($curlResult, true);
        $i = 0;
        $data = array();
        foreach ($json as $item) {
            if (isset($option['limit']) and $option['limit'] !== '') {
                if ($i === (int)$option['limit']) break;
            }
            $nc_value = 0;
            foreach ($item['assets'] as $asset) {
                if (substr($asset['name'], -2) === 'gz') $nc_value = $asset['download_count'];
            }
            array_push($data, [$item['tag_name'], $this->floatvalue($nc_value)]);
            $i++;
        }

        $header = array();
        $header[0] = 'Version';
        $header[1] = 'Count';

        usort($data, function ($a, $b) {
            return strnatcmp($a[0], $b[0]);
        });

        return [
            'header' => $header,
            'dimensions' => array_slice($header, 0, count($header) - 1),
            'data' => $data,
            'error' => 0,
        ];
    }

    private function floatvalue($val)
    {
        $val = str_replace(",", ".", $val);
        $val = preg_replace('/\.(?=.*\.)/', '', $val);
        $val = preg_replace('/[^0-9-.]+/', '', $val);
        if (is_numeric($val)) {
            return floatval($val);
        } else {
            return false;
        }
    }
}