import React from "react";
import { css } from "@emotion/react";
import ScaleLoader from "react-spinners/ScaleLoader";

const Spinner = (loading) => {
  const override = css`
    display: block;
    margin: 0 auto;
    border-color: gray;
  `;

  return (
    <ScaleLoader color="gray" loading={loading} css={override} size={250} />
  );
};

export default Spinner;
