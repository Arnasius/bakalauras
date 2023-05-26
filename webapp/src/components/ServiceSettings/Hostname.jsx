import React from "react";

import { isHostName } from "services/validation";

import GenericInputField from "components/Fields/GenericInputField";

export default function Hostname({
  name,
  value,
  onChange,
  track,
  makeLabel,
  label,
  disabled,
  validate,
}) {
  return (
    <GenericInputField
      disabled={disabled}
      type="text"
      name={name || "hostname"}
      label={label || null}
      validate={validate || isHostName}
      value={value}
      onChange={onChange}
      track={track}
      makeLabel={makeLabel}
    />
  );
}
