import React from "react";

function joinArrayStrings(component) {
  const { children } = component.props;
  const parts = [];
  let part = "";

  if (Array.isArray(children)) {
    children.map((child) => {
      if (typeof child === "string") {
        part = part + child;
        children.indexOf(child) === children.length - 1 && parts.push(part);
      } else {
        part !== "" && parts.push(part);
        parts.push(child);
        part = "";
      }
    });
  } else parts.push(children);

  return parts;
}

function splitArrayStringsByValue(array, value) {
  let arr = [];

  array.map((el) => {
    if (typeof el === "string" && el?.toLowerCase().includes(value)) {
      let splitEl = splitStringByValue(el, value);
      arr.push(splitEl);
    } else {
      arr.push(el);
    }
  });

  return arr.flat();
}

function splitStringByValue(str, value) {
  return str.split(
    new RegExp(`(${value.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&")})`, "gi")
  );
}

function arrayToMarkedComponent(parts, value) {
  let component = parts.map((part, i) => (
    <React.Fragment key={i}>
      {typeof part === "string" && part?.toLowerCase() === value ? (
        <mark>{part}</mark>
      ) : (
        part
      )}
    </React.Fragment>
  ));

  return component;
}

function returnMarkedComponent(component, value) {
  let componentParts = joinArrayStrings(component);
  componentParts = splitArrayStringsByValue(componentParts, value);
  return arrayToMarkedComponent(componentParts, value);
}

export {
  joinArrayStrings,
  splitArrayStringsByValue,
  splitStringByValue,
  arrayToMarkedComponent,
  returnMarkedComponent,
};
