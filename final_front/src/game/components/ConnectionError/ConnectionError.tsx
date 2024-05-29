import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ConnectionError.css";
import { PATHS } from "../../constants/paths";

interface ErrorConnectionProps {
  reason: string;
}

export default function ErrorConnection({ reason }: ErrorConnectionProps) {
  const [visible, setVisible] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      navigate(PATHS.DEFAULT_GAME_PAGE);
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return visible ? (
    <div className="errorCard">
      <h1>Failed!</h1>
      <h3>{reason}</h3>
    </div>
  ) : null;
}
