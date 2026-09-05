import { useSelector } from "react-redux";

export default function Strengths() {
  const { data, serverError } = useSelector(
    (state) => state.dashboard
  );

  return (
    <>
      <h3 style={{ color: "lightgreen" }}>Strengths</h3>

      {serverError && <p style={{ color: "red" }}>{serverError.status} - {serverError.message}</p>}

      <ol style={{ color: "lightgreen" }}>
        {data?.roleAnalysis?.strengths?.map((strength, index) => (
          <li key={index}>{strength}</li>
        ))}
      </ol>
    </>
  );
}