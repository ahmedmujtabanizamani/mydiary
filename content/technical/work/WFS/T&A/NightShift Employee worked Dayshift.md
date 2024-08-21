+++
title = 'NightShift Employee worked Dayshift'
date = 2024-08-19T01:16:49+05:00
draft = false
tags = ['nightshift', 'crossing-midnight']
+++
## Intro

When Night Shift Employee Try to work in Dayshift Hours this exception will trigger and alert manager about the extra Hours workings.

## Formula Used
- sumTime
- Crossing Midnight
<!--more-->
### Formula Language Code
```javascript
$ESP_JI_VARIABLES(day)$
$ESP_JI_SCHEDULES(day)$

//Overlapping hours
//2024-05-20 - bbumanglag - PG-ISSUE-7012 - updated holiday
var holidaySetUsedDayx = if(isSDFPrev, holidaySetUsedSDF, holidaySetUsed);

// Daily Hours Range
var validDays = !(day.dayOfWeek = FRIDAY OR day.dayOfWeek = SATURDAY);

// After Night Shift Daily Hours Range
var diffStartTime =  {06:00};
var diffEndTime =  {22:00};
var shiftWindowStart = makeDateTime(day + 1, diffStartTime);
var shiftWindowEnd = makeDateTime(day + 1, diffEndTime);
var windowTimeRange = makeDateTimeRange(shiftWindowStart, shiftWindowEnd);

var morningOverlappingHours = sumTime( over day alias x
                                     , var overlapRange = windowTimeRange.overlap(makeDateTimeRange(x.START_DTTM, x.END_DTTM));
                                       var overlapAmount = overlapRange.elapsedHours;
                                       var overlapAmountRounded = round(overlapAmount, 2);
                                       
                                       overlapAmountRounded
                                     , where x.pay_code = "CLOCK" AND
                                             x.START_DTTM <> null AND
                                             x.END_DTTM <> null
                                     );
// PG-ISSUE-7383 - only consider after schedule Hours if >= 25 minutes
var minutesThreshold = 25;
var minutesInDecimal = minutesThreshold / 60;
var minutesInDecimalRounded = round(minutesInDecimal, 2);
var overlapQualification = morningOverlappingHours >= minutesInDecimalRounded;

isJijona
and
isNightShiftEmployees
and
overlapQualification
```
I hope this will help,

Thanks,
