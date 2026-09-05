import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchResumeAnalysis } from "../../slices/DashboardSlice";

import Strengths from "../../components/user/dashboard/Strengths";
import Weakness from "../../components/user/dashboard/Weakness";
import Suggestion from "../../components/user/dashboard/Suggestions";
import Skills from "../../components/user/dashboard/Skills";
import AtsSpeedometer from "../../components/user/dashboard/AtsSpeedometor.jsx.jsx";
import MissingSkills from "../../components/user/dashboard/MissingSkills.jsx";

export default function Dashboard() {
  const dispatch = useDispatch();

  const { data,loading} = useSelector((state) => {
    return state.dashboard;
  });

  useEffect(() => {
    dispatch(fetchResumeAnalysis());
  }, [dispatch]);

  if(loading){
    return <p>Loading.....</p>
  }
  return (
    <>
      <h2>Welcome back, {data?.userId?.username || "user"}</h2>
      <h5>Target Role: {data?.roleAnalysis?.role ||"Software Developer"}</h5>
      <AtsSpeedometer />
      <Strengths />
      <Weakness />
      <Suggestion />
      <Skills />
      <MissingSkills />
    </>
  );
}