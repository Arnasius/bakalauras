import React, { useState } from "react";
import { Button } from "reactstrap";

function UploadFile(props) {
  const [fileName, setFileName] = useState("");
  const hiddenFileInput = React.useRef(null);

  const handleChange = (event) => {
    setFileName(event.target.files[0].name);

    const formData = new FormData();
    formData.append("file", event.target.files[0]);

    fetch("/api/server/certs", {
      method: "POST",
      body: formData,
      credentials: "same-origin",
    })
      .then((success) => {
        console.info(success);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleClick = () => {
    hiddenFileInput.current.click();
  };

  return (
    <>
      {fileName !== "" && <label>Uploaded file: {fileName}</label>}
      <Button color="primary" onClick={handleClick}>
        {props.name}
      </Button>
      <input
        type="file"
        ref={hiddenFileInput}
        onChange={handleChange}
        style={{ display: "none" }}
      />
    </>
  );
}

export default UploadFile;
