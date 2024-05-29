import "./ProgressBar.css";

interface ProgressBarProps {
  progress: number;
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="progressBar">
      {" "}
      <div
        className="progressBarFill"
        style={{ width: `${progress}%` }}
      ></div>{" "}
    </div>
  );
}
