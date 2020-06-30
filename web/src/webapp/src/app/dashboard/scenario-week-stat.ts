

export class ScenarioWeekStat{

  dt: number; // start of week
  duration: number; // total duration in sec.
  distance: number; // total distance in m.
  poiCount: number; // number of visited POI
}

export class ScenarioRegularityStat{

  name: string; // hr lastname / firstname
  value: number; // time of day
  dt:number; // day
}

export class regularityDetails{
  name: string;
  details: ScenarioRegularityStat[];
}

export class ScenarioRegularityGroupStat{
  ampm: string;
  difference: number; // "5 / 10 / 15 / ... in minutes"
  count: number;
}