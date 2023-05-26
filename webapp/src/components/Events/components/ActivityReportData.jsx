import { sortObjects } from "services/utils";
import { getEventSeverityDescription } from "services/eventsUtils";

export function getActivityReportData(data, time) {
  let formattedData = `Activity report generated at ${time} \n \n`;

  data
    .sort(sortObjects("timestamp", "id", "descending", parseFloat, parseFloat))
    .map((event) => {
      const severityDesc = getEventSeverityDescription(event.severity);

      formattedData =
        formattedData +
        `${event.device ? `${event.device} \t` : ""}${severityDesc} \t ${
          severityDesc === "Normal" ? `\t ` : "" // fix data misaligment when severity is normal
        } ${event.dateAndTime} \t ${event.desc} \n`;
    });
  return formattedData;
}
