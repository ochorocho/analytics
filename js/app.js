/**
 * Analytics
 *
 * This file is licensed under the Affero General Public License version 3 or
 * later. See the LICENSE.md file.
 *
 * @author Marcel Scherello <analytics@scherello.de>
 * @copyright 2021 Marcel Scherello
 */
/** global: OCA */
/** global: OCP */
/** global: OC */
/** global: table */
/** global: Chart */
/** global: cloner */
/** global: _ */

'use strict';

if (!OCA.Analytics) {
    /**
     * @namespace
     */
    OCA.Analytics = {
        TYPE_EMPTY_GROUP: 0,
        TYPE_INTERNAL_FILE: 1,
        TYPE_INTERNAL_DB: 2,
        TYPE_GIT: 3,
        TYPE_EXTERNAL_FILE: 4,
        TYPE_EXTERNAL_REGEX: 5,
        TYPE_EXCEL: 7,
        TYPE_SHARED: 99,
        SHARE_TYPE_USER: 0,
        SHARE_TYPE_GROUP: 1,
        SHARE_TYPE_LINK: 3,
        SHARE_TYPE_ROOM: 10,
        initialDocumentTitle: null,
        currentReportData: {},
        chartObject: null,
        // flexible mapping depending on type requiered by the used chart library
        chartTypeMapping: {
            'datetime': 'line',
            'column': 'bar',
            'area': 'line',
            'line': 'line',
            'doughnut': 'doughnut'
        },
        datasources: [],
        datasourceOptions: [],
        datasets: [],
        unsavedFilters: null,
    };
}
/**
 * @namespace OCA.Analytics.Core
 */
OCA.Analytics.Core = {
    initApplication: function () {
        OCA.Analytics.Backend.getDatasourceDefinitions();

        const urlHash = decodeURI(location.hash);
        if (urlHash.length > 1) {
            if (urlHash[2] === 'f') {
                window.location.href = '#';
                OCA.Analytics.Navigation.createDataset(urlHash.substring(3));
            } else if (urlHash[2] === 'r') {
                OCA.Analytics.Navigation.init(urlHash.substring(4));
            }
        } else {
            OCA.Analytics.Navigation.init();
        }
    },

    getDistinctValues: function (array) {
        let unique = [];
        let distinct = [];
        if (array === undefined) {
            return distinct;
        }
        for (let i = 0; i < array.length; i++) {
            if (!unique[array[i][0]]) {
                distinct.push(array[i][0]);
                unique[array[i][0]] = 1;
            }
        }
        return distinct;
    },
};

OCA.Analytics.UI = {

    buildDataTable: function (jsondata) {
        OCA.Analytics.UI.showElement('tableContainer');

        let columns = [];
        let data, unit = '';

        let header = jsondata.header;
        let allDimensions = jsondata.dimensions;
        (jsondata.dimensions) ? allDimensions = jsondata.dimensions : allDimensions = jsondata.header;
        let headerKeys = Object.keys(header);
        for (let i = 0; i < headerKeys.length; i++) {
            columns[i] = {'title': header[headerKeys[i]]};
            let columnType = Object.keys(allDimensions).find(key => allDimensions[key] === header[headerKeys[i]]);

            if (i === headerKeys.length - 1) {
                // prepare for later unit cloumn
                //columns[i]['render'] = function(data, type, row, meta) {
                //    return data + ' ' + row[row.length-2];
                //};
                if (header[headerKeys[i]].length === 1) {
                    unit = header[headerKeys[i]];
                }
                columns[i]['render'] = $.fn.dataTable.render.number('.', ',', 2, unit + ' ');
                columns[i]['className'] = 'dt-right';
            } else if (columnType === 'timestamp') {
                columns[i]['render'] = function (data, type, row) {
                    // If display or filter data is requested, format the date
                    if (type === 'display' || type === 'filter') {
                        return new Date(data * 1000).toLocaleString();
                    }
                    // Otherwise the data type requested (`type`) is type detection or
                    // sorting data, for which we want to use the integer, so just return
                    // that, unaltered
                    return data;
                }
            } else if (columnType === 'unit') {
                columns[i]['visible'] = false;
                columns[i]['searchable'] = false;
            }
        }
        data = jsondata.data;

        const language = {
            search: t('analytics', 'Search'),
            lengthMenu: t('analytics', 'Show _MENU_ entries'),
            info: t('analytics', 'Showing _START_ to _END_ of _TOTAL_ entries'),
            infoEmpty: t('analytics', 'Showing 0 to 0 of 0 entries'),
            paginate: {
                first: t('analytics', 'first'),
                previous: t('analytics', 'previous'),
                next: t('analytics', 'next'),
                last: t('analytics', 'last')
            },
        };

        $('#tableContainer').DataTable({
            data: data,
            columns: columns,
            language: language,
            rowCallback: function (row, data, index) {
                OCA.Analytics.UI.dataTableRowCallback(row, data, index, jsondata.thresholds)
            },
            drawCallback: function (settings) {
                var pagination = $(this).closest('.dataTables_wrapper').find('.dataTables_paginate');
                pagination.toggle(this.api().page.info().pages > 1);
                var info = $(this).closest('.dataTables_wrapper').find('.dataTables_info');
                info.toggle(this.api().page.info().pages > 1);
                var length = $(this).closest('.dataTables_wrapper').find('.dataTables_length');
                length.toggle(this.api().page.info().pages > 1);
                var filter = $(this).closest('.dataTables_wrapper').find('.dataTables_filter');
                filter.toggle(this.api().page.info().pages > 1);
            },
        });
    },

    dataTableRowCallback: function (row, data, index, thresholds) {
        const operators = {
            '=': function (a, b) {
                return a === b
            },
            '<': function (a, b) {
                return a < b
            },
            '>': function (a, b) {
                return a > b
            },
            '<=': function (a, b) {
                return a <= b
            },
            '>=': function (a, b) {
                return a >= b
            },
            '!=': function (a, b) {
                return a !== b
            },
        };

        thresholds = thresholds.filter(p => p.dimension1 === data[0] || p.dimension1 === '*');

        for (let threshold of thresholds) {
            const comparison = operators[threshold['option']](parseFloat(data[2]), parseFloat(threshold['value']));
            threshold['severity'] = parseInt(threshold['severity']);
            if (comparison === true) {
                if (threshold['severity'] === 2) {
                    $(row).find('td:eq(2)').css('color', 'red');
                } else if (threshold['severity'] === 3) {
                    $(row).find('td:eq(2)').css('color', 'orange');
                } else if (threshold['severity'] === 4) {
                    $(row).find('td:eq(2)').css('color', 'green');
                }
            }
        }
    },

    buildChart: function (jsondata) {

        OCA.Analytics.UI.showElement('tableSeparatorContainer');
        OCA.Analytics.UI.showElement('chartContainer');
        let ctx = document.getElementById('myChart').getContext('2d');

        let chartType;
        jsondata.options.chart === '' ? chartType = 'column' : chartType = jsondata.options.chart;
        let datasets = [], xAxisCategories = [];
        let lastObject = false;
        let dataSeries = -1;
        let hidden = false;

        let header = jsondata.header;
        let headerKeys = Object.keys(header).length;
        let dataSeriesColumn = headerKeys - 3; //characteristic is taken from the second last column
        let characteristicColumn = headerKeys - 2; //characteristic is taken from the second last column
        let keyFigureColumn = headerKeys - 1; //key figures is taken from the last column

        Chart.defaults.elements.line.borderWidth = 2;
        Chart.defaults.elements.line.tension = 0.1;
        Chart.defaults.elements.line.fill = false;
        Chart.defaults.elements.point.radius = 1;
        Chart.defaults.plugins.legend.display = false;
        Chart.defaults.plugins.legend.position = 'bottom';

        var chartOptions = {
            maintainAspectRatio: false,
            responsive: true,
            scales: {
                'primary': {
                    type: 'linear',
                    stacked: false,
                    position: 'left',
                    display: true,
                    grid: {
                        display: true,
                    },
                    ticks: {
                        callback: function (value) {
                            return value.toLocaleString();
                        },
                    },
                },
                'secondary': {
                    type: 'linear',
                    stacked: false,
                    position: 'right',
                    display: false,
                    grid: {
                        display: false,
                    },
                    ticks: {
                        callback: function (value) {
                            return value.toLocaleString();
                        },
                    },
                },
                'xAxes': {
                    type: 'category',
                    time: {
                        parser: 'YYYY-MM-DD HH:mm',
                        tooltipFormat: 'LL',
                    },
                    distribution: 'linear',
                    grid: {
                        display: false
                    },
                    display: true,
                },
            },
            animation: {
                duration: 0 // general animation time
            },

            tooltips: {
                callbacks: {
                    label: function (tooltipItem, data) {
//                        let datasetLabel = data.datasets[tooltipItem.datasetIndex].label || '';
                        let datasetLabel = data.datasets[tooltipItem.datasetIndex].label || data.labels[tooltipItem.index];
                        if (tooltipItem.yLabel !== '') {
                            return datasetLabel + ': ' + parseFloat(tooltipItem.yLabel).toLocaleString();
                        } else {
                            return datasetLabel;
                        }
                    }
                }
            },
        };

        for (let values of jsondata.data) {
            if (dataSeriesColumn >= 0 && lastObject !== values[dataSeriesColumn]) {
                // create new dataseries for every new lable in dataSeriesColumn
                datasets.push({label: values[dataSeriesColumn], data: [], hidden: hidden});
                dataSeries++;
                // default hide > 4th series for better visibility
                if (dataSeries === 3) {
                    hidden = true;
                }
                lastObject = values[dataSeriesColumn];
            } else if (lastObject === false) {
                // when only 2 columns are provided, no label will be set
                datasets.push({label: '', data: [], hidden: hidden});
                dataSeries++;
                lastObject = true;
            }

            if (chartType === 'datetime' || chartType === 'area') {
                datasets[dataSeries]['data'].push({
                    y: parseFloat(values[keyFigureColumn]),
                    x: values[characteristicColumn]

                });
            } else {
                datasets[dataSeries]['data'].push(parseFloat(values[keyFigureColumn]));
                if (dataSeries === 0) {
                    // Add category lables only once and not for every data series.
                    // They have to be unique anyway
                    xAxisCategories.push(values[characteristicColumn]);
                }
            }
        }

        if (datasets.length > 1) {
            // show legend button only when usefull with >1 dataset
            OCA.Analytics.UI.showElement('chartLegendContainer');
        }

        // do the color magic
        // a predefined color array is used
        let colors = ["#aec7e8", "#ffbb78", "#98df8a", "#ff9896", "#c5b0d5", "#c49c94", "#f7b6d2", "#c7c7c7", "#dbdb8d", "#9edae5"];
        for (let i = 0; i < datasets.length; ++i) {
            let j = i - (Math.floor(i / colors.length) * colors.length)

            // in only one dataset is being shown, create a fancy gadient fill
            if (datasets.length === 1 && chartType !== 'column' && chartType !== 'doughnut') {
                const hexToRgb = colors[j].replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
                    , (m, r, g, b) => '#' + r + r + g + g + b + b)
                    .substring(1).match(/.{2}/g)
                    .map(x => parseInt(x, 16));

                datasets[0].backgroundColor = function (context) {
                    const chart = context.chart;
                    const {ctx, chartArea} = chart;
                    let gradient = ctx.createLinearGradient(0, 0, 0, chart.height);
                    gradient.addColorStop(0, 'rgb(' + hexToRgb[0] + ',' + hexToRgb[1] + ',' + hexToRgb[2] + ')');
                    gradient.addColorStop(1, 'rgb(' + hexToRgb[0] + ',' + hexToRgb[1] + ',' + hexToRgb[2] + ',0)');
                    return gradient;
                }
                datasets[i].borderColor = colors[j];
                Chart.defaults.elements.line.fill = true;
            } else if (chartType === 'doughnut') {
                // special array handling for dougnuts
                datasets[i].backgroundColor = colors;
                datasets[i].borderColor = colors;
                Chart.defaults.elements.line.fill = false;
            } else {
                datasets[i].backgroundColor = colors[j];
                Chart.defaults.elements.line.fill = false;
                datasets[i].borderColor = colors[j];
            }
        }

        if (chartType === 'datetime') {
            chartOptions.scales['xAxes'].type = 'time';
            chartOptions.scales['xAxes'].distribution = 'linear';
        } else if (chartType === 'area') {
            chartOptions.scales['xAxes'].type = 'time';
            chartOptions.scales['xAxes'].distribution = 'linear';
            chartOptions.scales['primary'].stacked = true;
            Chart.defaults.elements.line.fill = true;
        } else if (chartType === 'doughnut') {
            chartOptions.scales['xAxes'].display = false;
            chartOptions.scales['primary'].display = false;
            chartOptions.scales['primary'].grid.display = false;
            chartOptions.scales['secondary'].display = false;
            chartOptions.scales['secondary'].grid.display = false;
            chartOptions.circumference = 180;
            chartOptions.rotation = -90;
            Chart.defaults.plugins.legend.display = true;
        }

        // the user can add/overwrite chart options
        // the user can put the options in array-format into the report definition
        // these are merged with the standard report settings
        // e.g. the display unit for the x-axis can be overwritten '{"scales": {"xAxes": [{"time": {"unit" : "month"}}]}}'
        // e.g. add a secondary y-axis '{"scales": {"yAxes": [{},{"id":"B","position":"right"}]}}'

        // replace old settings from Chart.js 2
        // {"scales":{"yAxes":[{},{"display":true}]}} => {"scales":{"secondary":{"display":true}}}
        jsondata.options.chartoptions = jsondata.options.chartoptions.replace('{"yAxes":[{},{"display":true}]}', '{"secondary":{"display":true}}');
        OCA.Analytics.currentReportData.options.chartoptions = jsondata.options.chartoptions;
        let userChartOptions = jsondata.options.chartoptions;
        if (userChartOptions !== '' && userChartOptions !== null) {
            chartOptions = cloner.deep.merge(chartOptions, JSON.parse(userChartOptions));
        }

        // the user can modify dataset/series settings
        // these are merged with the data array coming from the backend
        // e.g. assign one series to the secondary y-axis: '[{"yAxisID":"B"},{},{"yAxisID":"B"},{}]'
        //let userDatasetOptions = document.getElementById('userDatasetOptions').value;
        let userDatasetOptions = jsondata.options.dataoptions;
        if (userDatasetOptions !== '' && userDatasetOptions !== null) {
            datasets = cloner.deep.merge(JSON.parse(userDatasetOptions), datasets);
        }

        OCA.Analytics.chartObject = new Chart(ctx, {
            type: OCA.Analytics.chartTypeMapping[chartType],
            data: {
                labels: xAxisCategories,
                datasets: datasets
            },
            options: chartOptions,
        });
    },

    toggleChartLegend: function () {
        OCA.Analytics.chartObject.legend.options.display = !OCA.Analytics.chartObject.legend.options.display
        OCA.Analytics.chartObject.update();
    },

    downloadChart: function () {
        OCA.Analytics.UI.hideReportMenu();
        document.getElementById('downlaodChartLink').href = OCA.Analytics.chartObject.toBase64Image();
        document.getElementById('downlaodChartLink').setAttribute('download', OCA.Analytics.currentReportData.options.name + '.png');
        document.getElementById('downlaodChartLink').click();
    },

    resetContentArea: function () {
        if (document.getElementById('advanced').value === 'true') {
            OCA.Analytics.UI.showElement('analytics-intro');
            document.getElementById('app-sidebar').classList.add('disappear');
        } else {
            if ($.fn.dataTable.isDataTable('#tableContainer')) {
                $('#tableContainer').DataTable().destroy();
            }
            OCA.Analytics.UI.hideElement('chartContainer');
            OCA.Analytics.UI.hideElement('chartLegendContainer');
            document.getElementById('chartContainer').innerHTML = '';
            document.getElementById('chartContainer').innerHTML = '<canvas id="myChart" ></canvas>';
            OCA.Analytics.UI.hideElement('tableContainer');
            OCA.Analytics.UI.hideElement('tableSeparatorContainer');
            document.getElementById('tableContainer').innerHTML = '';
            document.getElementById('reportHeader').innerHTML = '';
            document.getElementById('reportSubHeader').innerHTML = '';
            OCA.Analytics.UI.hideElement('reportSubHeader');
            OCA.Analytics.UI.hideElement('noDataContainer');

            OCA.Analytics.UI.showElement('reportMenuBar');
            OCA.Analytics.UI.hideReportMenu();
            document.getElementById('chartOptionsIcon').disabled = false;
            document.getElementById('analysisIcon').disabled = false;
            document.getElementById('drilldownIcon').disabled = false;
            document.getElementById('downlaodChartIcon').disabled = false;
            document.getElementById('analysisIcon').disabled = false;
        }
    },

    buildReportOptions: function () {
        let currentReport = OCA.Analytics.currentReportData;
        let canUpdate = parseInt(currentReport.options.permissions) === OC.PERMISSION_UPDATE;
        let isInternalShare = currentReport.options.isShare !== undefined;
        let isExternalShare = document.getElementById('sharingToken').value !== '';

        if (isExternalShare) {
            if (canUpdate) {
                OCA.Analytics.UI.hideElement('reportMenuIcon');
                OCA.Analytics.Filter.refreshFilterVisualisation();
            } else {
                //document.getElementById('reportMenuBar').remove();
                OCA.Analytics.UI.hideElement('reportMenuBar');
            }
            return;
        }

        if (!canUpdate) {
            OCA.Analytics.UI.hideElement('reportMenuBar');
        }

        if (isInternalShare) {
            OCA.Analytics.UI.showElement('reportMenuIcon');
        }

        if (parseInt(currentReport.options.type) !== OCA.Analytics.TYPE_INTERNAL_DB) {
            document.getElementById('drilldownIcon').disabled = true;
        }

        if (currentReport.options.chart === 'doughnut') {
            document.getElementById('analysisIcon').disabled = true;
        }

        let visualization = currentReport.options.visualization;
        if (visualization === 'table') {
            document.getElementById('chartOptionsIcon').disabled = true;
            document.getElementById('analysisIcon').disabled = true;
            document.getElementById('downlaodChartIcon').disabled = true;
        }

        OCA.Analytics.Filter.refreshFilterVisualisation();
    },

    notification: function (type, message) {
        if (parseInt(OC.config.versionstring.substr(0, 2)) >= 17) {
            if (type === 'success') {
                OCP.Toast.success(message)
            } else if (type === 'error') {
                OCP.Toast.error(message)
            } else {
                OCP.Toast.info(message)
            }
        } else {
            OC.Notification.showTemporary(message);
        }
    },

    showElement: function (element) {
        if (document.getElementById(element)) {
            document.getElementById(element).hidden = false;
            //document.getElementById(element).style.removeProperty('display');
        }
    },

    hideElement: function (element) {
        if (document.getElementById(element)) {
            document.getElementById(element).hidden = true;
            //document.getElementById(element).style.display = 'none';
        }
    },

    hideReportMenu: function () {
        document.getElementById('reportMenu').classList.remove('open');
    },

    toggleReportMenu: function () {
        document.getElementById('reportMenu').classList.toggle('open');
    },

    showReportMenuAnalysis: function () {
        document.getElementById('reportMenuMain').style.setProperty('display', 'none', 'important');
        document.getElementById('reportMenuAnalysis').style.removeProperty('display');
    },

    showReportMenuMain: function () {
        document.getElementById('reportMenuAnalysis').style.setProperty('display', 'none', 'important');
        document.getElementById('reportMenuMain').style.removeProperty('display');
    },


};

OCA.Analytics.Functions = {

    trend: function () {
        OCA.Analytics.UI.showElement('chartLegendContainer');
        OCA.Analytics.UI.showReportMenuMain();
        OCA.Analytics.UI.hideReportMenu();

        let numberDatasets = OCA.Analytics.chartObject.data.datasets.length;
        let datasetType = 'time';
        for (let y = 0; y < numberDatasets; y++) {
            let dataset = OCA.Analytics.chartObject.data.datasets[y];
            let yValues = [];
            for (let i = 0; i < dataset.data.length; i++) {
                if (typeof (dataset.data[i]) === 'number') {
                    datasetType = 'bar';
                    yValues.push(parseInt(dataset.data[i]));
                } else {
                    yValues.push(parseInt(dataset.data[i]["y"]));
                }
            }
            let xValues = [];
            for (let i = 1; i <= dataset.data.length; i++) {
                xValues.push(i);
            }

            let regression = OCA.Analytics.Functions.regression(xValues, yValues);
            let ylast = ((dataset.data.length) * regression["slope"]) + regression["intercept"];

            let data = [];
            if (datasetType === 'time') {
                data = [
                    {x: dataset.data[0]["x"], y: regression["intercept"]},
                    {x: dataset.data[dataset.data.length - 1]["x"], y: ylast},
                ]
            } else {
                for (let i = 1; i < dataset.data.length + 1; i++) {
                    data.push(((i) * regression["slope"]) + regression["intercept"]);
                }
            }
            let newDataset = {
                label: dataset.label + " Trend",
                backgroundColor: dataset.backgroundColor,
                borderColor: dataset.borderColor,
                borderDash: [5, 5],
                type: 'line',
                yAxisID: dataset.yAxisID,
                data: data
            };
            OCA.Analytics.chartObject.data.datasets.push(newDataset);

        }
        OCA.Analytics.chartObject.update();
    },

    regression: function (x, y) {
        const n = y.length;
        let sx = 0;
        let sy = 0;
        let sxy = 0;
        let sxx = 0;
        let syy = 0;
        for (let i = 0; i < n; i++) {
            sx += x[i];
            sy += y[i];
            sxy += x[i] * y[i];
            sxx += x[i] * x[i];
            syy += y[i] * y[i];
        }
        const mx = sx / n;
        const my = sy / n;
        const yy = n * syy - sy * sy;
        const xx = n * sxx - sx * sx;
        const xy = n * sxy - sx * sy;
        const slope = xy / xx;
        const intercept = my - slope * mx;

        return {slope, intercept};
    }

};

OCA.Analytics.Datasource = {
    buildDropdown: function () {
        let options = document.createDocumentFragment();
        let sortedOptions = OCA.Analytics.Datasource.sortOptions(OCA.Analytics.datasources);
        sortedOptions.forEach((entry) => {
            let value = entry[1];
            let option = document.createElement('option');
            option.value = entry[0];
            option.innerText = value;
            options.appendChild(option);
        });
        return options;
    },

    sortOptions: function (obj) {
        var sortable = [];
        for (var key in obj)
            if (obj.hasOwnProperty(key))
                sortable.push([key, obj[key]]);
        sortable.sort(function (a, b) {
            var x = a[1].toLowerCase(),
                y = b[1].toLowerCase();
            return x < y ? -1 : x > y ? 1 : 0;
        });
        return sortable;
    },

    buildOptionsForm: function (datasource) {
        let template = OCA.Analytics.datasourceOptions[datasource];
        let form = document.createDocumentFragment();

        for (let templateOption of template) {
            // loop all options of the datasourcetemplate and create the input form
            let tablerow = document.createElement('div');
            tablerow.style.display = 'table-row';
            let label = document.createElement('div');
            label.style.display = 'table-cell';
            label.style.width = '100%';
            label.innerText = templateOption.name;

            let input;
            if (templateOption.type && templateOption.type === 'tf') {
                input = OCA.Analytics.Datasource.buildOptionsSelect(templateOption);
            } else {
                input = OCA.Analytics.Datasource.buildOptionsInput(templateOption);
            }
            input.style.display = 'table-cell';
            form.appendChild(tablerow);
            tablerow.appendChild(label);
            tablerow.appendChild(input);
        }
        return form;
    },

    buildOptionsInput: function (templateOption) {
        let input = document.createElement('input');
        input.style.display = 'inline-flex';
        input.classList.add('sidebarInput');
        input.placeholder = templateOption.placeholder;
        input.id = templateOption.id;
        return input;
    },

    buildOptionsSelect: function (templateOption) {
        let input = document.createElement('select');
        input.style.display = 'inline-flex';
        input.classList.add('sidebarInput');
        input.id = templateOption.id;

        let selectOptions = templateOption.placeholder.split("/")
        for (let selectOption of selectOptions) {
            let option = document.createElement('option');
            option.value = selectOption;
            option.innerText = selectOption;
            input.appendChild(option);
        }
        return input;
    },

};

OCA.Analytics.Backend = {

    getData: function () {
        OCA.Analytics.UI.resetContentArea();
        OCA.Analytics.UI.hideElement('analytics-intro');
        OCA.Analytics.UI.hideElement('analytics-content');
        OCA.Analytics.UI.hideElement('analytics-loading');

        let url;
        if (document.getElementById('sharingToken').value === '') {
            const datasetId = document.querySelector('#navigationDatasets .active').firstElementChild.dataset.id;
            url = OC.generateUrl('apps/analytics/data/') + datasetId;
        } else {
            const token = document.getElementById('sharingToken').value;
            url = OC.generateUrl('apps/analytics/data/public/') + token;
        }

        // send user current filteroptions to the datarequest;
        // if nothing is changed by the user, the filter which is stored for the report, will be used
        let ajaxData = {};
        if (typeof (OCA.Analytics.currentReportData.options) !== 'undefined' && typeof (OCA.Analytics.currentReportData.options.filteroptions) !== 'undefined') {
            ajaxData.filteroptions = JSON.stringify(OCA.Analytics.currentReportData.options.filteroptions);
        }

        if (typeof (OCA.Analytics.currentReportData.options) !== 'undefined' && typeof (OCA.Analytics.currentReportData.options.dataoptions) !== 'undefined') {
            ajaxData.dataoptions = OCA.Analytics.currentReportData.options.dataoptions;
        }

        if (typeof (OCA.Analytics.currentReportData.options) !== 'undefined' && typeof (OCA.Analytics.currentReportData.options.chartoptions) !== 'undefined') {
            ajaxData.chartoptions = OCA.Analytics.currentReportData.options.chartoptions;
        }

        $.ajax({
            type: 'GET',
            url: url,
            data: ajaxData,
            success: function (data) {
                OCA.Analytics.UI.hideElement('analytics-loading');
                OCA.Analytics.UI.showElement('analytics-content');
                OCA.Analytics.currentReportData = data;
                try {
                    OCA.Analytics.currentReportData.options.filteroptions = JSON.parse(OCA.Analytics.currentReportData.options.filteroptions);
                } catch (e) {
                    OCA.Analytics.currentReportData.options.filteroptions = {};
                }
                if (OCA.Analytics.currentReportData.options.filteroptions === null) {
                    OCA.Analytics.currentReportData.options.filteroptions = {};
                }

                document.getElementById('reportHeader').innerText = data.options.name;
                if (data.options.subheader !== '') {
                    document.getElementById('reportSubHeader').innerText = data.options.subheader;
                    OCA.Analytics.UI.showElement('reportSubHeader');
                }

                document.title = data.options.name + ' @ ' + OCA.Analytics.initialDocumentTitle;
                if (data.status !== 'nodata' && parseInt(data.error) === 0) {
                    data.data = OCA.Analytics.Backend.formatDates(data.data);
                    let visualization = data.options.visualization;
                    if (visualization === 'chart') {
                        OCA.Analytics.UI.buildChart(data);
                    } else if (visualization === 'table') {
                        OCA.Analytics.UI.buildDataTable(data);
                    } else {
                        OCA.Analytics.UI.buildChart(data);
                        OCA.Analytics.UI.buildDataTable(data);
                    }
                } else {
                    OCA.Analytics.UI.showElement('noDataContainer');
                    if (parseInt(data.error) !== 0) {
                        OCA.Analytics.UI.notification('error', data.error);
                    }
                }
                OCA.Analytics.UI.buildReportOptions();
            }
        });
    },

    formatDates: function (data) {
        let firstrow = data[0];
        let now;
        for (let i = 0; i < firstrow.length; i++) {
            // loop columns and check for a valid date
            if (!isNaN(new Date(firstrow[i]).valueOf()) && firstrow[i].length >= 19) {
                // column contains a valid date
                // then loop all rows for this column and convert to local time
                for (let j = 0; j < data.length; j++) {
                    if (data[j][i].length === 19) {
                        // values are assumed to have a timezone or are used as UTC
                        data[j][i] = data[j][i] + 'Z';
                    }
                    now = new Date(data[j][i]);
                    data[j][i] = now.getFullYear()
                        + "-" + (now.getMonth() < 10 ? '0' : '') + (now.getMonth() + 1)
                        + "-" + (now.getDate() < 10 ? '0' : '') + now.getDate()
                        + " " + (now.getHours() < 10 ? '0' : '') + now.getHours()
                        + ":" + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes()
                        + ":" + (now.getSeconds() < 10 ? '0' : '') + now.getSeconds()
                }
            }
        }
        return data;
    },

    getDatasourceDefinitions: function () {
        $.ajax({
            type: 'GET',
            url: OC.generateUrl('apps/analytics/datasource'),
            success: function (data) {
                OCA.Analytics.datasourceOptions = data['options'];
                OCA.Analytics.datasources = data['datasources'];
            }
        });
    },
};

document.addEventListener('DOMContentLoaded', function () {
    OCA.Analytics.initialDocumentTitle = document.title;
    OCA.Analytics.UI.hideElement('analytics-warning');

    if (document.getElementById('sharingToken').value === '') {
        OCA.Analytics.UI.showElement('analytics-intro');
        OCA.Analytics.Core.initApplication();
    } else {
        OCA.Analytics.Backend.getData();
    }
    if (document.getElementById('advanced').value === 'false') {
        document.getElementById('addFilterIcon').addEventListener('click', OCA.Analytics.Filter.openFilterDialog);
        document.getElementById('reportMenuIcon').addEventListener('click', OCA.Analytics.UI.toggleReportMenu);
        document.getElementById('saveIcon').addEventListener('click', OCA.Analytics.Filter.Backend.updateDataset);
        document.getElementById('drilldownIcon').addEventListener('click', OCA.Analytics.Filter.openDrilldownDialog);
        document.getElementById('chartOptionsIcon').addEventListener('click', OCA.Analytics.Filter.openChartOptionsDialog);

        document.getElementById('analysisIcon').addEventListener('click', OCA.Analytics.UI.showReportMenuAnalysis);
        document.getElementById('trendIcon').addEventListener('click', OCA.Analytics.Functions.trend);
        //document.getElementById('linearRegressionIcon').addEventListener('click', OCA.Analytics.Functions.linearRegression);
        document.getElementById('backIcon').addEventListener('click', OCA.Analytics.UI.showReportMenuMain);
        document.getElementById('downlaodChartIcon').addEventListener('click', OCA.Analytics.UI.downloadChart);
        document.getElementById('chartLegend').addEventListener('click', OCA.Analytics.UI.toggleChartLegend);
    }

    window.addEventListener("beforeprint", function () {
        document.getElementById('chartContainer').style.height = document.getElementById('myChart').style.height;
    });
});