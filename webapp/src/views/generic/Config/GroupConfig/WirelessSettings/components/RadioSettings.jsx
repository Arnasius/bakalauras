import React, { useState, useEffect } from "react";
import { radioLabels } from "services/text";
import { Row, Col, Card, CardHeader, CardBody } from "reactstrap";
import SelectField from "components/Fields/SelectField";
import MultiSelectField from "components/Fields/MultiSelectField";
import RangeField from "components/Fields/RangeField";

export default function RadioSettings({
  radio,
  values,
  handleChange,
  config,
  setConfig,
  disabled,
}) {
  const [channels, setChannels] = useState(values[radio]?.channel);

  useEffect(() => {
    if (values[radio]?.channel) {
      setChannels(values[radio]?.channel);
    }
  }, [values[radio]?.channel]);

  useEffect(() => {
    setConfig({
      ...config,
      config: {
        ...config.config,
        radio: {
          ...config.config.radio,
          [radio]: {
            ...config.config.radio[radio],
            channel: channels,
          },
        },
      },
    });
  }, [channels]);

  const filterUniqueChannels = (channels) => {
    return channels.filter((channel, index) => {
      return channels.map((chan) => chan.freq).indexOf(channel.freq) === index;
    });
  };

  const getChannelOptions = () => {
    let channel = channels;
    let initChannels;
    if (radio == "wifi0") initChannels = channels_5g_1;
    else if (radio == "wifi1") initChannels = channels_2g;
    else initChannels = channels_5g_2;
    initChannels = initChannels.length
      ? filterUniqueChannels(initChannels)
      : {};
    let channelOptions = [{ value: "auto", name: "Auto" }];
    if (initChannels.length) {
      initChannels.map((channel) =>
        channelOptions.push({
          value: channel.chan,
          name: `${channel.chan} (${channel.freq} MHz)`,
        })
      );
    } else if (channel && channel.length) {
      channel.sort().map((channel) =>
        channelOptions.push({
          value: channel,
          name: channel,
        })
      );
    }
    return {
      0: channelOptions,
    };
  };

  const channelOptions = getChannelOptions();

  const handleChannelChange = (value, e) => {
    const { checked, name } = e.target;
    const channel = channels;
    let selected = [];
    if (!checked) {
      selected = channel.filter((value) => value !== Number(name));
    } else if (value !== "auto") {
      selected = [...channel, Number(value)];
    }
    setChannels(selected.map((x) => Number(x)));
  };

  return (
    <>
      <Card className="col-lg-6 no-right-border-lg">
        <CardHeader className="label">
          {radioLabels(radio)} configuration
        </CardHeader>
        <CardBody>
          <Row>
            <Col>
              <SelectField
                name={`config.radio.${radio}.channel_width`}
                label="Channel width"
                value={values?.[radio].channel_width || ""}
                options={widths[radio]}
                onChange={handleChange}
                getOption={(val) => {
                  return val + " MHz";
                }}
                disabled={disabled}
              />
            </Col>
            <Col>
              <MultiSelectField
                list={
                  values?.[radio]?.channel?.length
                    ? values?.[radio]?.channel?.map((x) => x?.toString())
                    : ["auto"]
                }
                data={channelOptions}
                defaultValue={
                  values?.[radio]?.channel?.length
                    ? values?.[radio]?.channel[0]?.toString()
                    : "auto"
                }
                changeValue={handleChannelChange}
                selectClass="multi-block my-0"
                name="Channel"
                allowEmpty
                disabled={disabled}
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <RangeField
                name={`config.radio.${radio}.tx_power`}
                blockClass="m-0"
                label="Tx power (dBm)"
                min="5"
                max="30"
                value={values?.[radio].tx_power || ""}
                onChange={handleChange}
                disabled={disabled}
              />
            </Col>
          </Row>
        </CardBody>
      </Card>
    </>
  );
}

const widths = {
  wifi0: ["20", "40", "80"],
  wifi1: ["20", "40"],
  wifi2: ["20", "40", "80", "160"],
};
let channels_5g_1 = [
  {
    chan: 36,
    dfs: false,
    eirp: 23,
    freq: 5180,
    max: 63,
    min: 63,
    mode: "80",
    passive: true,
  },
  {
    chan: 40,
    dfs: false,
    eirp: 23,
    freq: 5200,
    max: 63,
    min: 63,
    mode: "80",
    passive: true,
  },
  {
    chan: 44,
    dfs: false,
    eirp: 23,
    freq: 5220,
    max: 63,
    min: 63,
    mode: "80",
    passive: true,
  },
  {
    chan: 48,
    dfs: false,
    eirp: 23,
    freq: 5240,
    max: 63,
    min: 63,
    mode: "80",
    passive: true,
  },
  {
    chan: 52,
    dfs: true,
    eirp: 23,
    freq: 5260,
    max: 63,
    min: 63,
    mode: "80",
    passive: true,
  },
  {
    chan: 56,
    dfs: true,
    eirp: 23,
    freq: 5280,
    max: 63,
    min: 63,
    mode: "80",
    passive: true,
  },
  {
    chan: 60,
    dfs: true,
    eirp: 23,
    freq: 5300,
    max: 63,
    min: 63,
    mode: "80",
    passive: true,
  },
  {
    chan: 64,
    dfs: true,
    eirp: 23,
    freq: 5320,
    max: 63,
    min: 63,
    mode: "80",
    passive: true,
  },
];
let channels_5g_2 = [
  {
    chan: 100,
    dfs: true,
    eirp: 30,
    freq: 5500,
    max: 63,
    min: 63,
    mode: "80",
    passive: true,
  },
  {
    chan: 104,
    dfs: true,
    eirp: 30,
    freq: 5520,
    max: 63,
    min: 63,
    mode: "80",
    passive: true,
  },
  {
    chan: 108,
    dfs: true,
    eirp: 30,
    freq: 5540,
    max: 63,
    min: 63,
    mode: "80",
    passive: true,
  },
  {
    chan: 112,
    dfs: true,
    eirp: 30,
    freq: 5560,
    max: 63,
    min: 63,
    mode: "80",
    passive: true,
  },
  {
    chan: 116,
    dfs: true,
    eirp: 30,
    freq: 5580,
    max: 63,
    min: 63,
    mode: "80",
    passive: true,
  },
  {
    chan: 120,
    dfs: true,
    eirp: 30,
    freq: 5600,
    max: 63,
    min: 63,
    mode: "80",
    passive: true,
  },
  {
    chan: 124,
    dfs: true,
    eirp: 30,
    freq: 5620,
    max: 63,
    min: 63,
    mode: "80",
    passive: true,
  },
  {
    chan: 128,
    dfs: true,
    eirp: 30,
    freq: 5640,
    max: 63,
    min: 63,
    mode: "80",
    passive: true,
  },
  {
    chan: 132,
    dfs: true,
    eirp: 30,
    freq: 5660,
    max: 63,
    min: 63,
    mode: "40+",
    passive: true,
  },
  {
    chan: 136,
    dfs: true,
    eirp: 30,
    freq: 5680,
    max: 63,
    min: 63,
    mode: "40-",
    passive: true,
  },
  {
    chan: 140,
    dfs: true,
    eirp: 30,
    freq: 5700,
    max: 63,
    min: 63,
    mode: "20",
    passive: true,
  },
];

let channels_2g = [
  {
    chan: 1,
    dfs: false,
    eirp: 20,
    freq: 2412,
    max: 20,
    min: 0,
    mode: "20",
    passive: false,
  },
  {
    chan: 1,
    dfs: false,
    eirp: 20,
    freq: 2412,
    max: 20,
    min: 0,
    mode: "40+",
    passive: false,
  },
  {
    chan: 2,
    dfs: false,
    eirp: 20,
    freq: 2417,
    max: 20,
    min: 0,
    mode: "20",
    passive: false,
  },
  {
    chan: 2,
    dfs: false,
    eirp: 20,
    freq: 2417,
    max: 20,
    min: 0,
    mode: "40+",
    passive: false,
  },
  {
    chan: 3,
    dfs: false,
    eirp: 20,
    freq: 2422,
    max: 20,
    min: 0,
    mode: "20",
    passive: false,
  },
  {
    chan: 3,
    dfs: false,
    eirp: 20,
    freq: 2422,
    max: 20,
    min: 0,
    mode: "40+",
    passive: false,
  },
  {
    chan: 4,
    dfs: false,
    eirp: 20,
    freq: 2427,
    max: 20,
    min: 0,
    mode: "20",
    passive: false,
  },
  {
    chan: 4,
    dfs: false,
    eirp: 20,
    freq: 2427,
    max: 20,
    min: 0,
    mode: "40+",
    passive: false,
  },
  {
    chan: 5,
    dfs: false,
    eirp: 20,
    freq: 2432,
    max: 20,
    min: 0,
    mode: "20",
    passive: false,
  },
  {
    chan: 5,
    dfs: false,
    eirp: 20,
    freq: 2432,
    max: 20,
    min: 0,
    mode: "40+",
    passive: false,
  },
  {
    chan: 5,
    dfs: false,
    eirp: 20,
    freq: 2432,
    max: 20,
    min: 0,
    mode: "40-",
    passive: false,
  },
  {
    chan: 6,
    dfs: false,
    eirp: 20,
    freq: 2437,
    max: 20,
    min: 0,
    mode: "20",
    passive: false,
  },
  {
    chan: 6,
    dfs: false,
    eirp: 20,
    freq: 2437,
    max: 20,
    min: 0,
    mode: "40+",
    passive: false,
  },
  {
    chan: 6,
    dfs: false,
    eirp: 20,
    freq: 2437,
    max: 20,
    min: 0,
    mode: "40-",
    passive: false,
  },
  {
    chan: 7,
    dfs: false,
    eirp: 20,
    freq: 2442,
    max: 20,
    min: 0,
    mode: "20",
    passive: false,
  },
  {
    chan: 7,
    dfs: false,
    eirp: 20,
    freq: 2442,
    max: 20,
    min: 0,
    mode: "40+",
    passive: false,
  },
  {
    chan: 7,
    dfs: false,
    eirp: 20,
    freq: 2442,
    max: 20,
    min: 0,
    mode: "40-",
    passive: false,
  },
  {
    chan: 8,
    dfs: false,
    eirp: 20,
    freq: 2447,
    max: 20,
    min: 0,
    mode: "20",
    passive: false,
  },
  {
    chan: 8,
    dfs: false,
    eirp: 20,
    freq: 2447,
    max: 20,
    min: 0,
    mode: "40+",
    passive: false,
  },
  {
    chan: 8,
    dfs: false,
    eirp: 20,
    freq: 2447,
    max: 20,
    min: 0,
    mode: "40-",
    passive: false,
  },
  {
    chan: 9,
    dfs: false,
    eirp: 20,
    freq: 2452,
    max: 20,
    min: 0,
    mode: "20",
    passive: false,
  },
  {
    chan: 9,
    dfs: false,
    eirp: 20,
    freq: 2452,
    max: 20,
    min: 0,
    mode: "40+",
    passive: false,
  },
  {
    chan: 9,
    dfs: false,
    eirp: 20,
    freq: 2452,
    max: 20,
    min: 0,
    mode: "40-",
    passive: false,
  },
  {
    chan: 10,
    dfs: false,
    eirp: 20,
    freq: 2457,
    max: 20,
    min: 0,
    mode: "20",
    passive: false,
  },
  {
    chan: 10,
    dfs: false,
    eirp: 20,
    freq: 2457,
    max: 20,
    min: 0,
    mode: "40-",
    passive: false,
  },
  {
    chan: 11,
    dfs: false,
    eirp: 20,
    freq: 2462,
    max: 20,
    min: 0,
    mode: "20",
    passive: false,
  },
  {
    chan: 11,
    dfs: false,
    eirp: 20,
    freq: 2462,
    max: 20,
    min: 0,
    mode: "40-",
    passive: false,
  },
  {
    chan: 12,
    dfs: false,
    eirp: 20,
    freq: 2467,
    max: 20,
    min: 0,
    mode: "20",
    passive: false,
  },
  {
    chan: 12,
    dfs: false,
    eirp: 20,
    freq: 2467,
    max: 20,
    min: 0,
    mode: "40-",
    passive: false,
  },
  {
    chan: 13,
    dfs: false,
    eirp: 20,
    freq: 2472,
    max: 20,
    min: 0,
    mode: "20",
    passive: false,
  },
  {
    chan: 13,
    dfs: false,
    eirp: 20,
    freq: 2472,
    max: 20,
    min: 0,
    mode: "40-",
    passive: false,
  },
];
