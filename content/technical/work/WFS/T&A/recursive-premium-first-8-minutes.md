+++
title = 'Recursive Premium First 8 Minutes'
date = 2024-08-21T23:15:55+05:00
draft = false
tags = ['recursive-premium', 'context-slice']
+++
## Summary
This premium will discard the Worked hours inside the first 8-minute Handover window.
- it will chop first 8 minutes of the slice.
- then we can assign any paycode for first 8 minutes
    - using replace paycode map tab
    - or even field calculations

## Technical Perspective.
- Type : **recursive Premium.**
- Context : **Slice**
<!--more-->
## Replace Paycode Map formula
### Index#1
- Paycode : `REG`
- Formula
```javascript
var firstScheduleSlice = findFirstSchedule( over day, where PAY_CODE in set COUNTS_AS_SCHEDULED, order by START_DTTM);
var insideHandoverWindowGAPHours = max(START_DTTM.hoursBetween(firstScheduleSlice.START_DTTM), 0);
var handoverWindow = 1/60*8;
var hoursToDeduct = round(handoverWindow - insideHandoverWindowGAPHours, 2);
var workedHours = round(HOURS, 2);

workedHours > hoursToDeduct
```
### Index#2
- Paycode : `REPLACE_ME`
- Formula
```javascript
var firstScheduleSlice = findFirstSchedule( over day, where PAY_CODE in set COUNTS_AS_SCHEDULED, order by START_DTTM);
var insideHandoverWindowGAPHours = max(START_DTTM.hoursBetween(firstScheduleSlice.START_DTTM), 0);
var handoverWindow = 1/60*8;
var hoursToDeduct = round(handoverWindow - insideHandoverWindowGAPHours, 2);
var workedHours = round(HOURS, 2);

workedHours <= hoursToDeduct
```
---
## Qualifications
```javascript
$ESP_JI_VARIABLES(day)$
$ESP_JI_SCHEDULES(day)$

var MODFullTime = isFullTime AND isSplitShiftEmployees;
var MODPartTime = isPartTime AND isSplitShiftEmployees;
var employeeQualifications = isJijonaHourly AND !isSDF AND !isInternPrev AND !isFlexibleInternPrev AND !(MODFullTime OR MODPartTime);
var firstScheduleSlice = findFirstSchedule( over day, where PAY_CODE in set COUNTS_AS_SCHEDULED, order by START_DTTM);
var handoverEligibility = sumTime(over day, DAYS_OFF, where PAY_CODE = "HANDOVER") > 0;
var validPaycode = PAY_CODE in ["REG", "TRAVEL"] OR // PG-ISSUE-7373 - Added TRAVEL
                   ( PAY_CODE in set ESP_JI_EXCEPTION_COUNTS_AS_ABSENCE
                     // AND PAY_CODE <> "PAID_ABSENCE" // PG-ISSUE-7063
                   ); // 2024-03-19 - AMujtaba - PG-QA-3224
var insideHandoverWindow = START_DTTM.minutesBetween(firstScheduleSlice.START_DTTM);
var validInsideHandoverWindow = insideHandoverWindow >= 0 AND insideHandoverWindow <= 8;

employeeQualifications
AND
validPaycode
AND
firstScheduleSlice <> null
AND
validInsideHandoverWindow
```
---
## Value to Reclassify
```javascript
var firstScheduleSlice = findFirstSchedule( over day, where PAY_CODE in set COUNTS_AS_SCHEDULED, order by START_DTTM);
var insideHandoverWindowGAPHours = max(START_DTTM.hoursBetween(firstScheduleSlice.START_DTTM), 0);
var handoverWindow = 1/60*8;
var hoursToDeduct = round(handoverWindow - insideHandoverWindowGAPHours, 2);
var workedHours = round(HOURS, 2);

if( workedHours > hoursToDeduct
  , round(workedHours - hoursToDeduct, 2)
  , workedHours
  )
```
---
## Default Paycode
> `REPLACE_ME `

---
## Qualification to Reclassify
> NA

---
## Field Calculations
### Index#1
- Field : **Paycode**
- Formula 
```javascript
var firstScheduleSlice = findFirstSchedule( over day, where PAY_CODE in set COUNTS_AS_SCHEDULED, order by START_DTTM);
var insideHandoverWindowGAPHours = max(START_DTTM.hoursBetween(firstScheduleSlice.START_DTTM), 0);
var handoverWindow = 1/60*8;
var hoursToDeduct = round(handoverWindow - insideHandoverWindowGAPHours, 2);
var workedHours = round(HOURS, 2);

var isAfterHandover = workedHours > hoursToDeduct;

// Check whether Paycode is worked or Not, if worked then C_TSD_OTHER_TEXT17 will always contain ESP_JI_COUNTS_AS_WORKED paycode. and all worked paycode should be remain REG, all else will became Original Paycode.
if( C_TSD_OTHER_TEXT17 <> ""
  , PAY_CODE
  , if( isAfterHandover
      , ORIGINAL_PAY_CODE
      , "REPLACE_ME" // Discarded Handover 8 Minutes window Hours.
      )
  )
```
### Index#2
- Field : **Original Paycode**
- Formula 
```javascript
// if Paycode is converted to REG before this premium, we used C_TSD_OTHER_TEXT17 to preserve the Original Paycode Value before conversion to REG in ESP_JI_DAILY_REG_HOURS, it will help in Bank Accruals.

if( PAY_CODE = "REG"
  , C_TSD_OTHER_TEXT17
  , ""
  )
```
### Index#3
- Field : **Hours**
- Formula
```javascript
// eliminate Seconds Round only Hours
END_DTTM.hoursBetween(START_DTTM)
```

I hope this will help in understanding of recursive premiums.

Thanks,