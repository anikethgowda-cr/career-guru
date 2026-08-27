import { useSelector } from "react-redux";

export default function AtsSpeedometer() {
  const {data,loading,serverError}=useSelector((state)=>{
    return state.dashboard
  })

  const score=data?.roleAnalysis?.atsScore

  const validatedScore = Math.min(
    Math.max(Math.round(Number(score) || 0), 0),
    100
  );

  const needleRotation =
    (validatedScore / 100) * 180 - 90;

  let themeColor;
  let badgeText;

  if (validatedScore >= 75) {
    themeColor = "#10b981";
    badgeText = "Strong Fit";
  } else if (validatedScore >= 45) {
    themeColor = "#f59e0b";
    badgeText = "Moderate Fit";
  } else {
    themeColor = "#ef4444";
    badgeText = "Weak Fit";
  }

  const radius = 90;
  const circumference = Math.PI * radius;

  const filledLength =
    (validatedScore / 100) * circumference;

  const styles = {
    card: {
      display: "inline-flex",
      flexDirection: "column",
      alignItems: "center",
      backgroundColor: "#000000",
      border: "1px solid #27272a",
      padding: "24px",
      borderRadius: "16px",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      width: "260px",
    },

    header: {
      fontSize: "13px",
      fontWeight: "600",
      color: "#d4d4d8",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      marginBottom: "15px",
    },

    gaugeContainer: {
      position: "relative",
      width: "220px",
      height: "175px",
    },

    svg: {
      position: "absolute",
      top: "0",
      left: "0",
      width: "220px",
      height: "110px",
      overflow: "visible",
    },

    needle: {
      position: "absolute",
      bottom: "65px",
      left: "50%",
      width: "4px",
      height: "82px",
      backgroundColor: "#ffffff",
      borderRadius: "4px",
      transformOrigin: "bottom center",
      transform: `translateX(-50%) rotate(${needleRotation}deg)`,
      transition:
        "transform 1s cubic-bezier(0.34, 1.56, 0.64, 1)",
      zIndex: 3,
    },

    centerHub: {
      position: "absolute",
      bottom: "57px",
      left: "50%",
      transform: "translateX(-50%)",
      width: "18px",
      height: "18px",
      backgroundColor: "#ffffff",
      border: "3px solid #000000",
      borderRadius: "50%",
      boxShadow: "0 2px 6px rgba(255, 255, 255, 0.2)",
      zIndex: 4,
    },

    readout: {
      position: "absolute",
      bottom: "8px",
      left: "0",
      width: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "baseline",
    },

    scoreNumber: {
      fontSize: "36px",
      fontWeight: "800",
      color: themeColor,
      lineHeight: "1",
    },

    scoreUnit: {
      fontSize: "18px",
      fontWeight: "700",
      color: themeColor,
      marginLeft: "2px",
    },

    badge: {
      fontSize: "12px",
      fontWeight: "700",
      letterSpacing: "0.025em",
      padding: "7px 16px",
      borderRadius: "9999px",
      textTransform: "uppercase",
      color: "#ffffff",
      backgroundColor: themeColor,
      transition: "background-color 0.5s ease",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
    },
  };

  return (
    <div style={styles.card}>

      <div style={styles.header}>
        ATS Match Score
      </div>

      <div style={styles.gaugeContainer}>

        <svg
          style={styles.svg}
          viewBox="0 0 220 110"
        >
          {/* Remaining meter */}
          <path
            d="M 20 100 A 90 90 0 0 1 200 100"
            fill="none"
            stroke="#3f3f46"
            strokeWidth="14"
            strokeLinecap="round"
          />

          {/* Filled meter */}
          <path
            d="M 20 100 A 90 90 0 0 1 200 100"
            fill="none"
            stroke={themeColor}
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={`${filledLength} ${circumference}`}
            style={{
              transition:
                "stroke-dasharray 1s ease, stroke 0.5s ease",
            }}
          />
        </svg>

        {/* Needle */}
        <div style={styles.needle}></div>

        {/* Center */}
        <div style={styles.centerHub}></div>

        {/* Score */}
        <div style={styles.readout}>
          <span style={styles.scoreNumber}>
            {validatedScore}
          </span>

          <span style={styles.scoreUnit}>
            %
          </span>
        </div>
      </div>

      {/* Fit badge */}
      <div style={styles.badge}>
        {badgeText}
      </div>

    </div>
  );
}