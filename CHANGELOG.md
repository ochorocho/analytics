# Changelog

## 3.5.0 - 2021-05-xx
### Added

- UI cleanups [#138](https://github.com/rello/analytics/issues/138)
- Report: Save logic also for chart options [#123](https://github.com/rello/analytics/issues/123)
- Report: Same filter logic for all data sources [#139](https://github.com/rello/analytics/issues/139)
- Report: Download chart as image [#143](https://github.com/rello/analytics/issues/143)
- Datasource: overwrite column with custom text [#131](https://github.com/rello/analytics/issues/131)

### Changed

- Migration to Chart.js V.3 [#140](https://github.com/rello/analytics/issues/140)
- Update ru language @[sibergad](https://github.com/sibergad) @[AleksovAnry](https://github.com/AleksovAnry)
- New key in l10n [#129](https://github.com/rello/analytics/issues/129)

### Fixed

- workflow not working
- Report: handle spaces in filters
- Issues with bulk data upload [#136](https://github.com/rello/analytics/issues/136)
- occ command error [#130](https://github.com/rello/analytics/issues/130)
- Error when sharing xlsx report [#133](https://github.com/rello/analytics/issues/133)

## 3.4.1 - 2021-03-14

### Fixed

- First start wizard showing every time #132

## 3.4.0 - 2021-03-13

### Added

- Datasource: Spreadsheet (xls, xlsx, ods) [#115](https://github.com/rello/analytics/issues/115)

### Changed
- Displayed date & time in UTC [#54](https://github.com/rello/analytics/issues/54)
- Improve robustness of data load (empty data) [#112](https://github.com/rello/analytics/issues/112)
- Usability when creating new reports
- UI improvements
- Share link to clipboard and not new window
- Filter usability enhancements [#122](https://github.com/rello/analytics/issues/122)

### Fixed
- Sharing link not working [#121](https://github.com/rello/analytics/issues/121)
- "Limit to groups" not working [#73](https://github.com/rello/analytics/issues/73)
- Dashboard icon missing
- Float numbers in graph tooltips [#117](https://github.com/rello/analytics/issues/117)
- High CPU load during dataloads [#118](https://github.com/rello/analytics/issues/118)
- sharing "can modify" does not show the current status. [#125](https://github.com/rello/analytics/issues/125)

## 3.3.3 - 2021-02-24

### Fixed

- Database issue on NC21 installation [#113](https://github.com/rello/analytics/issues/113)

## 3.3.2 - 2021-02-17

### Fixed

- Dataload issue with "External file" [#110](https://github.com/rello/analytics/issues/110)

## 3.3.0 - 2021-02-13
### Added
- First Start Wizzard [#103](https://github.com/rello/analytics/issues/103)
- Export / import reports (incl data) [#100](https://github.com/rello/analytics/issues/100)
- Parameter to skip header rows in csv and file datasource [#97](https://github.com/rello/analytics/issues/97)
- Allow multiple paths in one JSON load [wiki](https://github.com/Rello/analytics/wiki/Datasource:-JSON)
- Favorite also for shared reports [#107](https://github.com/rello/analytics/issues/107)
- Various UI cleanups and performance enhancements

### Fixed
- SQL error for shared reports [#98](https://github.com/rello/analytics/issues/98)
- Datasource options field in DB too short [#78](https://github.com/rello/analytics/issues/78)
- JSON source not adding timestamp [#106](https://github.com/rello/analytics/issues/106)
- Error in occ- and scheduled load [#109](https://github.com/rello/analytics/issues/109)

## 3.2.0 - 2021-01-02
### Added
- Allow filter-permissions on shared reports [#77](https://github.com/rello/analytics/issues/77)
- NC21
- delete option in report menu

### Changed
- Filter changes are not persisted automatically [#94](https://github.com/rello/analytics/issues/94)
- Disable dataload for non-internal reports [#74](https://github.com/rello/analytics/issues/74)
- more flexible clipboard import
- don´t load dashboard when accessing report directly

### Fixed
- Favorites dashboard not showing in app startscreen
- Missing language keys [#86](https://github.com/rello/analytics/issues/86)
  @[AleksovAnry](https://github.com/AleksovAnry)
- fr translations [#92](https://github.com/rello/analytics/issues/92)
  @[simmstein](https://github.com/simmstein)
- wording corrections
- shared reports showing multiple times
- image path for alternative app folder
- Advanced: Dataload tab does not load [#79](https://github.com/rello/analytics/issues/79)

## 3.1.0 - 2020-12-02
### Added
- event to register external datasources [#71](https://github.com/rello/analytics/issues/71)
- better datasource config using dropdowns

### Fixed
- share token not generated
- Chart: tooltips not showing
- an error occurred while using NC search [#70](https://github.com/rello/analytics/issues/70)
- database issue for shared reports [#69](https://github.com/rello/analytics/issues/69)
- dashboard error when widget not enabled

## 3.0.0 - 2020-10-01
### Added
- NC20 
- NC20 Dashboard Widget [#61](https://github.com/rello/analytics/issues/61)
- NC20 Search integration [#66](https://github.com/rello/analytics/issues/66)
- Sharing: user + groups [#60](https://github.com/rello/analytics/issues/60)
- API: use display names for upload [#58](https://github.com/rello/analytics/issues/58)
- API: accepting arrays [#55](https://github.com/rello/analytics/issues/55)
- API: delete data [#56](https://github.com/rello/analytics/issues/56)
- Report: mark reports as favorite [#63](https://github.com/rello/analytics/issues/63)
- translation: ru, ru_RU @[AleksovAnry](https://github.com/AleksovAnry)
- translations: fr [#67](https://github.com/rello/analytics/issues/67) @[simmstein](https://github.com/simmstein)
- headers for RegEx datasource @[AleksovAnry](https://github.com/AleksovAnry)
- Dataload: Purge Dataset [#47](https://github.com/rello/analytics/issues/47)

### Changed
- Enhanced datamodel [#59](https://github.com/rello/analytics/issues/59)
- new app icon

### Fixed
- Floating point numbers rounded off in Rest API calls [#57](https://github.com/rello/analytics/issues/57)

## 2.5.0 - 2020-10-01
### Added
- Sharing: user + groups [#60](https://github.com/rello/analytics/issues/60)
- API: use display names for upload [#58](https://github.com/rello/analytics/issues/58)
- API: accepting arrays [#55](https://github.com/rello/analytics/issues/55)
- API: delete data [#56](https://github.com/rello/analytics/issues/56)
- Report: mark reports as favorite [#63](https://github.com/rello/analytics/issues/63)
- translation: ru, ru_RU @[AleksovAnry](https://github.com/AleksovAnry)
- translation: fr [#67](https://github.com/rello/analytics/issues/67) @[simmstein](https://github.com/simmstein)
- headers for RegEx datasource @[AleksovAnry](https://github.com/AleksovAnry)
- Dataload: Purge Dataset [#47](https://github.com/rello/analytics/issues/47)

### Changed
- Enhanced datamodel [#59](https://github.com/rello/analytics/issues/59)
- new app icon

### Fixed
- Floating point numbers rounded off in Rest API calls [#57](https://github.com/rello/analytics/issues/57)

## 2.4.1 - 2020-07-10
### Fixed
- DB index too long

## 2.4.0 - 2020-07-09
### Added
- WhatsNew popup [#43](https://github.com/rello/analytics/issues/43)
- Chart: customisation per data-series [#44](https://github.com/rello/analytics/issues/44)
- Chart: combined charts [#44](https://github.com/rello/analytics/issues/44)
- Chart: secondary axis [#36](https://github.com/rello/analytics/issues/36)
- Report: persist filters [#36](https://github.com/rello/analytics/issues/36)

### Changed
- migration to QueryBuilder
- migration from database.xml to /Migration
- cleanup notification messages

## 2.3.1 - 2020-05-07
### Fixed
- various css improvements

## 2.3.0 - 2020-05-06
### Added
- Enable filters in reports [#41](https://github.com/rello/analytics/issues/41)

### Changed
- avoid multiple notifications for same threshold by replacing old ones
- shorten app name to 'Analytics'

### Fixed
- Thresholds not working in table [#39](https://github.com/rello/analytics/issues/39)
- Thresholds not accepting commas

## 2.2.3 - 2020-04-27
### Fixed
- appstore certificate issue

## 2.2.2 - 2020-04-27
### Fixed
- appstore certificate issue

## 2.2.1 - 2020-04-12
### Fixed
- advanced settings not showing

### Added
- NC19

## 2.2.0 - 2020-04-05
### Added
- chart type: doughnut
- advanced chart options [#30](https://github.com/rello/analytics/issues/30)
- print report layout [#34](https://github.com/rello/analytics/issues/34)

### Fixed
- handle German date format in input form
- regex not working - options field too short [#31](https://github.com/rello/analytics/issues/31)
- frontend doesn't respect the users timezone [#17](https://github.com/rello/analytics/issues/17)
- donate button [#35](https://github.com/rello/analytics/issues/35)

## 2.1.1 - 2020-03-12
### Fixed
- shorten notification text to fit iOS push banner
- double category labels [#28](https://github.com/rello/analytics/issues/28)
- column mismatch in dataload for git datasource
- data deletion simulation display bug

## 2.1.0 - 2020-03-11
### Added
- Datasource: JSON [#21](https://github.com/rello/analytics/issues/21) (e.g. [NC monitoring](https://github.com/Rello/analytics/wiki/Datasource:-JSON))
- occ command for executing dataloads [#16](https://github.com/rello/analytics/issues/16)
- Data deletion with wildcards
- Compatible with dark theme [#11](https://github.com/rello/analytics/issues/11)

### Changed
- Exchange Highcharts with Charts.js [#23](https://github.com/rello/analytics/issues/23)

### Fixed
- Removed incorrect error logs in API
- Notification parsed subject

## 2.0.0 - 2020-01-17
### Added
- NC 18 Flow integration [#10](https://github.com/rello/analytics/issues/10)
- Enhanced dataloads with scheduling [#13](https://github.com/rello/analytics/issues/13)
- Advanced configuration page for more options than sidebar [#12](https://github.com/rello/analytics/issues/12)
- Datasource: website grabber [#14](https://github.com/rello/analytics/issues/14)
- Thresholds for all datasource types (notifications just for database)
- Compatibility dark mode [#11](https://github.com/rello/analytics/issues/11)
- [Wiki](https://github.com/Rello/analytics/wiki)

### Changed
- link report in activity message
- redesign of backend (controllers; mappers)

### Fixed
- XSS risk in innerHTML

### Removed
- NC16

## 1.2.2 - 2019-12-15
### Fixed
- Notification missing setParsedSubject

## 1.2.1 - 2019-12-15
### Fixed
- Activity not always reported
- Notification pushed to wrong user
- Thresholds not read for external report types [#9](https://github.com/rello/analytics/issues/9)
- Notifications icon path

## 1.2.0 - 2019-12-14
### Added
- Thresholds: NC Notification and color coding [#5](https://github.com/rello/analytics/issues/5)

## 1.1.0 - 2019-12-05
### Added
- 'de' language files
- currency/unit formatting in datatable column
- CSV import format validation [#7](https://github.com/rello/analytics/issues/7)
- Assets blocked by uBlock origin [#8](https://github.com/rello/analytics/issues/8)
- favicon
- direct url to report
- chart type: area stacked

## 1.0.0 - 2019-12-01
### Added
- Initial version of Data Analytics